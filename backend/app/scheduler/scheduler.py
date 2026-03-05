"""APScheduler setup for running scheduled workflow triggers."""

import asyncio
import logging
from typing import Dict

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.core.supabase import supabase
from app.models.workflow import WorkflowDefinition

logger = logging.getLogger(__name__)

_scheduler = BackgroundScheduler()
_active_jobs: Dict[str, str] = {}  # workflow_id -> job_id


def _run_workflow_async(workflow_id: str, workflow_name: str, definition_dict: dict):
    """Wrapper to run async workflow runner from synchronous APScheduler thread."""
    from app.services.runner_service import runner

    definition = WorkflowDefinition(**definition_dict)
    loop = asyncio.new_event_loop()
    try:
        loop.run_until_complete(
            runner.run(workflow_id, workflow_name, definition, trigger_type="schedule")
        )
        logger.info("Scheduled run completed for workflow %s", workflow_id)
    except Exception as e:
        logger.error("Scheduled run failed for workflow %s: %s", workflow_id, str(e))
    finally:
        loop.close()


def add_workflow_job(
    workflow_id: str, workflow_name: str, cron: str, definition_dict: dict
) -> None:
    """Add or replace a scheduled job for a workflow.

    Args:
        workflow_id: The workflow UUID.
        workflow_name: Human-readable name for logging.
        cron: Cron expression string (e.g., "0 9 * * *").
        definition_dict: The workflow definition as a dict.
    """
    # Remove existing job if any
    remove_workflow_job(workflow_id)

    try:
        trigger = CronTrigger.from_crontab(cron)
        job = _scheduler.add_job(
            _run_workflow_async,
            trigger=trigger,
            args=[workflow_id, workflow_name, definition_dict],
            id=f"workflow_{workflow_id}",
            replace_existing=True,
        )
        _active_jobs[workflow_id] = job.id
        logger.info(
            "Added scheduled job for workflow %s with cron '%s'", workflow_id, cron
        )
    except Exception as e:
        logger.error("Failed to add scheduler job for %s: %s", workflow_id, str(e))


def remove_workflow_job(workflow_id: str) -> None:
    """Remove a scheduled job for a workflow if it exists."""
    job_id = _active_jobs.pop(workflow_id, None)
    if job_id:
        try:
            _scheduler.remove_job(job_id)
            logger.info("Removed scheduled job for workflow %s", workflow_id)
        except Exception:
            pass  # Job may already be removed


def start() -> None:
    """Start the scheduler and load all active scheduled workflows from the database."""
    try:
        result = (
            supabase.table("workflows")
            .select("id, name, definition")
            .eq("status", "active")
            .execute()
        )

        for wf in result.data:
            definition = wf.get("definition", {})
            trigger = definition.get("trigger", {})

            if trigger.get("type") == "schedule":
                cron = trigger.get("config", {}).get("cron", "0 9 * * *")
                add_workflow_job(wf["id"], wf["name"], cron, definition)

        _scheduler.start()
        logger.info(
            "Scheduler started with %d active scheduled workflows",
            len(_active_jobs),
        )
    except Exception as e:
        logger.error("Failed to start scheduler: %s", str(e))
        _scheduler.start()  # Start even without preloaded jobs


def stop() -> None:
    """Shut down the scheduler gracefully."""
    _scheduler.shutdown(wait=False)
    _active_jobs.clear()
    logger.info("Scheduler stopped")
