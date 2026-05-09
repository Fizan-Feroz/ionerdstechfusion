#!/usr/bin/env python3
"""Create Discord webhook automatically using bot token and channel ID."""

import os
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path

# Load .env manually
def load_env():
    env_vars = {}
    env_path = Path(".env")
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    env_vars[key.strip()] = value.strip()
    return env_vars

env = load_env()
bot_token = env.get("DISCORD_BOT_TOKEN", "").strip()
channel_id = env.get("DISCORD_CHANNEL_ID", "").strip()

if not bot_token:
    print("❌ DISCORD_BOT_TOKEN not set in .env")
    sys.exit(1)

if not channel_id:
    print("❌ DISCORD_CHANNEL_ID not set in .env")
    sys.exit(1)

print("=" * 60)
print("🎯 Creating Discord Webhook")
print("=" * 60)
print(f"📋 Channel ID: {channel_id}")
print(f"🤖 Bot token: {bot_token[:20]}...\n")

headers = {
    "Authorization": f"Bot {bot_token}",
    "Content-Type": "application/json"
}

# Try to get existing webhooks
print("🔍 Looking for existing webhooks...")
try:
    url = f"https://discord.com/api/v10/channels/{channel_id}/webhooks"
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req) as response:
        webhooks = json.loads(response.read().decode())
        
        if webhooks:
            print(f"✅ Found {len(webhooks)} webhook(s)\n")
            for i, webhook in enumerate(webhooks, 1):
                print(f"{i}. {webhook['name']} (ID: {webhook['id']})")
            
            webhook = webhooks[0]
            webhook_url = f"https://discordapp.com/api/webhooks/{webhook['id']}/{webhook['token']}"
            print(f"\n✅ Using: {webhook['name']}")
        else:
            print("❌ No webhooks found. Creating new one...\n")
            
            # Create webhook
            data = json.dumps({"name": "SynCura Alerts"}).encode('utf-8')
            req = urllib.request.Request(url, data=data, headers=headers, method="POST")
            with urllib.request.urlopen(req) as response:
                webhook = json.loads(response.read().decode())
                webhook_url = f"https://discordapp.com/api/webhooks/{webhook['id']}/{webhook['token']}"
                print(f"✅ Created webhook: {webhook['name']}\n")
    
    print("🔗 Webhook URL:")
    print(webhook_url)
    print()
    
    # Update .env
    env_path = Path(".env")
    if env_path.exists():
        content = env_path.read_text()
        
        # Replace both webhook URLs
        new_content = content.replace(
            "DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN",
            f"DISCORD_WEBHOOK_URL={webhook_url}"
        )
        new_content = new_content.replace(
            "VITE_DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN",
            f"VITE_DISCORD_WEBHOOK_URL={webhook_url}"
        )
        
        env_path.write_text(new_content)
        print("✅ Updated .env file with webhook URL\n")
        
        print("=" * 60)
        print("🚀 Next steps:")
        print("1. Stop backend: Press Ctrl+C in backend terminal")
        print("2. Restart: .\start-dev.ps1")
        print("3. Check alerts work on dashboard!")
        print("=" * 60)
    else:
        print("❌ .env file not found!")
        sys.exit(1)
        
except urllib.error.HTTPError as e:
    error_msg = e.read().decode()
    print(f"❌ Discord API error: {e.status}")
    print(f"   {error_msg}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
