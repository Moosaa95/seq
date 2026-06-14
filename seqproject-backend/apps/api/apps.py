from django.apps import AppConfig


class ApiConfig(AppConfig):
    name = 'api'

    def ready(self):
        from django.db.models.signals import post_save
        from django.dispatch import receiver

        from .models import Booking, GuestProfile

        @receiver(post_save, sender=Booking)
        def sync_guest_profile(sender, instance, created, **kwargs):
            """Auto-create or update a GuestProfile whenever a booking is saved."""
            if not created:
                return
            try:
                profile = None
                if instance.email:
                    profile = GuestProfile.objects.filter(email__iexact=instance.email).first()
                if not profile and instance.phone:
                    profile = GuestProfile.objects.filter(phone=instance.phone).first()

                if profile:
                    changed = False
                    if instance.name and profile.name != instance.name:
                        profile.name = instance.name
                        changed = True
                    if instance.phone and not profile.phone:
                        profile.phone = instance.phone
                        changed = True
                    if getattr(instance, 'address', None) and not profile.address:
                        profile.address = instance.address
                        changed = True
                    if getattr(instance, 'id_type', None) and not profile.id_type:
                        profile.id_type = instance.id_type
                        changed = True
                    if changed:
                        profile.save()
                else:
                    GuestProfile.objects.create(
                        name=instance.name,
                        email=instance.email or None,
                        phone=instance.phone or None,
                        address=getattr(instance, 'address', None) or None,
                        id_type=getattr(instance, 'id_type', None) or None,
                    )
            except Exception:
                import logging
                logging.getLogger(__name__).exception(
                    'Failed to sync GuestProfile for booking %s', instance.pk
                )
