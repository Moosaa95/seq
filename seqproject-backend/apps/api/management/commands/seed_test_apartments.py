from django.core.management.base import BaseCommand
from api.models import Country, State, Location, Property, Apartment, Agent


class Command(BaseCommand):
    help = 'Seeds 5 test apartments under a test property for development/testing'

    def handle(self, *args, **options):
        # ── Geography ─────────────────────────────────────────────────────
        nigeria, _ = Country.objects.get_or_create(name='Nigeria', defaults={'code': 'NG'})
        abuja, _ = State.objects.get_or_create(name='Abuja', country=nigeria)
        maitama, _ = Location.objects.get_or_create(
            name='Maitama',
            defaults={'state': abuja, 'address': 'Maitama District, Abuja, Nigeria'},
        )

        # ── Agent ─────────────────────────────────────────────────────────
        agent, _ = Agent.objects.get_or_create(
            email='tijjani@seqprojects.com',
            defaults={
                'name': 'Tijjani Musa',
                'phone': '+234 802 345 6789',
                'mobile': '+234 802 345 6789',
            },
        )

        # ── Property ──────────────────────────────────────────────────────
        prop, created = Property.objects.get_or_create(
            name='Sequoia Heights',
            defaults={
                'description': (
                    'A premium residential complex in the heart of Maitama, Abuja. '
                    'Offering a range of fully serviced units from studios to 3-bedroom '
                    'apartments, all equipped with modern amenities and 24/7 security.'
                ),
                'location': maitama,
                'amenities': [
                    'WiFi', '24/7 Electricity', 'Security', 'Parking',
                    'Swimming Pool', 'Gym', 'Air Conditioning', 'Elevator',
                ],
                'entity': 'Sequoia Projects Ltd',
                'featured': True,
                'is_active': True,
            },
        )
        self.stdout.write(self.style.SUCCESS(
            f'{"Created" if created else "Found"}: Property "{prop.name}" ({prop.id})'
        ))

        # ── 5 Apartments ──────────────────────────────────────────────────
        apartments = [
            {
                'title': 'Cosy Studio — Ground Floor',
                'description': (
                    'A bright, well-appointed studio perfect for solo travellers or couples. '
                    'Features a fully equipped kitchenette, en-suite bathroom, and high-speed WiFi.'
                ),
                'type': 'Studio',
                'bedrooms': 1,
                'bathrooms': 1,
                'living_rooms': 0,
                'guests': 2,
                'price': 45000,
            },
            {
                'title': 'Classic 1-Bedroom Suite',
                'description': (
                    'Spacious one-bedroom apartment with a separate living area, full kitchen, '
                    'and a private balcony overlooking the gardens. Ideal for business travellers.'
                ),
                'type': '1-Bedroom',
                'bedrooms': 1,
                'bathrooms': 1,
                'living_rooms': 1,
                'guests': 2,
                'price': 75000,
            },
            {
                'title': 'Deluxe 1-Bedroom with Study',
                'description': (
                    'Elegant one-bedroom apartment with a dedicated study area — perfect for '
                    'remote workers. Includes a king-size bed, walk-in wardrobe, and full kitchen.'
                ),
                'type': '1-Bedroom',
                'bedrooms': 1,
                'bathrooms': 2,
                'living_rooms': 1,
                'guests': 3,
                'price': 90000,
            },
            {
                'title': 'Executive 2-Bedroom Apartment',
                'description': (
                    'A generously sized two-bedroom apartment suitable for families or groups. '
                    'Two full bathrooms, a large open-plan living and dining area, and a gourmet kitchen.'
                ),
                'type': '2-Bedroom',
                'bedrooms': 2,
                'bathrooms': 2,
                'living_rooms': 1,
                'guests': 4,
                'price': 130000,
            },
            {
                'title': 'Luxury 3-Bedroom Penthouse',
                'description': (
                    'The crown jewel of Sequoia Heights. This top-floor penthouse offers '
                    'panoramic views of Maitama, three en-suite bedrooms, a private terrace, '
                    'and butler service on request. Unforgettable luxury in the heart of Abuja.'
                ),
                'type': '3-Bedroom',
                'bedrooms': 3,
                'bathrooms': 3,
                'living_rooms': 2,
                'guests': 6,
                'price': 250000,
            },
        ]

        AMENITIES = [
            'Fully Equipped Kitchen', 'WiFi', '24/7 Electricity', 'Water Supply',
            'Security', 'Parking', 'Air Conditioning', 'Cable TV', 'Serviced',
        ]

        created_count = 0
        for apt_data in apartments:
            apt, apt_created = Apartment.objects.get_or_create(
                title=apt_data['title'],
                parent_property=prop,
                defaults={
                    'description': apt_data['description'],
                    'price': apt_data['price'],
                    'currency': '₦',
                    'status': 'rent',
                    'type': apt_data['type'],
                    'bedrooms': apt_data['bedrooms'],
                    'bathrooms': apt_data['bathrooms'],
                    'living_rooms': apt_data['living_rooms'],
                    'guests': apt_data['guests'],
                    'garages': 1,
                    'amenities': AMENITIES,
                    'agent': agent,
                    'featured': True,
                    'is_active': True,
                    'entity': 'Sequoia Projects Ltd',
                },
            )
            status = 'Created' if apt_created else 'Already exists'
            price_str = f'₦{apt_data["price"]:,}/night'
            self.stdout.write(f'  {status}: {apt_data["title"]} — {price_str}')
            if apt_created:
                created_count += 1

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('══════════════════════════════════════════'))
        self.stdout.write(self.style.SUCCESS(f' Done! {created_count} new apartment(s) created'))
        self.stdout.write(self.style.SUCCESS(f' Property: {prop.name}  ({prop.id})'))
        self.stdout.write(self.style.SUCCESS(f' Total units: {prop.apartments.count()}'))
        self.stdout.write(self.style.SUCCESS('══════════════════════════════════════════'))
