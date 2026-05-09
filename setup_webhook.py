#!/usr/bin/env python3
"""Create Discord webhook automatically using bot token and channel ID."""

import os
import sys
import requests
from pathlib import Path

def get_or_create_webhook():
    """Create a webhook for the configured channel."""
    
    # Load from .env
    bot_token = os.getenv("DISCORD_BOT_TOKEN", "").strip()
    channel_id = os.getenv("DISCORD_CHANNEL_ID", "").strip()
    
    if not bot_token or not channel_id:
        print("❌ DISCORD_BOT_TOKEN and DISCORD_CHANNEL_ID must be set in .env")
        return None
    
    print(f"📋 Using channel ID: {channel_id}")
    print(f"🤖 Using bot token: {bot_token[:20]}...")
    
    # Get webhooks for the channel
    headers = {"Authorization": f"Bot {bot_token}"}
    url = f"https://discord.com/api/v10/channels/{channel_id}/webhooks"
    
    print(f"\n🔍 Fetching webhooks from channel...")
    try:
        resp = requests.get(url, headers=headers, timeout=5)
        resp.raise_for_status()
        webhooks = resp.json()
        
        if webhooks:
            print(f"✅ Found {len(webhooks)} webhook(s)")
            # Use the first one
            webhook = webhooks[0]
            webhook_url = f"https://discordapp.com/api/webhooks/{webhook['id']}/{webhook['token']}"
            print(f"✅ Using webhook: {webhook['name']}")
            print(f"\n🔗 Webhook URL:")
            print(webhook_url)
            return webhook_url
        else:
            print("❌ No webhooks found for this channel")
            print("📝 Creating a new webhook...")
            
            # Create webhook
            resp = requests.post(
                url,
                headers=headers,
                json={"name": "SynCura Alerts"},
                timeout=5
            )
            resp.raise_for_status()
            webhook = resp.json()
            webhook_url = f"https://discordapp.com/api/webhooks/{webhook['id']}/{webhook['token']}"
            print(f"✅ Created webhook: {webhook['name']}")
            print(f"\n🔗 Webhook URL:")
            print(webhook_url)
            return webhook_url
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to get/create webhook: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   Response: {e.response.text}")
        return None

def update_env(webhook_url):
    """Update .env with webhook URL."""
    env_path = Path(".env")
    if not env_path.exists():
        print("❌ .env file not found")
        return False
    
    content = env_path.read_text()
    
    # Replace webhook URLs
    new_content = content.replace(
        "DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN",
        f"DISCORD_WEBHOOK_URL={webhook_url}"
    )
    new_content = new_content.replace(
        "VITE_DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN",
        f"VITE_DISCORD_WEBHOOK_URL={webhook_url}"
    )
    
    env_path.write_text(new_content)
    print("✅ Updated .env file")
    return True

if __name__ == "__main__":
    from dotenv import load_dotenv
    
    print("=" * 60)
    print("🎯 Discord Webhook Setup")
    print("=" * 60 + "\n")
    
    load_dotenv()
    
    webhook_url = get_or_create_webhook()
    
    if webhook_url:
        print("\n" + "=" * 60)
        if input("\n📝 Update .env with this webhook? (y/n): ").lower() == 'y':
            if update_env(webhook_url):
                print("\n✅ Done! Restart backend for changes to take effect:")
                print("   Ctrl+C in backend terminal")
                print("   .\start-dev.ps1")
        else:
            print("Webhook URL copied to clipboard! Paste manually in .env")
    
    print("=" * 60)
