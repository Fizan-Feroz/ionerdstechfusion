# Discord Alerts - Quick Test

This guide helps you verify alerts are working.

## 1. Get Your Webhook URL

1. Open Discord → Server Settings → Integrations → Webhooks
2. Create a new webhook or copy an existing one
3. Copy the full URL (looks like: `https://discordapp.com/api/webhooks/123456/abcdef...`)

## 2. Add to `.env`

Create/update `.env` file in project root:

```env
DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/YOUR_ID/YOUR_TOKEN
VITE_DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/YOUR_ID/YOUR_TOKEN
```

## 3. Test Frontend Alert

Open browser console (F12) and run:

```javascript
fetch("YOUR_WEBHOOK_URL_HERE", {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: "🧪 Test alert from SynCura frontend!" })
});
```

✅ You should see the message in Discord

## 4. Test Backend Alert

Send a test vital with high risk:

```powershell
$webhook = "YOUR_WEBHOOK_URL_HERE"

# High risk patient (risk >= 90)
$body = @{
    patient_id = "P001"
    timestamp = [int](Get-Date).ToFileTime()
    HR = 120
    RespRate = 35
    Temp = 39.5
    SpO2 = 88
} | ConvertTo-Json

curl -X POST http://localhost:8000/vital `
  -H "Content-Type: application/json" `
  -d $body
```

✅ Backend should send alert to Discord via webhook

## 5. Verify Alert Conditions

Alerts trigger when:

- **CRITICAL**: Risk score >= 90
- **WARNING**: SpO2 <= 88 OR Respiratory Rate >= 30
- **INFO**: Temperature >= 39°C

Example vitals to trigger warnings:

```json
{
  "patient_id": "P001",
  "timestamp": 1715261200,
  "HR": 120,
  "RespRate": 35,
  "Temp": 39.5,
  "SpO2": 88
}
```

## Troubleshooting

### Alert not appearing in Discord?

1. **Check webhook URL** - Copy from Discord again (settings → webhooks)
2. **Check `.env` file** - Verify webhook URL is exactly correct
3. **Check webhook exists** - Make sure it hasn't been deleted
4. **Check permissions** - Webhook channel should be writable
5. **Check backend logs** - Look for error messages in backend terminal

### How to find webhook URL again?

1. Discord server
2. Server Settings → Integrations → Webhooks
3. Click the webhook name
4. Click "Copy Webhook URL" button
5. Add to `.env` file
6. Restart backend: Press Ctrl+C in backend terminal, then restart

## Optional: Discord Bot Commands

If you have `DISCORD_BOT_TOKEN` and `DISCORD_CHANNEL_ID` set, you can also use:

- `!hello` - Test bot is alive
- `!testalert` - Send a manual test alert
- `!status` - Check bot status

Type these in any Discord channel where the bot is present.
