from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import (
    Country, State, Location, Property, Apartment, Agent,
    InventoryItem, LocationInventory, PropertyInventory, ApartmentInventory,
    PROPERTY_STATUS_CHOICES, CURRENCY_CHOICES
)
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with sample data for properties, units, locations, and users'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # 1. Create Users
        admin_user, created = User.objects.get_or_create(
            email='admin@seqprojects.com',
            defaults={
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Created admin user'))

        # 2. Create Agents
        agents_data = [
            {'name': 'Tijjani Musa', 'email': 'tijjani@seqprojects.com', 'phone': '08012345678', 'mobile': '08012345678'},
            {'name': 'Aminu Ibrahim', 'email': 'aminu@seqprojects.com', 'phone': '08023456789', 'mobile': '08023456789'},
        ]
        agents = []
        for agent_info in agents_data:
            agent, _ = Agent.objects.get_or_create(email=agent_info['email'], defaults=agent_info)
            agents.append(agent)
        self.stdout.write(self.style.SUCCESS(f'Created {len(agents)} agents'))

        # 3. Create Geography
        nigeria, _ = Country.objects.get_or_create(name='Nigeria', defaults={'code': 'NG'})
        abuja, _ = State.objects.get_or_create(name='Abuja', country=nigeria)

        # 4. Create Locations
        location_names = ['Wuse Zone 2', 'Maitama', 'Asokoro', 'San Gwari District']
        locations = []
        for name in location_names:
            loc, _ = Location.objects.get_or_create(
                name=name,
                defaults={
                    'state': abuja,
                    'address': f'{name}, Abuja, Nigeria',
                }
            )
            locations.append(loc)
        self.stdout.write(self.style.SUCCESS(f'Created {len(locations)} locations'))

        # 5. Create Properties (Buildings)
        properties_data = [
            {
                'name': 'Sequoia Heights',
                'description': 'Luxury residential complex in the heart of Maitama.',
                'location': locations[1],  # Maitama
                'amenities': ['Swimming Pool', 'Gym', '24/7 Security', 'Elevator'],
                'entity': 'Sequoia Projects Ltd',
                'featured': True,
            },
            {
                'name': 'San Gwari Complex',
                'description': 'Modern living spaces in San Gwari District.',
                'location': locations[3],  # San Gwari
                'amenities': ['Parking', 'CCTV', 'Solar Power'],
                'entity': 'San Gwari Real Estate',
                'featured': False,
            },
            {
                'name': 'Wuse Platinum Apartments',
                'description': 'Premium apartments in Wuse Zone 2.',
                'location': locations[0],  # Wuse
                'amenities': ['WiFi', 'Laundry', 'Lounge'],
                'entity': 'Platinum Properties',
                'featured': True,
            }
        ]
        
        properties = []
        for prop_info in properties_data:
            prop, created = Property.objects.get_or_create(
                name=prop_info['name'],
                defaults=prop_info
            )
            properties.append(prop)
        self.stdout.write(self.style.SUCCESS(f'Created {len(properties)} properties'))

        # 6. Create Apartments (Units)
        apartments_data = [
            # Sequoia Heights Units
            {
                'title': 'Luxury 3-Bedroom Penthouse',
                'parent_property': properties[0],
                'price': 1500000,
                'status': PROPERTY_STATUS_CHOICES.RENT,
                'type': 'Penthouse',
                'bedrooms': 3,
                'bathrooms': 4,
                'guests': 6,
                'featured': True,
            },
            {
                'title': 'Executive 2-Bedroom Suite',
                'parent_property': properties[0],
                'price': 850000,
                'status': PROPERTY_STATUS_CHOICES.RENT,
                'type': 'Apartment',
                'bedrooms': 2,
                'bathrooms': 2,
                'guests': 4,
                'featured': False,
            },
            # San Gwari Complex Units
            {
                'title': 'Modern Studio Apartment',
                'parent_property': properties[1],
                'price': 350000,
                'status': PROPERTY_STATUS_CHOICES.RENT,
                'type': 'Studio',
                'bedrooms': 1,
                'bathrooms': 1,
                'guests': 2,
                'featured': False,
            },
            {
                'title': 'San Gwari 2-Bedroom Unit',
                'parent_property': properties[1],
                'price': 550000,
                'status': PROPERTY_STATUS_CHOICES.RENT,
                'type': 'Apartment',
                'bedrooms': 2,
                'bathrooms': 2,
                'guests': 4,
                'featured': True,
            },
            # Wuse Platinum Units
            {
                'title': 'Platinum 1-Bedroom Flat',
                'parent_property': properties[2],
                'price': 450000,
                'status': PROPERTY_STATUS_CHOICES.RENT,
                'type': 'Apartment',
                'bedrooms': 1,
                'bathrooms': 1,
                'guests': 2,
                'featured': False,
            }
        ]

        for apt_info in apartments_data:
            apt, created = Apartment.objects.get_or_create(
                title=apt_info['title'],
                parent_property=apt_info['parent_property'],
                defaults={
                    **apt_info,
                    'agent': random.choice(agents),
                    'currency': CURRENCY_CHOICES.NGN,
                    'description': f'A beautiful {apt_info["type"]} at {apt_info["parent_property"].name}.',
                    'amenities': ['WiFi', 'AC', 'TV'],
                }
            )
        self.stdout.write(self.style.SUCCESS(f'Created {len(apartments_data)} apartments'))

        # 7. Create Inventory Items
        inventory_items_data = [
            {'name': 'White Bedsheet', 'category': 'Bedroom', 'unit': 'pieces', 'description': 'Standard white luxury bedsheet'},
            {'name': 'Bath Towel', 'category': 'Bathroom', 'unit': 'pieces', 'description': 'Soft cotton bath towel'},
            {'name': 'Cement Bag', 'category': 'Construction', 'unit': 'bags', 'description': '50kg Dangote Cement'},
        ]
        inventory_items = []
        for item_info in inventory_items_data:
            item, _ = InventoryItem.objects.get_or_create(name=item_info['name'], defaults=item_info)
            inventory_items.append(item)
        self.stdout.write(self.style.SUCCESS(f'Created {len(inventory_items)} inventory items'))

        # 8. Seed Initial Stock
        # Seed Location Stock
        for loc in locations:
            for item in inventory_items:
                LocationInventory.objects.get_or_create(
                    location=loc,
                    item=item,
                    defaults={'quantity': random.randint(50, 200), 'min_threshold': 20}
                )
        
        # Seed Property Stock
        for prop in properties:
            for item in inventory_items:
                PropertyInventory.objects.get_or_create(
                    property=prop,
                    item=item,
                    defaults={'quantity': random.randint(10, 50)}
                )

        self.stdout.write(self.style.SUCCESS('Data seeding completed successfully!'))
