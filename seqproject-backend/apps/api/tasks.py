from celery import shared_task
from datetime import timedelta
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task
def expire_pending_bookings():
    """
    Auto-cancel online pending bookings that have received no payment within 24 hours.
    Walk-in bookings are excluded — admin creates those in person and they are
    auto-confirmed at creation time, so this task will never touch them.
    """
    from .models import Booking
    cutoff = timezone.now() - timedelta(hours=24)
    expired_qs = Booking.objects.filter(
        status='pending',
        is_walk_in=False,
        created_at__lt=cutoff,
    )
    count = expired_qs.count()
    if count:
        expired_qs.update(
            status='cancelled',
            cancellation_reason='Automatically expired: no payment received within 24 hours',
        )
        logger.info('Auto-expired %d pending online bookings', count)
    return {'expired': count}


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def sync_all_calendars(self):
    """Sync all active external calendars (Airbnb, Booking.com, etc.)."""
    from .models import ExternalCalendar
    from .ical_service import ICalService

    calendars = ExternalCalendar.objects.filter(is_active=True)
    if not calendars.exists():
        logger.info("No active external calendars to sync.")
        return {"synced": 0, "errors": 0}

    results = ICalService.sync_all_external_calendars()
    success = sum(1 for r in results if r["result"].get("success"))
    failed = len(results) - success
    logger.info("Calendar sync complete: %d succeeded, %d failed", success, failed)
    return {"synced": success, "errors": failed}


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def sync_apartment_calendars(self, apartment_id):
    """Sync all external calendars linked to a specific apartment."""
    from .models import ExternalCalendar
    from .ical_service import ICalService

    calendars = ExternalCalendar.objects.filter(
        apartment_id=apartment_id, is_active=True
    )
    if not calendars.exists():
        logger.info("No active calendars for apartment %s", apartment_id)
        return {"apartment_id": apartment_id, "synced": 0}

    synced = 0
    for cal in calendars:
        try:
            result = ICalService.import_external_calendar(cal)
            if result.get("success"):
                synced += 1
                logger.info("Synced calendar %s for apartment %s", cal.id, apartment_id)
            else:
                logger.warning(
                    "Failed to sync calendar %s: %s",
                    cal.id,
                    result.get("error", "unknown"),
                )
        except Exception as exc:
            logger.error("Error syncing calendar %s: %s", cal.id, exc)
            raise self.retry(exc=exc)

    return {"apartment_id": apartment_id, "synced": synced}
