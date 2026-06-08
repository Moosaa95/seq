from django.contrib import admin
from django.utils.html import format_html

from ledger.models import LedgerSetup, PaymentLedgerEntry


@admin.register(LedgerSetup)
class LedgerSetupAdmin(admin.ModelAdmin):
    list_display = ('entity_slug', 'main_ledger_xid', 'is_active', 'created_at')
    readonly_fields = ('created_at',)


@admin.register(PaymentLedgerEntry)
class PaymentLedgerEntryAdmin(admin.ModelAdmin):
    list_display = ('payment', 'journal_entry_uuid', 'posted_at', 'ledger_link')
    readonly_fields = ('payment', 'journal_entry_uuid', 'posted_at')
    search_fields = ('journal_entry_uuid',)

    def ledger_link(self, obj):
        setup = LedgerSetup.get_active()
        if not setup:
            return '—'
        url = f'/ledger/entity/{setup.entity_slug}/je/{obj.journal_entry_uuid}/'
        return format_html('<a href="{}" target="_blank">View JE</a>', url)
    ledger_link.short_description = 'Django Ledger'
