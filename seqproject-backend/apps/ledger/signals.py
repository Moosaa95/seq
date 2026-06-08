import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)


@receiver(post_save, sender='api.Payment')
def on_payment_saved(sender, instance, created, **kwargs):
    """Auto-post a Journal Entry whenever a Payment reaches 'successful' status."""
    if instance.status != 'successful':
        return

    # Import here to avoid circular-import issues at module load time
    from ledger.services import record_payment
    try:
        record_payment(instance)
    except Exception:
        # Never let a ledger error crash the payment request.
        logger.exception(
            "Ledger journal entry failed for Payment %s — "
            "payment was still processed successfully.",
            instance.pk,
        )
