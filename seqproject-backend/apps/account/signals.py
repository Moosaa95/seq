from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.core.mail import send_mail


@receiver(post_save, sender="account.CustomUser")
def notify_on_new_user(sender, instance, created, **kwargs):
    """
    Send a welcome email whenever a new staff/admin user account is created.
    The user creation view handles sending credentials separately; this signal
    covers any creation path (Django shell, admin panel, fixtures, etc.) that
    bypasses the view.
    """
    if not created:
        return
    # Only email users who have an email address
    if not instance.email:
        return

    name = instance.first_name or instance.email.split("@")[0]

    subject = "Welcome to Sequoia Projects"
    message = f"""Hello {name},

Your account has been created on the Sequoia Projects platform.

You can log in at: {getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/admin/login

If you received a separate email with your credentials, use those to sign in.
You will be prompted to change your password on first login.

If you did not expect this email, please contact the administrator.

Best regards,
Sequoia Projects Team
"""
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[instance.email],
            fail_silently=True,
        )
    except Exception:
        pass
