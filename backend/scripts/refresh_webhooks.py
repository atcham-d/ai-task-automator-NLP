import os
import httpx
import argparse
import logging
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def main():
    parser = argparse.ArgumentParser(description="Refresh Trello webhooks for production deployment.")
    parser.add_argument("--execute", action="store_true", help="Actually execute the changes (default: dry-run)")
    args = parser.parse_args()

    # Configuration
    trello_key = os.getenv("TRELLO_API_KEY")
    trello_token = os.getenv("TRELLO_TOKEN")
    new_callback_url = os.getenv("TRELLO_WEBHOOK_CALLBACK_URL")
    dry_run_env = os.getenv("DRY_RUN", "false").lower() == "true"
    
    is_dry_run = not args.execute or dry_run_env

    if not trello_key or not trello_token:
        logger.error("TRELLO_API_KEY and TRELLO_TOKEN must be set.")
        return

    if not new_callback_url:
        logger.error("TRELLO_WEBHOOK_CALLBACK_URL must be set.")
        return

    if is_dry_run:
        logger.info("DRY-RUN MODE: No changes will be made to Trello.")
    else:
        logger.info("EXECUTE MODE: Webhooks will be updated on Trello.")

    # 1. Fetch current webhooks
    url = f"https://api.trello.com/1/tokens/{trello_token}/webhooks"
    params = {"key": trello_key}
    
    try:
        response = httpx.get(url, params=params)
        response.raise_for_status()
        webhooks = response.json()
    except Exception as e:
        logger.error(f"Failed to fetch webhooks: {type(e).__name__}")
        return

    logger.info(f"Found {len(webhooks)} existing webhooks.")

    for wh in webhooks:
        wh_id = wh["id"]
        old_url = wh["callbackURL"]
        description = wh.get("description", "No description")
        id_model = wh["idModel"]

        if old_url == new_callback_url:
            logger.info(f"Skipping webhook {wh_id} ({description}) - already matches new URL.")
            continue

        logger.info(f"Planning to update webhook {wh_id}:")
        logger.info(f"  - Description: {description}")
        logger.info(f"  - Model ID: {id_model}")
        logger.info(f"  - Old URL: {old_url}")
        logger.info(f"  - New URL: {new_callback_url}")

        if is_dry_run:
            logger.info(f"  [DRY-RUN] Would create new webhook for model {id_model}, then delete {wh_id}")
        else:
            # Create the new webhook first so the board is never left without one
            create_url = "https://api.trello.com/1/webhooks"
            create_data = {
                "key": trello_key,
                "token": trello_token,
                "callbackURL": new_callback_url,
                "idModel": id_model,
                "description": f"{description} (Refreshed for Prod)"
            }
            try:
                create_resp = httpx.post(create_url, data=create_data)
                create_resp.raise_for_status()
                new_id = create_resp.json().get("id", "unknown")
                logger.info(f"  Created new webhook {new_id} for model {id_model}")
            except Exception as e:
                logger.error(f"  Failed to create new webhook for model {id_model}; keeping old webhook {wh_id}: {type(e).__name__}")
                continue

            # Only remove the old webhook once the new one is confirmed
            try:
                del_url = f"https://api.trello.com/1/webhooks/{wh_id}"
                del_resp = httpx.delete(del_url, params=params)
                del_resp.raise_for_status()
                logger.info(f"  Deleted old webhook {wh_id}")
            except Exception as e:
                logger.warning(f"  New webhook created but failed to delete old webhook {wh_id} (both now active): {type(e).__name__}")

    logger.info("Done.")

if __name__ == "__main__":
    main()
