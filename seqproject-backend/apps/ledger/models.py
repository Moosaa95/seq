from django.db import models


class LedgerSetup(models.Model):
    """
    Singleton storing the Django Ledger entity/ledger references for this app.
    Run `python manage.py setup_ledger` to populate this.
    """
    entity_slug = models.SlugField(max_length=200, help_text="Slug of the Django Ledger EntityModel")
    main_ledger_xid = models.SlugField(max_length=200, default='booking-revenue',
                                       help_text="ledger_xid of the main booking revenue ledger")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Ledger Setup"
        verbose_name_plural = "Ledger Setup"

    def __str__(self):
        return f"LedgerSetup: {self.entity_slug}"

    @classmethod
    def get_active(cls):
        return cls.objects.filter(is_active=True).first()


class PaymentLedgerEntry(models.Model):
    """
    Tracks which Payment records have been posted to Django Ledger.
    Prevents duplicate journal entries on repeated saves.
    """
    payment = models.OneToOneField(
        'api.Payment',
        on_delete=models.CASCADE,
        related_name='ledger_entry',
    )
    journal_entry_uuid = models.UUIDField(
        help_text="UUID of the JournalEntryModel in Django Ledger"
    )
    posted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Payment Ledger Entry"
        verbose_name_plural = "Payment Ledger Entries"

    def __str__(self):
        return f"JE {self.journal_entry_uuid} → Payment {self.payment_id}"
