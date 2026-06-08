from django.apps import AppConfig


class LedgerConfig(AppConfig):
    name = 'ledger'
    verbose_name = 'Accounting Ledger'

    def ready(self):
        import ledger.signals  # noqa: F401
