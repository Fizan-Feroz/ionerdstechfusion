# Telegram Alert Bot — Setup Guide

## 1. Get a Bot Token
1. Open Telegram and search for **@BotFather**
2. Send `/newbot` and follow the prompts
3. Copy the token it gives you (looks like `123456:ABC-DEF...`)
4. Paste it into `bot.py` replacing `YOUR_BOT_TOKEN_HERE`

## 2. Install Dependencies
```bash
pip install -r requirements.txt
```

## 3. Run the Bot
```bash
python bot.py
```

## 4. Test It
- Open Telegram, search for your bot by the username you gave it
- Send `/start` — bot replies with a welcome message
- Send `/hello` — bot replies with "Hello, World!"

## Next Steps (for real alerts)
To send alerts from your website, you'll use the `send_message` API:

```python
import asyncio
from telegram import Bot

async def send_alert(message: str):
    bot = Bot(token="YOUR_BOT_TOKEN_HERE")
    await bot.send_message(chat_id="YOUR_CHAT_ID", text=message)

# Get your chat_id by messaging your bot and visiting:
# https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
```

Your website backend can call `send_alert("🚨 Site is down!")` whenever something happens.
