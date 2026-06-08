"""
python manage.py setup_ledger [--entity-name "My Company"] [--reset]

Creates (or retrieves) a Django Ledger EntityModel, populates the default
Chart of Accounts, creates the main booking revenue ledger, and stores the
references in LedgerSetup so that the payment signal handler can use them.
"""
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model

from django_ledger.models.entity import EntityModel

from ledger.models import LedgerSetup

UserModel = get_user_model()

DEFAULT_ENTITY_NAME = "Sequoia Projects"
DEFAULT_LEDGER_XID = "booking-revenue"


class Command(BaseCommand):
    help = "Bootstrap Django Ledger entity, Chart of Accounts, and main ledger."

    def add_arguments(self, parser):
        parser.add_argument(
            '--entity-name',
            default=DEFAULT_ENTITY_NAME,
            help='Display name for the accounting entity (default: "Sequoia Projects")',
        )
        parser.add_argument(
            '--admin-username',
            default=None,
            help='Username of the superuser to assign as entity admin. Defaults to first superuser.',
        )
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Delete existing LedgerSetup rows and re-create the entity from scratch.',
        )

    def handle(self, *args, **options):
        entity_name = options['entity_name']
        reset = options['reset']
        admin_username = options['admin_username']

        # --- Resolve admin user ---
        if admin_username:
            try:
                admin_user = UserModel.objects.get(username=admin_username)
            except UserModel.DoesNotExist:
                raise CommandError(f"User '{admin_username}' not found.")
        else:
            admin_user = UserModel.objects.filter(is_superuser=True).order_by('pk').first()
            if not admin_user:
                raise CommandError(
                    "No superuser found. Create one with `python manage.py createsuperuser` first."
                )

        self.stdout.write(f"Using admin user: {admin_user.email}")

        # --- Optionally reset ---
        if reset:
            LedgerSetup.objects.all().delete()
            self.stdout.write(self.style.WARNING("Cleared existing LedgerSetup records."))

        # --- Get or create entity ---
        slug = EntityModel.generate_slug_from_name(entity_name)

        entity_qs = EntityModel.objects.filter(slug=slug, admin=admin_user)
        if entity_qs.exists():
            entity = entity_qs.first()
            self.stdout.write(f"Entity already exists: {entity.slug}")
        else:
            entity = EntityModel.create_entity(
                name=entity_name,
                admin=admin_user,
                use_accrual_method=True,
                fy_start_month=1,
            )
            self.stdout.write(self.style.SUCCESS(f"Created entity: {entity.slug}"))

        # --- Populate default COA (idempotent if run twice) ---
        try:
            entity.populate_default_coa(activate_accounts=True, commit=True)
            self.stdout.write(self.style.SUCCESS("Chart of Accounts populated."))
        except Exception as exc:
            # Already populated — not an error
            self.stdout.write(f"COA note: {exc}")

        # --- Create / retrieve main booking ledger ---
        ledger, created = entity.ledgermodel_set.get_or_create(
            ledger_xid=DEFAULT_LEDGER_XID,
            defaults={
                'name': 'Booking Revenue',
                'posted': True,
            },
        )
        if not ledger.posted:
            ledger.posted = True
            ledger.save(update_fields=['posted'])

        action = "Created" if created else "Found existing"
        self.stdout.write(self.style.SUCCESS(f"{action} ledger: {ledger.name} (xid={DEFAULT_LEDGER_XID})"))

        # --- Persist references in LedgerSetup ---
        LedgerSetup.objects.filter(is_active=True).update(is_active=False)
        LedgerSetup.objects.create(
            entity_slug=entity.slug,
            main_ledger_xid=DEFAULT_LEDGER_XID,
            is_active=True,
        )
        self.stdout.write(self.style.SUCCESS(
            f"\nLedger setup complete.\n"
            f"  Entity slug : {entity.slug}\n"
            f"  Ledger xid  : {DEFAULT_LEDGER_XID}\n"
            f"  Ledger UI   : /ledger/entity/{entity.slug}/dashboard/\n"
        ))
