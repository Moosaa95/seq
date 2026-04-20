import os
import cloudinary
import cloudinary.uploader
from django.core.management.base import BaseCommand
from api.models import (
    Country, State, Location, Property, PropertyImage,
    Apartment, ApartmentImage, Agent,
)


class Command(BaseCommand):
    help = 'Seeds Arusha 101 property with its 4 apartments and uploads all images to Cloudinary'

    def handle(self, *args, **options):
        # ── Resolve frontend public/ directory ────────────────────────────
        cmd_file = os.path.abspath(__file__)
        project_root = cmd_file
        for _ in range(5):           # commands → management → api → apps → backend → project root
            project_root = os.path.dirname(project_root)
        frontend_public = os.path.join(project_root, 'seqproject-frontend', 'public')
        self.stdout.write(f'Frontend public: {frontend_public}')

        # ── Image upload helper ───────────────────────────────────────────
        def upload_image(relative_path, folder):
            full_path = os.path.join(frontend_public, relative_path)
            if not os.path.exists(full_path):
                self.stdout.write(self.style.WARNING(f'  [SKIP] Not found: {relative_path}'))
                return None
            try:
                result = cloudinary.uploader.upload(
                    full_path,
                    folder=folder,
                    overwrite=False,
                    resource_type='image',
                )
                self.stdout.write(f'  [OK] {os.path.basename(relative_path)}')
                return result['public_id']
            except Exception as exc:
                self.stdout.write(self.style.ERROR(f'  [ERR] {relative_path}: {exc}'))
                return None

        def upload_dir(relative_dir, folder, category=None):
            """Upload every image in a directory, return list of public_ids."""
            full_dir = os.path.join(frontend_public, relative_dir)
            if not os.path.isdir(full_dir):
                self.stdout.write(self.style.WARNING(f'  [SKIP DIR] Not found: {relative_dir}'))
                return []
            results = []
            for filename in sorted(os.listdir(full_dir)):
                if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    public_id = upload_image(os.path.join(relative_dir, filename), folder)
                    if public_id:
                        results.append(public_id)
            return results

        # ── 1. Geography ──────────────────────────────────────────────────
        nigeria, _ = Country.objects.get_or_create(name='Nigeria', defaults={'code': 'NG'})
        abuja, _ = State.objects.get_or_create(name='Abuja', country=nigeria)
        wuse1, _ = Location.objects.get_or_create(
            name='Wuse Zone 1',
            defaults={'state': abuja, 'address': 'Wuse Zone 1, Abuja, Nigeria'},
        )
        self.stdout.write(self.style.SUCCESS('Geography ready'))

        # ── 2. Agent ──────────────────────────────────────────────────────
        agent, _ = Agent.objects.get_or_create(
            email='tijjani@seqprojects.com',
            defaults={
                'name': 'Tijjani Musa',
                'phone': '+234 802 345 6789',
                'mobile': '+234 802 345 6789',
            },
        )
        self.stdout.write(self.style.SUCCESS(f'Agent: {agent.name}'))

        # ── 3. Property: Arusha 101 ───────────────────────────────────────
        prop, prop_created = Property.objects.get_or_create(
            name='Arusha 101',
            defaults={
                'description': (
                    'Arusha 101 is a premium short-let complex nestled in the heart of '
                    'Wuse Zone 1, Abuja — just 4 minutes from the US Embassy. This quiet, '
                    'secure residential development offers 4 beautifully appointed apartment '
                    'units, each fully serviced and equipped for an effortless stay. Within '
                    'walking distance to groceries, restaurants, and local amenities.'
                ),
                'location': wuse1,
                'amenities': [
                    'WiFi', '24/7 Electricity', 'Security', 'Parking',
                    'Water Supply', 'Air Conditioning', 'Fully Equipped Kitchen', 'Cable TV',
                ],
                'entity': 'Arusha Property Management',
                'featured': True,
                'is_active': True,
            },
        )
        action = 'Created' if prop_created else 'Already exists'
        self.stdout.write(self.style.SUCCESS(f'{action}: Property "{prop.name}" ({prop.id})'))

        # ── 4. Property cover images (building exterior / front shots) ────
        #
        # Folder structure:
        #   public/properties/arusha/
        #     arusha-crescent-wuse-zone1-property-front/   ← exterior / building shots
        #     arusha-pictures/                              ← general property photos
        #     arusha-room-pictures/                         ← interior overview shots
        #
        if prop_created:
            self.stdout.write('Uploading property cover images…')
            order = 0

            # Exterior / building front — first image is primary
            front_ids = upload_dir(
                'properties/arusha/arusha-crescent-wuse-zone1-property-front',
                'property_images/arusha_101',
            )
            for i, public_id in enumerate(front_ids):
                PropertyImage.objects.create(
                    property=prop,
                    image=public_id,
                    is_primary=(order == 0),
                    order=order,
                    category='Exterior',
                )
                order += 1

            # General property pictures
            for public_id in upload_dir('properties/arusha/arusha-pictures', 'property_images/arusha_101'):
                PropertyImage.objects.create(
                    property=prop,
                    image=public_id,
                    is_primary=False,
                    order=order,
                    category='General',
                )
                order += 1

            # Interior overview shots
            for public_id in upload_dir('properties/arusha/arusha-room-pictures', 'property_images/arusha_101'):
                PropertyImage.objects.create(
                    property=prop,
                    image=public_id,
                    is_primary=False,
                    order=order,
                    category='Interior',
                )
                order += 1

        # ── 5. Apartments ─────────────────────────────────────────────────
        #
        # Each unit folder contains sub-directories by room category:
        #   living-room/, full-kitchen/, bedroom/, full-bathroom/, additional-photo/
        #
        AMENITIES = [
            'Fully Equipped Kitchen', 'WiFi', '24/7 Electricity',
            'Water Supply', 'Security', 'Parking', 'Air Conditioning',
            'Cable TV', 'Serviced',
        ]

        apartments = [
            {
                'title': 'Arusha 101 — Unit 101',
                'description': (
                    'Experience ultimate comfort in the heart of Abuja — just 4 minutes from '
                    'the US Embassy. Nestled in a quiet, secure residential area, yet within '
                    'walking distance to groceries and eateries. Safe, serene, and perfect for '
                    'both business and leisure travellers.'
                ),
                'base_dir': 'properties/arusha-101-by-spl -wuse-zone-1',
                'categories': {
                    'Living Room': 'living-room',
                    'Kitchen': 'full-kitchen',
                    'Bedroom': 'bedroom',
                    'Bathroom': 'full-bathroom',
                    'Additional Views': 'additional-photo',
                },
            },
            {
                'title': 'Arusha 101 — Unit 102',
                'description': (
                    'Experience ultimate comfort in the heart of Abuja. This stylish, centrally '
                    'located retreat offers easy access to top restaurants and stores, yet sits '
                    'within a quiet, secure residential neighbourhood — perfect for relaxation '
                    'and convenience.'
                ),
                'base_dir': 'properties/arusha-102',
                'categories': {
                    'Living Room': 'living-room',
                    'Kitchen': 'full-kitchen',
                    'Bedroom': 'bedroom',
                    'Bathroom': 'full-bathroom',
                    'Additional Views': 'additional-photo',
                },
            },
            {
                'title': 'Arusha 101 — Unit 103',
                'description': (
                    'Experience ultimate comfort in the heart of Abuja — just 4 minutes from '
                    'the US Embassy. Nestled in a quiet, secure residential area, yet within '
                    'walking distance to groceries and eateries. Safe, serene, and perfect for '
                    'evening strolls.'
                ),
                'base_dir': 'properties/arusha-103',
                'categories': {
                    'Living Room': 'living-room',
                    'Kitchen': 'full-kitchen',
                    'Bedroom': 'bedroom',
                    'Bathroom': 'full-bathroom',
                    'Additional Views': 'additional-photo',
                },
            },
            {
                'title': 'Arusha 101 — Unit 104',
                'description': (
                    'Experience ultimate comfort in the heart of Abuja — just 4 minutes from '
                    'the US Embassy. Nestled in a quiet, secure residential area, yet within '
                    'walking distance to groceries and eateries. Safe, serene, and perfect for '
                    'evening strolls.'
                ),
                'base_dir': 'properties/arusha-104',
                'categories': {
                    'Living Room': 'living-room',
                    'Kitchen': 'full-kitchen',
                    'Bedroom': 'bedroom',
                    'Bathroom': 'full-bathroom',
                    'Additional Views': 'additional-photo',
                },
            },
        ]

        for apt_config in apartments:
            apt, apt_created = Apartment.objects.get_or_create(
                title=apt_config['title'],
                parent_property=prop,
                defaults={
                    'description': apt_config['description'],
                    'price': 75000,
                    'currency': '₦',
                    'status': 'rent',
                    'type': '1-Bedroom',
                    'bedrooms': 1,
                    'bathrooms': 1,
                    'living_rooms': 1,
                    'garages': 1,
                    'guests': 2,
                    'amenities': AMENITIES,
                    'agent': agent,
                    'featured': True,
                    'is_active': True,
                    'entity': 'Arusha Property Management',
                },
            )

            if apt_created:
                self.stdout.write(self.style.SUCCESS(f'\nCreated apartment: {apt_config["title"]}'))
                self.stdout.write('Uploading images…')
                order = 0
                for category, subdir in apt_config['categories'].items():
                    relative_dir = os.path.join(apt_config['base_dir'], subdir)
                    for public_id in upload_dir(relative_dir, 'apartment_images/arusha_101'):
                        ApartmentImage.objects.create(
                            apartment=apt,
                            image=public_id,
                            category=category,
                            is_primary=(order == 0),
                            order=order,
                        )
                        order += 1
            else:
                self.stdout.write(f'Already exists: {apt_config["title"]}')

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('══════════════════════════════════════════'))
        self.stdout.write(self.style.SUCCESS(' Arusha 101 seeding complete!'))
        self.stdout.write(self.style.SUCCESS(f' Property ID : {prop.id}'))
        self.stdout.write(self.style.SUCCESS(f' Apartments  : {prop.apartments.count()}'))
        self.stdout.write(self.style.SUCCESS('══════════════════════════════════════════'))
