# Discord Bot Integration Guide

This guide explains how to set up Discord alerts for SynCura.

## Overview

SynCura uses **two Discord integration methods**:

1. **Webhook Alerts** (Recommended) - Simple, reliable HTTP-based alerts
   - Frontend sends alerts via webhook
   - Backend sends alerts via webhook
   - No bot instance needed for alerts

2. **Discord Bot** (Optional) - Interactive bot for commands
   - Supports commands: `!hello`, `!testalert`, `!status`
   - Runs independently in its own process
   - Requires bot token and channel ID

## Quick Setup

### Step 1: Create a Discord Server Webhook

1. Go to your Discord server
2. **Server Settings** → **Integrations** → **Webhooks**
3. Click **Create Webhook**
4. Select the target channel (where alerts go)
5. Copy the **Webhook URL** and save it

### Step 2: Create `.env` File

Create `.env` in project root:

```env
# Alerts go to Discord via webhook (required for alerts)
DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/YOUR_ID/YOUR_TOKEN
VITE_DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/YOUR_ID/YOUR_TOKEN

# Optional: Discord bot for commands
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CHANNEL_ID=your_channel_id_here
```

### Step 3: Run the Project

```powershell
.\start-dev.ps1
```

✅ **Alerts will now flow to Discord!**
