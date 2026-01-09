"""
Roborock HTTP Bridge
FastAPI server using python-roborock library for vacuum control.
Uses local connection with credentials from environment.
"""

import asyncio
import json
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from roborock import RoborockCommand, UserData, RRiot
from roborock.devices.device_manager import DeviceManager, UserParams, create_device_manager
from roborock.devices.device import RoborockDevice

# Config from environment
DEVICE_NAME = os.environ.get("ROBOROCK_DEVICE_NAME", "Vacuum")
DEVICE_ID = os.environ.get("ROBOROCK_DEVICE_ID", "")
ROBOROCK_PORT = int(os.environ.get("ROBOROCK_PORT", "3002"))

# RRiot credentials from environment
RRIOT_U = os.environ.get("ROBOROCK_RRIOT_U", "")
RRIOT_S = os.environ.get("ROBOROCK_RRIOT_S", "")
RRIOT_H = os.environ.get("ROBOROCK_RRIOT_H", "")
RRIOT_K = os.environ.get("ROBOROCK_RRIOT_K", "")
RRIOT_REGION = os.environ.get("ROBOROCK_RRIOT_REGION", "EU")
RRIOT_API = os.environ.get("ROBOROCK_RRIOT_API", "https://api-eu.roborock.com")
RRIOT_MQTT = os.environ.get("ROBOROCK_RRIOT_MQTT", "ssl://mqtt-eu.roborock.com:8883")

# User data from environment
USER_UID = int(os.environ.get("ROBOROCK_USER_UID", "0"))
USER_TOKEN = os.environ.get("ROBOROCK_USER_TOKEN", "")
USER_RRUID = os.environ.get("ROBOROCK_USER_RRUID", "")
USER_EMAIL = os.environ.get("ROBOROCK_USER_EMAIL", "")

# Global device manager and device
manager: DeviceManager | None = None
device: RoborockDevice | None = None


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


async def init_device():
    """Initialize device manager and connect to device."""
    global manager, device

    if not RRIOT_U or not DEVICE_ID:
        print("Missing RRIOT credentials or DEVICE_ID")
        return False

    try:
        # Create RRiot data
        rriot = RRiot(
            u=RRIOT_U,
            s=RRIOT_S,
            h=RRIOT_H,
            k=RRIOT_K,
            r={
                "r": RRIOT_REGION,
                "a": RRIOT_API,
                "m": RRIOT_MQTT,
                "l": RRIOT_API.replace("api", "wood"),
            }
        )

        # Create UserData
        user_data = UserData(
            rriot=rriot,
            uid=USER_UID,
            token=USER_TOKEN,
            rruid=USER_RRUID,
            region="eu",
        )

        # Create UserParams
        user_params = UserParams(
            username=USER_EMAIL,
            user_data=user_data,
            base_url=RRIOT_API,
        )

        # Create device manager
        manager = await create_device_manager(user_params, prefer_cache=False)

        # Find our device
        devices = await manager.get_devices()
        for d in devices:
            if d.device_info.duid == DEVICE_ID:
                device = d
                await device.connect()
                print(f"Connected to device: {device.device_info.name}")
                return True

        print(f"Device {DEVICE_ID} not found")
        return False

    except Exception as e:
        print(f"Init error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def get_device() -> RoborockDevice:
    """Get connected device, reconnecting if needed."""
    global device
    if device is None:
        await init_device()
    if device is None:
        raise HTTPException(503, "Device not available")
    return device


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Roborock bridge starting for device: {DEVICE_NAME}")
    await init_device()
    yield
    if manager:
        await manager.close()


app = FastAPI(title="Roborock Bridge", lifespan=lifespan)


@app.get("/status")
async def get_status():
    """Get vacuum status"""
    try:
        d = await get_device()
        props = d.v1_properties
        if not props:
            raise HTTPException(500, "Device properties not available")
        status = props.status
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
    except HTTPException:
        raise
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
        d = await get_device()
        await d.send_command(roborock_cmd)
        return {"success": True, "command": req.cmd}
    except Exception as e:
        print(f"Command error: {e}")
        raise HTTPException(500, f"Failed to run {req.cmd}: {e}")


@app.get("/clean-summary")
async def get_clean_summary():
    """Get cleaning summary"""
    try:
        d = await get_device()
        props = d.v1_properties
        if not props:
            raise HTTPException(500, "Device properties not available")
        summary = props.clean_summary
        return {
            "clean_time": summary.clean_time if summary else 0,
            "clean_area": summary.clean_area if summary else 0,
            "clean_count": summary.clean_count if summary else 0,
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
        d = await get_device()
        # For now return empty - room mapping requires additional setup
        return []
    except Exception as e:
        print(f"Rooms error: {e}")
        raise HTTPException(500, f"Failed to get rooms: {e}")


@app.get("/consumables")
async def get_consumables():
    """Get consumables status"""
    try:
        d = await get_device()
        props = d.v1_properties
        if not props:
            raise HTTPException(500, "Device properties not available")
        consumables = props.consumable
        return {
            "main_brush_work_time": consumables.main_brush_work_time if consumables else 0,
            "side_brush_work_time": consumables.side_brush_work_time if consumables else 0,
            "filter_work_time": consumables.filter_work_time if consumables else 0,
            "sensor_dirty_time": consumables.sensor_dirty_time if consumables else 0,
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
