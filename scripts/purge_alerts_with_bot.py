import os
import asyncio
from dotenv import load_dotenv

load_dotenv()
DISCORD_TOKEN = os.getenv('DISCORD_BOT_TOKEN')
CHANNEL_ID = int(os.getenv('DISCORD_CHANNEL_ID', '0'))
DISCORD_WEBHOOK_URL = os.getenv('DISCORD_WEBHOOK_URL', '')
WEBHOOK_ID = None
if DISCORD_WEBHOOK_URL:
    import re
    m = re.search(r"/webhooks/(\d+)", DISCORD_WEBHOOK_URL)
    if m:
        WEBHOOK_ID = int(m.group(1))

import discord

async def purge(limit=500):
    intents = discord.Intents.default()
    intents.messages = True
    client = discord.Client(intents=intents)

    @client.event
    async def on_ready():
        print(f'Logged in as {client.user}')
        channel = client.get_channel(CHANNEL_ID)
        if channel is None:
            print('Channel not found. Check CHANNEL_ID and bot permissions.')
            await client.close()
            return
        count = 0
        async for msg in channel.history(limit=limit):
            try:
                # message from bot user
                if msg.author == client.user:
                    await msg.delete()
                    count += 1
                    continue
                # message posted via webhook
                wid = getattr(msg, 'webhook_id', None)
                if wid is not None and WEBHOOK_ID is not None and int(wid) == WEBHOOK_ID:
                    await msg.delete()
                    count += 1
                    continue
                # fallback: content starts with SynCura prefix
                if isinstance(msg.content, str) and msg.content.startswith('[SynCura'):
                    await msg.delete()
                    count += 1
            except Exception as e:
                print('Error deleting message:', e)
        print(f'Deleted {count} messages')
        await client.close()

    await client.start(DISCORD_TOKEN)

if __name__ == '__main__':
    import sys
    limit = 500
    if len(sys.argv) > 1:
        try:
            limit = int(sys.argv[1])
        except Exception:
            pass
    asyncio.run(purge(limit))
