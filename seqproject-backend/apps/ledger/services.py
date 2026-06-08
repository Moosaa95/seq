"""
Bridge service between the Payment model and Django Ledger double-entry books.

When a Payment is marked `successful`, this creates a Journal Entry:
  DEBIT  Cash / Bank (ASSET_CA_CASH)        payment.amount
  CREDIT Rental Income (INCOME_OPERATIONAL)  payment.amount

The entity and main ledger references are read from LedgerSetup (populated by
the `setup_ledger` management command).

IMPORTANT: All JE creation is wrapped in transaction.atomic().
Django Ledger's _get_next_state_model() uses select_for_update() which
requires an explicit database transaction (especially critical for SQLite
where omitting it triggers an expression-copy recursion crash).
"""
import logging
from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from django_ledger.models.entity import EntityModel
from django_ledger.models.journal_entry import JournalEntryModel
from django_ledger.models.transactions import TransactionModel
from django_ledger.io import roles as ledger_roles

from ledger.models import LedgerSetup, PaymentLedgerEntry

logger = logging.getLogger(__name__)


def _get_role_default_account(coa, role: str):
    """Return the role-default account for *role* from *coa*, or None."""
    return coa.accountmodel_set.filter(role=role, role_default=True, active=True).first()


def record_payment(payment) -> bool:
    """
    Create and post a Journal Entry for a successful Payment.

    Returns True if a JE was created, False if skipped (already recorded,
    setup missing, or accounts not found).
    """
    # already recorded?
    if PaymentLedgerEntry.objects.filter(payment=payment).exists():
        return False

    setup = LedgerSetup.get_active()
    if not setup:
        logger.warning("LedgerSetup not configured — run `python manage.py setup_ledger`")
        return False

    try:
        entity: EntityModel = EntityModel.objects.get(slug=setup.entity_slug)
    except EntityModel.DoesNotExist:
        logger.error("Django Ledger entity '%s' not found", setup.entity_slug)
        return False

    # Resolve the target ledger (create lazily if missing)
    ledger, _ = entity.ledgermodel_set.get_or_create(
        ledger_xid=setup.main_ledger_xid,
        defaults={
            'name': 'Booking Revenue',
            'posted': True,
        },
    )
    if not ledger.posted:
        ledger.posted = True
        ledger.save(update_fields=['posted'])

    coa = entity.get_default_coa(raise_exception=False)
    if not coa:
        logger.warning("Entity '%s' has no default Chart of Accounts", setup.entity_slug)
        return False

    cash_account = _get_role_default_account(coa, ledger_roles.ASSET_CA_CASH)
    income_account = _get_role_default_account(coa, ledger_roles.INCOME_OPERATIONAL)

    if not cash_account or not income_account:
        logger.warning(
            "Missing role-default accounts (cash=%s, income=%s) — "
            "check Chart of Accounts for entity '%s'",
            cash_account, income_account, setup.entity_slug,
        )
        return False

    booking = payment.booking
    description = (
        f"Booking {booking.booking_id} — "
        f"{booking.apartment} | "
        f"{booking.check_in} → {booking.check_out}"
    )

    timestamp = payment.paid_at or timezone.now()
    amount = Decimal(str(payment.amount))

    # select_for_update() inside _get_next_state_model requires an explicit
    # transaction — without one SQLite triggers a copy-recursion crash.
    with transaction.atomic():
        je: JournalEntryModel = JournalEntryModel.objects.create(
            ledger=ledger,
            description=description[:100],
            timestamp=timestamp,
        )

        TransactionModel.objects.bulk_create([
            TransactionModel(
                journal_entry=je,
                account=cash_account,
                tx_type=TransactionModel.DEBIT,
                amount=amount,
                description=f"Cash received — {payment.get_payment_method_display()}",
            ),
            TransactionModel(
                journal_entry=je,
                account=income_account,
                tx_type=TransactionModel.CREDIT,
                amount=amount,
                description="Rental income",
            ),
        ])

        je.mark_as_posted(verify=True, force_lock=True, commit=True)

        PaymentLedgerEntry.objects.create(
            payment=payment,
            journal_entry_uuid=je.uuid,
        )

    logger.info("Posted JE %s for Payment %s (amount=%s)", je.uuid, payment.pk, amount)
    return True
