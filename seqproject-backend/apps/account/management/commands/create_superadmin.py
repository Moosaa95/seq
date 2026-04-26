from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import getpass

User = get_user_model()


class Command(BaseCommand):
    help = 'Creates a super admin user with full system access'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Admin email address')
        parser.add_argument('--first-name', type=str, help='First name')
        parser.add_argument('--last-name', type=str, help='Last name')
        parser.add_argument('--password', type=str, help='Password (not recommended — use interactive prompt)')

    def handle(self, *args, **options):
        self.stdout.write(self.style.HTTP_INFO('\n=== Create Super Admin ===\n'))

        # Email
        email = options.get('email')
        if not email:
            while True:
                email = input('Email: ').strip()
                if not email:
                    self.stderr.write('Email cannot be empty.')
                    continue
                try:
                    validate_email(email)
                except ValidationError:
                    self.stderr.write('Invalid email format.')
                    continue
                break
        else:
            try:
                validate_email(email)
            except ValidationError:
                self.stdout.write(self.style.ERROR('Invalid email format.'))
                return

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'User with email {email} already exists.'))
            update = input('Update password for this user? [y/N]: ').strip().lower()
            if update == 'y':
                user = User.objects.get(email=email)
                password = getpass.getpass('New Password: ')
                if len(password) < 8:
                    self.stdout.write(self.style.ERROR('Password must be at least 8 characters.'))
                    return
                user.set_password(password)
                user.is_superuser = True
                user.is_staff = True
                user.is_active = True
                user.save()
                self._ensure_superadmin_role(user)
                self.stdout.write(self.style.SUCCESS(f'Super admin "{email}" updated successfully!'))
            return

        # First name
        first_name = options.get('first_name') or options.get('first-name')
        if not first_name:
            while True:
                first_name = input('First Name: ').strip()
                if not first_name:
                    self.stderr.write('First name cannot be empty.')
                    continue
                break

        # Last name
        last_name = options.get('last_name') or options.get('last-name')
        if not last_name:
            while True:
                last_name = input('Last Name: ').strip()
                if not last_name:
                    self.stderr.write('Last name cannot be empty.')
                    continue
                break

        # Password
        password = options.get('password')
        if not password:
            while True:
                password = getpass.getpass('Password: ')
                if not password:
                    self.stderr.write('Password cannot be empty.')
                    continue
                if len(password) < 8:
                    self.stderr.write('Password must be at least 8 characters long.')
                    continue
                confirm = getpass.getpass('Confirm Password: ')
                if password != confirm:
                    self.stderr.write('Passwords do not match.')
                    continue
                break
        elif len(password) < 8:
            self.stdout.write(self.style.ERROR('Password must be at least 8 characters.'))
            return

        try:
            user = User.objects.create_superuser(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )
            self._ensure_superadmin_role(user)
            self.stdout.write(self.style.SUCCESS(
                f'\nSuper admin "{email}" created successfully!\n'
                f'  Name: {first_name} {last_name}\n'
                f'  is_staff: True\n'
                f'  is_superuser: True\n'
            ))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating super admin: {e}'))

    def _ensure_superadmin_role(self, user):
        """Ensure a Super Admin role exists and is assigned to the user."""
        from account.models import UserRole  # noqa: uses short app name
        from apps.account.permissions import Permissions

        role, created = UserRole.objects.get_or_create(
            name='Super Admin',
            defaults={
                'description': 'Full system access — all permissions granted',
                'is_superuser_role': True,
                'permissions': Permissions.all_permissions(),
            }
        )
        if not created and not role.is_superuser_role:
            role.is_superuser_role = True
            role.permissions = Permissions.all_permissions()
            role.save()

        user.role = role
        user.save(update_fields=['role'])
