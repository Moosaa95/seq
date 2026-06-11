import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("seqproject")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

# ── Periodic tasks ──────────────────────────────────────────────────────────
app.conf.beat_schedule = {
    # Sync all active Airbnb/external calendars every 30 minutes
    "sync-external-calendars": {
        "task": "api.tasks.sync_all_calendars",
        "schedule": crontab(minute="*/30"),
    },
}
