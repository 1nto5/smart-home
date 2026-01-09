#!/usr/bin/env python3
"""
Fetch Tuya device local keys using tinytuya Cloud API
Run with: uv run --with tinytuya fetch-tuya-keys.py
"""

import json
import os
import tinytuya

# Tuya credentials from environment
API_KEY = os.environ.get("TUYA_ACCESS_ID", "")
API_SECRET = os.environ.get("TUYA_ACCESS_SECRET", "")
API_REGION = os.environ.get("TUYA_REGION", "eu")

def main():
    print("Connecting to Tuya Cloud...")
    print(f"  API Key: {API_KEY}")
    print(f"  Region: {API_REGION}")
    print()

    try:
        cloud = tinytuya.Cloud(
            apiRegion=API_REGION,
            apiKey=API_KEY,
            apiSecret=API_SECRET,
        )

        # Get device list
        devices = cloud.getdevices()

        if not devices:
            print("No devices found or API error")
            print("This might mean the Cloud API subscription has expired.")
            return

        print(f"Found {len(devices)} devices:\n")

        # Save to JSON file
        script_dir = os.path.dirname(os.path.abspath(__file__))
        output_file = os.path.join(script_dir, "../data/tuya-devices.json")
        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        device_list = []
        for device in devices:
            print(f"Device: {device.get('name', 'Unknown')}")
            print(f"  ID: {device.get('id', 'N/A')}")
            print(f"  Local Key: {device.get('key', 'N/A')}")
            print(f"  Category: {device.get('category', 'N/A')}")
            print()

            device_list.append({
                "id": device.get("id"),
                "name": device.get("name"),
                "local_key": device.get("key"),
                "category": device.get("category"),
                "product_name": device.get("product_name"),
                "ip": device.get("ip"),
            })

        with open(output_file, "w") as f:
            json.dump(device_list, f, indent=2)

        print(f"Saved to {output_file}")

    except Exception as e:
        print(f"Error: {e}")
        print("\nIf you see 'permission denied' or subscription error,")
        print("the Cloud API trial has expired and cannot be renewed.")

if __name__ == "__main__":
    main()
