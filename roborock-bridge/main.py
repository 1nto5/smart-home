"""
Roborock HTTP Bridge
FastAPI server using python-roborock library for local vacuum control.
"""

import asyncio
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from roborock import RoborockCommand
from roborock.containers import DeviceData, UserData
from roborock.api import RoborockLocalClientV2

# Device config from environment
DEVICE_NAME = os.environ.get("ROBOROCK_DEVICE_NAME", "Vacuum")
DEVICE_ID = os.environ.get("ROBOROCK_DEVICE_ID", "")
DEVICE_IP = os.environ.get("ROBOROCK_DEVICE_IP", "")
DEVICE_LOCAL_KEY = os.environ.get("ROBOROCK_LOCAL_KEY", "")
ROBOROCK_PORT = int(os.environ.get("ROBOROCK_PORT", "3002"))

# Global client instance
client: RoborockLocalClientV2 | None = None


class CommandRequest(BaseModel):
    cmd: str  # start, pause, stop, home, find


class VolumeRequest(BaseModel):
    volume: int  # 0-100


class FanSpeedRequest(BaseModel):
    mode: int  # 101=quiet, 102=balanced, 103=turbo, 104=max


class MopModeRequest(BaseModel):
    mode: int  # 200=off, 201=low, 202=medium, 203=high


class CleanSegmentsRequest(BaseModel):
    segments: list[int]  # segment IDs to clean


class ResetConsumableRequest(BaseModel):
    consumable: str


async def get_client() -> RoborockLocalClientV2:
    global client
    if client is None or not client._is_connected:
        device_data = DeviceData(
            device={"duid": DEVICE_ID, "localKey": DEVICE_LOCAL_KEY, "name": DEVICE_NAME},
            model="roborock.vacuum.a51"
        )
        client = RoborockLocalClientV2(device_data, DEVICE_IP)
        await client.async_connect()
    return client


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Roborock bridge ready for device: {DEVICE_NAME}")
    print(f"  Device ID: {DEVICE_ID}")
    print(f"  IP: {DEVICE_IP}")
    yield
    # Cleanup on shutdown
    global client
    if client:
        await client.async_disconnect()


app = FastAPI(title="Roborock Bridge", lifespan=lifespan)


@app.get("/status")
async def get_status():
    """Get vacuum status"""
    try:
        c = await get_client()
        status = await c.get_status()
        return {
            "state": status.state_name if status else "unknown",
            "state_code": status.state if status else 0,
            "battery": status.battery if status else 0,
            "fan_power": status.fan_power if status else 0,
            "water_box_mode": status.water_box_mode if status else 0,
            "error_code": status.error_code if status else 0,
            "clean_time": status.clean_time if status else 0,
            "clean_area": status.clean_area if status else 0,
            "in_cleaning": status.in_cleaning if status else 0,
        }
    except Exception as e:
        print(f"Status error: {e}")
        raise HTTPException(500, f"Failed to get status: {e}")


@app.post("/command")
async def send_command(req: CommandRequest):
    """Send command to vacuum"""
    cmd_map = {
        "start": RoborockCommand.APP_START,
        "pause": RoborockCommand.APP_PAUSE,
        "stop": RoborockCommand.APP_STOP,
        "home": RoborockCommand.APP_CHARGE,
        "find": RoborockCommand.FIND_ME,
    }

    roborock_cmd = cmd_map.get(req.cmd)
    if not roborock_cmd:
        raise HTTPException(400, f"Unknown command: {req.cmd}")

    try:
        c = await get_client()
        await c.send_command(roborock_cmd)
        return {"success": True, "command": req.cmd}
    except Exception as e:
        print(f"Command error: {e}")
        raise HTTPException(500, f"Failed to run {req.cmd}: {e}")


@app.get("/clean-summary")
async def get_clean_summary():
    """Get cleaning summary"""
    try:
        c = await get_client()
        summary = await c.get_clean_summary()
        return {
            "clean_time": summary.clean_time if summary else 0,
            "clean_area": summary.clean_area if summary else 0,
            "clean_count": summary.clean_count if summary else 0,
        }
    except Exception as e:
        print(f"Summary error: {e}")
        raise HTTPException(500, f"Failed to get summary: {e}")


@app.get("/rooms")
async def get_rooms():
    """Get room list"""
    try:
        c = await get_client()
        rooms = await c.get_room_mapping()
        return rooms or []
    except Exception as e:
        print(f"Rooms error: {e}")
        raise HTTPException(500, f"Failed to get rooms: {e}")


@app.get("/volume")
async def get_volume():
    """Get current volume"""
    try:
        c = await get_client()
        status = await c.get_sound_volume()
        return {"volume": status}
    except Exception as e:
        print(f"Volume error: {e}")
        raise HTTPException(500, f"Failed to get volume: {e}")


@app.post("/set-volume")
async def set_volume(req: VolumeRequest):
    """Set volume (0-100)"""
    try:
        c = await get_client()
        await c.send_command(RoborockCommand.CHANGE_SOUND_VOLUME, [req.volume])
        return {"success": True, "volume": req.volume}
    except Exception as e:
        print(f"Set volume error: {e}")
        raise HTTPException(500, f"Failed to set volume: {e}")


@app.post("/set-fan-speed")
async def set_fan_speed(req: FanSpeedRequest):
    """Set fan speed mode (101-104)"""
    try:
        c = await get_client()
        await c.send_command(RoborockCommand.SET_CUSTOM_MODE, [req.mode])
        return {"success": True, "mode": req.mode}
    except Exception as e:
        print(f"Set fan speed error: {e}")
        raise HTTPException(500, f"Failed to set fan speed: {e}")


@app.post("/set-mop-mode")
async def set_mop_mode(req: MopModeRequest):
    """Set mop intensity (200=off, 201=low, 202=medium, 203=high)"""
    try:
        c = await get_client()
        await c.send_command(RoborockCommand.SET_WATER_BOX_CUSTOM_MODE, [req.mode])
        return {"success": True, "mode": req.mode}
    except Exception as e:
        print(f"Set mop mode error: {e}")
        raise HTTPException(500, f"Failed to set mop mode: {e}")


@app.post("/clean-segments")
async def clean_segments(req: CleanSegmentsRequest):
    """Clean specific rooms by segment IDs"""
    try:
        c = await get_client()
        await c.send_command(
            RoborockCommand.APP_SEGMENT_CLEAN,
            [{"segments": req.segments, "repeat": 1}]
        )
        return {"success": True, "segments": req.segments}
    except Exception as e:
        print(f"Clean segments error: {e}")
        raise HTTPException(500, f"Failed to start segment cleaning: {e}")


@app.get("/consumables")
async def get_consumables():
    """Get consumables status"""
    try:
        c = await get_client()
        consumables = await c.get_consumable()
        return {
            "main_brush_work_time": consumables.main_brush_work_time if consumables else 0,
            "side_brush_work_time": consumables.side_brush_work_time if consumables else 0,
            "filter_work_time": consumables.filter_work_time if consumables else 0,
            "sensor_dirty_time": consumables.sensor_dirty_time if consumables else 0,
        }
    except Exception as e:
        print(f"Consumables error: {e}")
        raise HTTPException(500, f"Failed to get consumables: {e}")


@app.post("/reset-consumable")
async def reset_consumable(req: ResetConsumableRequest):
    """Reset a consumable timer"""
    valid = ["sensor_dirty_time", "filter_work_time", "side_brush_work_time", "main_brush_work_time"]
    if req.consumable not in valid:
        raise HTTPException(400, f"Invalid consumable. Must be one of: {valid}")
    try:
        c = await get_client()
        await c.send_command(RoborockCommand.RESET_CONSUMABLE, [req.consumable])
        return {"success": True, "consumable": req.consumable}
    except Exception as e:
        print(f"Reset consumable error: {e}")
        raise HTTPException(500, f"Failed to reset consumable: {e}")


def run():
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=ROBOROCK_PORT)


if __name__ == "__main__":
    run()
