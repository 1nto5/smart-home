"""
Roborock HTTP Bridge
FastAPI server using python-roborock LocalChannel for pure local vacuum control.
No cloud connectivity required.
"""

import asyncio
import json
import os
from contextlib import asynccontextmanager
from dataclasses import dataclass

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from roborock import RoborockCommand
from roborock.devices.transport.local_channel import LocalChannel
from roborock.roborock_message import RoborockMessage, RoborockMessageProtocol
from roborock.util import get_next_int, get_timestamp

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


def create_request_payload(method: str, params: list | dict | None = None) -> bytes:
    """Create a V1 protocol request payload."""
    request_id = get_next_int(10000, 32767)
    timestamp = get_timestamp()
    inner = {
        "id": request_id,
        "method": method,
        "params": params or [],
    }
    payload = {
        "dps": {"101": json.dumps(inner, separators=(",", ":"))},
        "t": timestamp,
    }
    return json.dumps(payload, separators=(",", ":")).encode()


def parse_response(data: bytes) -> dict | None:
    """Parse V1 protocol response."""
    try:
        resp = json.loads(data)
        if "dps" in resp and "102" in resp["dps"]:
            inner = json.loads(resp["dps"]["102"])
            return inner.get("result")
    except Exception as e:
        print(f"Parse error: {e}")
    return None


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


async def send_command(method: str, params: list | dict | None = None) -> dict | None:
    """Send command and get response."""
    ch = await get_channel()

    # Generate unique seq for this request
    seq = get_next_int(10000, 32767)

    # Create message with seq for response matching
    payload = create_request_payload(method, params)
    msg = RoborockMessage(
        timestamp=get_timestamp(),
        protocol=RoborockMessageProtocol.RPC_REQUEST,
        payload=payload,
        version=b"1.0",
        seq=seq,
    )

    # Create response future
    response_future: asyncio.Future = asyncio.Future()

    def on_response(resp_msg: RoborockMessage):
        # Match by seq number and RPC_RESPONSE protocol
        if (resp_msg.protocol == RoborockMessageProtocol.RPC_RESPONSE and
            resp_msg.seq == seq and
            not response_future.done()):
            response_future.set_result(resp_msg)

    # Subscribe returns unsubscribe function
    unsub = await ch.subscribe(on_response)
    try:
        await ch.publish(msg)
        # Wait for response with timeout
        resp = await asyncio.wait_for(response_future, timeout=10.0)
        return parse_response(resp.payload)
    except asyncio.TimeoutError:
        raise HTTPException(504, "Device timeout")
    finally:
        unsub()  # Always unsubscribe


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Roborock LOCAL bridge starting for device: {DEVICE_NAME}")
    print(f"  Device ID: {DEVICE_ID}")
    print(f"  IP: {DEVICE_IP}")
    print("  Mode: Pure local (no cloud)")
    yield
    global channel
    if channel:
        await channel.close()


app = FastAPI(title="Roborock Bridge (Local)", lifespan=lifespan)


@app.get("/status")
async def get_status():
    """Get vacuum status"""
    try:
        result = await send_command("get_status")
        if result is None:
            raise HTTPException(500, "No response from device")

        # Parse status response
        status = result[0] if isinstance(result, list) and result else result
        return {
            "state": status.get("state", 0),
            "battery": status.get("battery", 0),
            "fan_power": status.get("fan_power", 0),
            "water_box_mode": status.get("water_box_mode", 0),
            "error_code": status.get("error_code", 0),
            "clean_time": status.get("clean_time", 0),
            "clean_area": status.get("clean_area", 0),
            "in_cleaning": status.get("in_cleaning", 0),
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
            return {"clean_time": 0, "clean_area": 0, "clean_count": 0}
        return {
            "clean_time": result.get("clean_time", 0),
            "clean_area": result.get("clean_area", 0),
            "clean_count": result.get("clean_count", 0),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Summary error: {e}")
        raise HTTPException(500, f"Failed to get summary: {e}")


@app.get("/rooms")
async def get_rooms():
    """Get room list"""
    try:
        result = await send_command("get_room_mapping")
        return result or []
    except Exception as e:
        print(f"Rooms error: {e}")
        return []


@app.get("/consumables")
async def get_consumables():
    """Get consumables status"""
    try:
        result = await send_command("get_consumable")
        if result is None:
            return {
                "main_brush_work_time": 0,
                "side_brush_work_time": 0,
                "filter_work_time": 0,
                "sensor_dirty_time": 0,
            }
        return {
            "main_brush_work_time": result.get("main_brush_work_time", 0),
            "side_brush_work_time": result.get("side_brush_work_time", 0),
            "filter_work_time": result.get("filter_work_time", 0),
            "sensor_dirty_time": result.get("sensor_dirty_time", 0),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Consumables error: {e}")
        raise HTTPException(500, f"Failed to get consumables: {e}")


def run():
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=ROBOROCK_PORT)


if __name__ == "__main__":
    run()
