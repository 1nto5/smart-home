"""
Roborock HTTP Bridge
Simple FastAPI server that wraps python-roborock CLI for vacuum control.
Uses asyncio.create_subprocess_exec (safe, no shell injection).
"""

import asyncio
import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Device we're controlling
DEVICE_NAME = "Mania"
DEVICE_ID = "ROBOROCK_DEVICE_ID_REMOVED"


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
    consumable: str  # sensor_dirty_time, filter_work_time, side_brush_work_time, main_brush_work_time


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Roborock bridge ready for device: {DEVICE_NAME}")
    yield


app = FastAPI(title="Roborock Bridge", lifespan=lifespan)


async def run_roborock_cmd(args: list[str]) -> dict | None:
    """Run roborock CLI command and return JSON output.
    Uses create_subprocess_exec which is safe (no shell injection).
    """
    cmd = ["/Users/adrian/.local/bin/roborock"] + args + ["--device_id", DEVICE_ID]
    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()
        if proc.returncode == 0:
            try:
                return json.loads(stdout.decode())
            except json.JSONDecodeError:
                return {"output": stdout.decode().strip()}
        else:
            print(f"Roborock error: {stderr.decode()}")
            return None
    except Exception as e:
        print(f"Command error: {e}")
        return None


@app.get("/status")
async def get_status():
    """Get vacuum status"""
    result = await run_roborock_cmd(["status"])
    if result is None:
        raise HTTPException(500, "Failed to get status")
    return result


@app.post("/command")
async def send_command(req: CommandRequest):
    """Send command to vacuum"""
    cmd_map = {
        "start": "app_start",
        "pause": "app_pause",
        "stop": "app_stop",
        "home": "app_charge",
        "find": "find_me",
    }

    roborock_cmd = cmd_map.get(req.cmd, req.cmd)

    result = await run_roborock_cmd(["command", "--cmd", roborock_cmd])
    if result is None:
        raise HTTPException(500, f"Failed to run {roborock_cmd}")
    return {"success": True, "command": roborock_cmd}


@app.get("/clean-summary")
async def get_clean_summary():
    """Get cleaning summary"""
    result = await run_roborock_cmd(["clean-summary"])
    if result is None:
        raise HTTPException(500, "Failed to get summary")
    return result


@app.get("/rooms")
async def get_rooms():
    """Get room list"""
    result = await run_roborock_cmd(["rooms"])
    if result is None:
        raise HTTPException(500, "Failed to get rooms")
    return result


@app.get("/volume")
async def get_volume():
    """Get current volume"""
    result = await run_roborock_cmd(["volume"])
    if result is None:
        raise HTTPException(500, "Failed to get volume")
    return result


@app.post("/set-volume")
async def set_volume(req: VolumeRequest):
    """Set volume (0-100)"""
    result = await run_roborock_cmd(["set-volume", "--volume", str(req.volume)])
    if result is None:
        raise HTTPException(500, "Failed to set volume")
    return {"success": True, "volume": req.volume}


@app.post("/set-fan-speed")
async def set_fan_speed(req: FanSpeedRequest):
    """Set fan speed mode (101-104)"""
    result = await run_roborock_cmd([
        "command", "--cmd", "set_custom_mode", "--params", json.dumps([req.mode])
    ])
    if result is None:
        raise HTTPException(500, "Failed to set fan speed")
    return {"success": True, "mode": req.mode}


@app.post("/set-mop-mode")
async def set_mop_mode(req: MopModeRequest):
    """Set mop intensity (200=off, 201=low, 202=medium, 203=high)"""
    result = await run_roborock_cmd([
        "command", "--cmd", "set_water_box_custom_mode", "--params", json.dumps([req.mode])
    ])
    if result is None:
        raise HTTPException(500, "Failed to set mop mode")
    return {"success": True, "mode": req.mode}


@app.post("/clean-segments")
async def clean_segments(req: CleanSegmentsRequest):
    """Clean specific rooms by segment IDs"""
    result = await run_roborock_cmd([
        "command", "--cmd", "app_segment_clean", "--params", json.dumps([{"segments": req.segments, "repeat": 1}])
    ])
    if result is None:
        raise HTTPException(500, "Failed to start segment cleaning")
    return {"success": True, "segments": req.segments}


@app.get("/consumables")
async def get_consumables():
    """Get consumables status"""
    result = await run_roborock_cmd(["consumables"])
    if result is None:
        raise HTTPException(500, "Failed to get consumables")
    return result


@app.post("/reset-consumable")
async def reset_consumable(req: ResetConsumableRequest):
    """Reset a consumable timer"""
    valid = ["sensor_dirty_time", "filter_work_time", "side_brush_work_time", "main_brush_work_time"]
    if req.consumable not in valid:
        raise HTTPException(400, f"Invalid consumable. Must be one of: {valid}")
    result = await run_roborock_cmd(["reset-consumable", "--consumable", req.consumable])
    if result is None:
        raise HTTPException(500, "Failed to reset consumable")
    return {"success": True, "consumable": req.consumable}


def run():
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=3002)


if __name__ == "__main__":
    run()
