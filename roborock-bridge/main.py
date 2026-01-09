"""
Roborock HTTP Bridge
FastAPI server using python-roborock LocalChannel for pure local vacuum control.
No cloud connectivity required.
"""

import asyncio
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from roborock.devices.transport.local_channel import LocalChannel
from roborock.protocols.v1_protocol import (
    RequestMessage,
    decode_rpc_response,
)
from roborock.roborock_message import RoborockMessage, RoborockMessageProtocol

# Config from environment (local only - no cloud needed)
DEVICE_NAME = os.environ.get("ROBOROCK_DEVICE_NAME", "Vacuum")
DEVICE_ID = os.environ.get("ROBOROCK_DEVICE_ID", "")
DEVICE_IP = os.environ.get("ROBOROCK_DEVICE_IP", "")
DEVICE_LOCAL_KEY = os.environ.get("ROBOROCK_LOCAL_KEY", "")
ROBOROCK_PORT = int(os.environ.get("ROBOROCK_PORT", "3002"))

# Global channel
channel: LocalChannel | None = None
channel_lock = asyncio.Lock()


class CommandRequest(BaseModel):
    cmd: str


class VolumeRequest(BaseModel):
    volume: int


class FanSpeedRequest(BaseModel):
    mode: int


class MopModeRequest(BaseModel):
    mode: int


class CleanSegmentsRequest(BaseModel):
    segments: list[int]


class ResetConsumableRequest(BaseModel):
    consumable: str


# Room name mapping (segment ID -> name)
ROOM_NAMES = {
    16: "Living Room",
    17: "Kitchen",
    18: "Hallway",
    19: "Bathroom",
    20: "Bedroom",
    21: "Office",
    22: "Kids Room",
}


async def get_channel() -> LocalChannel:
    """Get or create local channel."""
    global channel
    async with channel_lock:
        if channel is None or not channel.is_connected:
            if not DEVICE_IP or not DEVICE_LOCAL_KEY or not DEVICE_ID:
                raise HTTPException(503, "Missing device configuration (IP, LOCAL_KEY, or DEVICE_ID)")
            channel = LocalChannel(
                host=DEVICE_IP,
                local_key=DEVICE_LOCAL_KEY,
                device_uid=DEVICE_ID,
            )
            await channel.connect()
            print(f"Connected to device at {DEVICE_IP}")
        return channel


async def send_command(method: str, params: list | dict | None = None) -> dict | list | None:
    """Send command and get response using library's protocol."""
    ch = await get_channel()

    # Create request using library's RequestMessage
    request = RequestMessage(method=method, params=params)

    # Encode for local transport using GENERAL_REQUEST protocol
    message = request.encode_message(
        RoborockMessageProtocol.GENERAL_REQUEST,
        version=ch.protocol_version,
    )

    # Create response future
    response_future: asyncio.Future = asyncio.Future()

    def on_response(resp_msg: RoborockMessage):
        try:
            # Decode using library's decoder
            decoded = decode_rpc_response(resp_msg)
            if decoded is None:
                return
            # Match by request_id in payload
            if decoded.request_id == request.request_id:
                if decoded.api_error:
                    response_future.set_exception(decoded.api_error)
                elif not response_future.done():
                    response_future.set_result(decoded.data)
        except Exception as e:
            # Not our message, ignore
            print(f"Decode error (ignoring): {e}")

    # Subscribe returns unsubscribe function
    unsub = await ch.subscribe(on_response)
    try:
        await ch.publish(message)
        # Wait for response with timeout
        result = await asyncio.wait_for(response_future, timeout=10.0)
        return result
    except asyncio.TimeoutError:
        raise HTTPException(504, "Device timeout")
    finally:
        unsub()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Roborock LOCAL bridge starting for device: {DEVICE_NAME}")
    print(f"  Device ID: {DEVICE_ID}")
    print(f"  IP: {DEVICE_IP}")
    print("  Mode: Pure local (no cloud)")
    yield
    global channel
    if channel:
        channel.close()


app = FastAPI(title="Roborock Bridge (Local)", lifespan=lifespan)


@app.get("/status")
async def get_status():
    """Get vacuum status - returns camelCase for frontend compatibility"""
    try:
        result = await send_command("get_status")
        if result is None:
            raise HTTPException(500, "No response from device")

        # Parse status response
        status = result[0] if isinstance(result, list) and result else result

        # Return camelCase format for frontend
        return {
            "state": status.get("state", 0),
            "battery": status.get("battery", 0),
            "fanPower": status.get("fan_power", 0),
            "waterBoxMode": status.get("water_box_mode", 0),
            "errorCode": status.get("error_code", 0),
            "cleanTime": status.get("clean_time", 0),
            "cleanArea": status.get("clean_area", 0),
            "inCleaning": status.get("in_cleaning", 0),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Status error: {e}")
        raise HTTPException(500, f"Failed to get status: {e}")


@app.post("/command")
async def api_send_command(req: CommandRequest):
    """Send command to vacuum"""
    cmd_map = {
        "start": "app_start",
        "pause": "app_pause",
        "stop": "app_stop",
        "home": "app_charge",
        "find": "find_me",
    }

    method = cmd_map.get(req.cmd)
    if not method:
        raise HTTPException(400, f"Unknown command: {req.cmd}")

    try:
        await send_command(method)
        return {"success": True, "command": req.cmd}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Command error: {e}")
        raise HTTPException(500, f"Failed to run {req.cmd}: {e}")


@app.get("/clean-summary")
async def get_clean_summary():
    """Get cleaning summary"""
    try:
        result = await send_command("get_clean_summary")
        if result is None:
            return {"cleanTime": 0, "cleanArea": 0, "cleanCount": 0}

        # Result can be [total_time, total_area, clean_count, records...]
        if isinstance(result, list) and len(result) >= 3:
            return {
                "cleanTime": result[0],
                "cleanArea": result[1],
                "cleanCount": result[2],
            }
        return {"cleanTime": 0, "cleanArea": 0, "cleanCount": 0}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Summary error: {e}")
        raise HTTPException(500, f"Failed to get summary: {e}")


@app.get("/rooms")
async def get_rooms():
    """Get room list with names"""
    try:
        result = await send_command("get_room_mapping")
        if result is None:
            return {"rooms": []}

        # Result format: [[segment_id, iot_id, ?], ...]
        rooms = []
        if isinstance(result, list):
            for room_data in result:
                if isinstance(room_data, list) and len(room_data) >= 1:
                    segment_id = room_data[0]
                    room_name = ROOM_NAMES.get(segment_id, f"Room {segment_id}")
                    rooms.append({
                        "segmentId": segment_id,
                        "name": room_name,
                    })

        return {"rooms": rooms}
    except Exception as e:
        print(f"Rooms error: {e}")
        return {"rooms": []}


@app.get("/volume")
async def get_volume():
    """Get sound volume"""
    try:
        result = await send_command("get_sound_volume")
        if result is None:
            return {"volume": 50}

        # Result can be an int or list
        if isinstance(result, int):
            return {"volume": result}
        elif isinstance(result, list) and result:
            return {"volume": result[0] if isinstance(result[0], int) else 50}
        return {"volume": 50}
    except Exception as e:
        print(f"Volume error: {e}")
        return {"volume": 50}


@app.post("/set-volume")
async def set_volume(req: VolumeRequest):
    """Set sound volume"""
    try:
        await send_command("change_sound_volume", [req.volume])
        return {"success": True, "volume": req.volume}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Set volume error: {e}")
        raise HTTPException(500, f"Failed to set volume: {e}")


@app.post("/set-fan-speed")
async def set_fan_speed(req: FanSpeedRequest):
    """Set fan speed mode"""
    try:
        await send_command("set_custom_mode", [req.mode])
        return {"success": True, "mode": req.mode}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Set fan speed error: {e}")
        raise HTTPException(500, f"Failed to set fan speed: {e}")


@app.post("/set-mop-mode")
async def set_mop_mode(req: MopModeRequest):
    """Set mop intensity mode"""
    try:
        await send_command("set_water_box_custom_mode", [req.mode])
        return {"success": True, "mode": req.mode}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Set mop mode error: {e}")
        raise HTTPException(500, f"Failed to set mop mode: {e}")


@app.post("/clean-segments")
async def clean_segments(req: CleanSegmentsRequest):
    """Clean specific room segments"""
    try:
        # Roborock expects segments as [[seg1, seg2, ...], repeat_count]
        await send_command("app_segment_clean", [req.segments])
        return {"success": True, "segments": req.segments}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Clean segments error: {e}")
        raise HTTPException(500, f"Failed to clean segments: {e}")


@app.get("/consumables")
async def get_consumables():
    """Get consumables status"""
    try:
        result = await send_command("get_consumable")
        if result is None:
            return {
                "mainBrushWorkTime": 0,
                "sideBrushWorkTime": 0,
                "filterWorkTime": 0,
                "sensorDirtyTime": 0,
            }

        # Result is a list with one dict item: [{"main_brush_work_time": ..., ...}]
        if isinstance(result, list) and result:
            data = result[0] if isinstance(result[0], dict) else {}
        elif isinstance(result, dict):
            data = result
        else:
            data = {}

        return {
            "mainBrushWorkTime": data.get("main_brush_work_time", 0),
            "sideBrushWorkTime": data.get("side_brush_work_time", 0),
            "filterWorkTime": data.get("filter_work_time", 0),
            "sensorDirtyTime": data.get("sensor_dirty_time", 0),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Consumables error: {e}")
        raise HTTPException(500, f"Failed to get consumables: {e}")


@app.post("/reset-consumable")
async def reset_consumable(req: ResetConsumableRequest):
    """Reset consumable timer"""
    try:
        await send_command("reset_consumable", [req.consumable])
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Reset consumable error: {e}")
        raise HTTPException(500, f"Failed to reset consumable: {e}")


def run():
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=ROBOROCK_PORT)


if __name__ == "__main__":
    run()
