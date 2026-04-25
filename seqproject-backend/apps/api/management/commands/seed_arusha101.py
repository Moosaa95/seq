import os

import cloudinary.uploader
from django.core.management.base import BaseCommand

from api.models import (
    Agent,
    Apartment,
    ApartmentImage,
    Country,
    Location,
    Property,
    PropertyImage,
    State,
)


class Command(BaseCommand):
    help = "Seed Arusha 101 property and build units from properties/arusha-101 images"

    def handle(self, *args, **options):
        cmd_file = os.path.abspath(__file__)
        backend_root = cmd_file
        while not os.path.isfile(os.path.join(backend_root, "manage.py")):
            parent = os.path.dirname(backend_root)
            if parent == backend_root:
                self.stdout.write(self.style.ERROR("Could not locate backend root (manage.py not found)"))
                return
            backend_root = parent
        workspace_root = os.path.dirname(backend_root)

        properties_roots = [
            os.path.join(workspace_root, "properties"),
            os.path.join(workspace_root, "seqproject", "properties"),
            os.path.join(workspace_root, "seqproject-frontend", "public"),
            os.path.join(backend_root, "properties"),
        ]
        properties_root = next((path for path in properties_roots if os.path.isdir(path)), None)
        if not properties_root:
            self.stdout.write(self.style.ERROR("Could not find properties root directory"))
            return

        arusha_dir = os.path.join(properties_root, "arusha-101")
        self.stdout.write(f"Properties root: {properties_root}")

        if not os.path.isdir(arusha_dir):
            self.stdout.write(self.style.ERROR("Missing directory: properties/arusha-101"))
            return

        image_files = sorted(
            filename
            for filename in os.listdir(arusha_dir)
            if filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
        )
        if not image_files:
            self.stdout.write(self.style.ERROR("No images found in properties/arusha-101"))
            return

        def upload_image(relative_path, folder):
            full_path = os.path.join(properties_root, relative_path)
            if not os.path.exists(full_path):
                self.stdout.write(self.style.WARNING(f"  [SKIP] Not found: {relative_path}"))
                return None
            try:
                result = cloudinary.uploader.upload(
                    full_path,
                    folder=folder,
                    overwrite=False,
                    resource_type="image",
                )
                self.stdout.write(f"  [OK] {os.path.basename(relative_path)}")
                return result["public_id"]
            except Exception as exc:
                self.stdout.write(self.style.ERROR(f"  [ERR] {relative_path}: {exc}"))
                return None

        nigeria, _ = Country.objects.get_or_create(name="Nigeria", defaults={"code": "NG"})
        abuja, _ = State.objects.get_or_create(name="Abuja", country=nigeria)
        wuse1, _ = Location.objects.get_or_create(
            name="Wuse Zone 1",
            defaults={"state": abuja, "address": "Wuse Zone 1, Abuja, Nigeria"},
        )

        agent, _ = Agent.objects.get_or_create(
            email="tijjani@seqprojects.com",
            defaults={
                "name": "Tijjani Musa",
                "phone": "+234 802 345 6789",
                "mobile": "+234 802 345 6789",
            },
        )

        prop_defaults = {
            "description": (
                "Arusha 101 is a premium short-let complex in Wuse Zone 1, Abuja. "
                "Each media asset in the arusha-101 folder is represented as a "
                "bookable apartment unit."
            ),
            "location": wuse1,
            "amenities": [
                "WiFi",
                "24/7 Electricity",
                "Security",
                "Parking",
                "Water Supply",
                "Air Conditioning",
            ],
            "entity": "Arusha Property Management",
            "featured": True,
            "is_active": True,
        }

        matching_props = Property.objects.filter(name="Arusha 101").order_by("created_at")
        if matching_props.exists():
            prop = matching_props.first()
            prop_created = False
            # Backfill missing fields on the canonical property.
            dirty = False
            for field, value in prop_defaults.items():
                current = getattr(prop, field)
                if current in (None, "", []) and value not in (None, "", []):
                    setattr(prop, field, value)
                    dirty = True
            if dirty:
                prop.save()
        else:
            prop = Property.objects.create(name="Arusha 101", **prop_defaults)
            prop_created = True
        self.stdout.write(
            self.style.SUCCESS(
                f'{"Created" if prop_created else "Using"} property: "{prop.name}" ({prop.id})'
            )
        )

        if prop_created:
            for idx, filename in enumerate(image_files):
                public_id = upload_image(
                    f"arusha-101/{filename}",
                    "property_images/arusha_101",
                )
                if public_id:
                    PropertyImage.objects.create(
                        property=prop,
                        image=public_id,
                        is_primary=(idx == 0),
                        order=idx,
                        category="Exterior" if filename.startswith("front-") else "Interior",
                    )

        unit_amenities = [
            "Fully Equipped Kitchen",
            "WiFi",
            "24/7 Electricity",
            "Water Supply",
            "Security",
            "Parking",
            "Air Conditioning",
            "Serviced",
        ]

        created_units = 0
        for idx, filename in enumerate(image_files, start=1):
            unit_title = f"Arusha 101 - Unit {idx:02d}"
            apt, apt_created = Apartment.objects.get_or_create(
                title=unit_title,
                parent_property=prop,
                defaults={
                    "description": f"Unit sourced from image asset: {filename}",
                    "price": 75000,
                    "currency": "₦",
                    "status": "rent",
                    "type": "Apartment",
                    "bedrooms": 1,
                    "bathrooms": 1,
                    "living_rooms": 1,
                    "garages": 1,
                    "guests": 2,
                    "amenities": unit_amenities,
                    "agent": agent,
                    "featured": idx <= 2,
                    "is_active": True,
                    "entity": "Arusha Property Management",
                },
            )

            if not apt_created:
                self.stdout.write(f"Already exists: {unit_title}")
                continue

            public_id = upload_image(
                f"arusha-101/{filename}",
                "apartment_images/arusha_101",
            )
            if public_id:
                ApartmentImage.objects.create(
                    apartment=apt,
                    image=public_id,
                    category="Exterior" if filename.startswith("front-") else "Interior",
                    is_primary=True,
                    order=0,
                )
            created_units += 1
            self.stdout.write(self.style.SUCCESS(f"Created apartment: {unit_title}"))

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Arusha 101 seeding complete"))
        self.stdout.write(self.style.SUCCESS(f"Property ID : {prop.id}"))
        self.stdout.write(self.style.SUCCESS(f"Units now   : {prop.apartments.count()}"))
        self.stdout.write(self.style.SUCCESS(f"Units added : {created_units}"))
