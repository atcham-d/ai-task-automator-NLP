#!/usr/bin/env python3
import os
import asyncio
import httpx
import logging
from typing import List, Dict

# Set up logging before imports to capture startup
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

try:
    from dotenv import load_dotenv
    load_dotenv()
    
    # We import from app to reuse our existing logic
    from app.core.config import settings
    from app.core.supabase import supabase
    from app.core.security import decrypt_secret
except ImportError:
    logger.error("Could not import app modules. Ensure you are running from the backend directory.")
    exit(1)

def is_secret_field(key: str) -> bool:
    return any(s in key.lower() for s in ['password', 'token', 'key', 'secret'])

async def sync_trello_webhooks(target_callback_url: str):
    """
    Finds all Trello integrations and updates their webhooks to the target_callback_url.
    """
    logger.info(f"Starting Trello webhook sync to: {target_callback_url}")
    
    try:
        # 1. Fetch all Trello integrations
        result = (
            supabase.table("integrations")
            .select("*")
            .eq("type", "trello")
            .execute()
        )
        
        integrations = result.data
        logger.info(f"Found {len(integrations)} Trello integrations.")
        
        async with httpx.AsyncClient() as client:
            for integration in integrations:
                config = integration.get("config", {})
                # Decrypt the sensitive fields
                decrypted_config = {
                    k: decrypt_secret(v) if is_secret_field(k) and isinstance(v, str) else v
                    for k, v in config.items()
                }
                
                api_key = decrypted_config.get("api_key") or decrypted_config.get("key")
                token = decrypted_config.get("token")
                
                if not api_key or not token:
                    logger.warning(f"Integration {integration['id']} missing API Key or Token. Skipping.")
                    continue
                
                # 2. Get existing webhooks for this token
                # https://developer.atlassian.com/cloud/trello/rest/api-group-tokens/#api-tokens-token-webhooks-get
                webhooks_url = f"https://api.trello.com/1/tokens/{token}/webhooks"
                params = {"key": api_key}
                
                resp = await client.get(webhooks_url, params=params)
                if resp.status_code != 200:
                    logger.error(f"Failed to fetch webhooks for integration {integration['id']}: {resp.text}")
                    continue
                
                webhooks = resp.json()
                logger.info(f"Integration {integration['id']} has {len(webhooks)} webhooks.")
                
                for wh in webhooks:
                    current_url = wh.get("callbackURL")
                    if current_url != target_callback_url:
                        logger.info(f"Updating webhook {wh['id']} from {current_url} -> {target_callback_url}")
                        
                        # Update the webhook
                        # https://developer.atlassian.com/cloud/trello/rest/api-group-webhooks/#api-webhooks-id-put
                        update_url = f"https://api.trello.com/1/webhooks/{wh['id']}"
                        update_payload = {
                            "callbackURL": target_callback_url,
                            "key": api_key,
                            "token": token
                        }
                        
                        upd_resp = await client.put(update_url, params=update_payload)
                        if upd_resp.status_code == 200:
                            logger.info(f"Successfully updated webhook {wh['id']}.")
                        else:
                            logger.error(f"Failed to update webhook {wh['id']}: {upd_resp.text}")
                    else:
                        logger.info(f"Webhook {wh['id']} already points to correct URL.")
                        
    except Exception as e:
        logger.error(f"Sync failed: {str(e)}")

if __name__ == "__main__":
    # The user should override TRELLO_WEBHOOK_CALLBACK_URL in their environment/Render dashboard
    target_url = os.getenv("TRELLO_WEBHOOK_CALLBACK_URL")
    if not target_url:
        logger.error("TRELLO_WEBHOOK_CALLBACK_URL not found in environment.")
    else:
        asyncio.run(sync_trello_webhooks(target_url))
