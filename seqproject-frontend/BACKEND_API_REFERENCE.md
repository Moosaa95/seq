# Backend API Reference for Property CRUD Operations

This document outlines the Django REST Framework endpoints required for property management.

## Required Endpoints

### 1. List Properties (GET /api/properties/)
Already exists - no changes needed.

### 2. Get Single Property (GET /api/properties/{id}/)
Already exists - no changes needed.

### 3. Create Property (POST /api/properties/)

**Request Format**: `multipart/form-data`

**Fields**:
```python
# Basic property fields
- title: str (required)
- location: str (required)
- price: decimal (required)
- currency: str (required)
- status: str (required, choices: ['rent', 'sale'])
- type: str (required)
- area: int (optional)
- guests: int (optional)
- bedrooms: int (required)
- bathrooms: int (required)
- living_rooms: int (required)
- garages: int (optional)
- description: str (required)
- entity: str (optional)
- featured: bool (optional, default: false)

# Amenities (can be sent multiple times)
- amenities: str[] (e.g., ["WiFi", "Pool", "Gym"])

# Agent information
- agent_name: str (required)
- agent_phone: str (required)
- agent_mobile: str (required)
- agent_email: str (required)

# Images (multipart files)
- images: File[] (multiple image files)
- image_0_category: str (category for first image)
- image_0_order: int (order for first image)
- image_0_is_primary: bool (whether first image is primary)
# ... repeat for each image
```

**Response**: Returns the created property object

**Implementation Example**:

```python
# In serializers.py
from rest_framework import serializers
from .models import Property, PropertyImage, Agent

class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = ['id', 'name', 'phone', 'mobile', 'email', 'skype']
        read_only_fields = ['id']

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'category', 'order', 'is_primary']
        read_only_fields = ['id']

class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    agent = AgentSerializer(read_only=True)

    # Write-only fields for creating agent
    agent_name = serializers.CharField(write_only=True, required=False)
    agent_phone = serializers.CharField(write_only=True, required=False)
    agent_mobile = serializers.CharField(write_only=True, required=False)
    agent_email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_amenities(self, value):
        """Ensure amenities is stored as a list"""
        if isinstance(value, str):
            try:
                import json
                return json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Amenities must be valid JSON")
        return value

    def create(self, validated_data):
        # Extract agent data
        agent_data = {
            'name': validated_data.pop('agent_name', ''),
            'phone': validated_data.pop('agent_phone', ''),
            'mobile': validated_data.pop('agent_mobile', ''),
            'email': validated_data.pop('agent_email', ''),
        }

        # Get or create agent
        agent, _ = Agent.objects.get_or_create(
            email=agent_data['email'],
            defaults=agent_data
        )

        validated_data['agent'] = agent

        # Create property
        property_instance = Property.objects.create(**validated_data)

        return property_instance

# In views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Property, PropertyImage
from .serializers import PropertySerializer

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        property_instance = serializer.save()

        # Handle image uploads
        images = request.FILES.getlist('images')
        for idx, image_file in enumerate(images):
            category = request.data.get(f'image_{idx}_category', 'Other')
            order = int(request.data.get(f'image_{idx}_order', idx))
            is_primary = request.data.get(f'image_{idx}_is_primary', 'false').lower() == 'true'

            PropertyImage.objects.create(
                property=property_instance,
                image=image_file,
                category=category,
                order=order,
                is_primary=is_primary
            )

        # Return the created property with images
        headers = self.get_success_headers(serializer.data)
        output_serializer = self.get_serializer(property_instance)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
```

### 4. Update Property (PATCH /api/properties/{id}/)

**Request Format**: `multipart/form-data`

**Fields**: Same as Create Property endpoint

**Additional Fields for Existing Images**:
```python
# For updating metadata of existing images
- existing_image_{image_id}_category: str
- existing_image_{image_id}_order: int
- existing_image_{image_id}_is_primary: bool
```

**Response**: Returns the updated property object

**Implementation Example**:

```python
def update(self, request, *args, **kwargs):
    partial = kwargs.pop('partial', False)
    instance = self.get_object()
    serializer = self.get_serializer(instance, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    property_instance = serializer.save()

    # Handle new image uploads
    images = request.FILES.getlist('images')
    for idx, image_file in enumerate(images):
        category = request.data.get(f'image_{idx}_category', 'Other')
        order = int(request.data.get(f'image_{idx}_order', idx))
        is_primary = request.data.get(f'image_{idx}_is_primary', 'false').lower() == 'true'

        PropertyImage.objects.create(
            property=property_instance,
            image=image_file,
            category=category,
            order=order,
            is_primary=is_primary
        )

    # Update existing images metadata
    for key in request.data.keys():
        if key.startswith('existing_image_') and key.endswith('_category'):
            image_id = key.split('_')[2]
            try:
                image = PropertyImage.objects.get(id=image_id, property=property_instance)
                image.category = request.data.get(f'existing_image_{image_id}_category')
                image.order = int(request.data.get(f'existing_image_{image_id}_order', image.order))
                image.is_primary = request.data.get(f'existing_image_{image_id}_is_primary', 'false').lower() == 'true'
                image.save()
            except PropertyImage.DoesNotExist:
                pass

    output_serializer = self.get_serializer(property_instance)
    return Response(output_serializer.data)

def partial_update(self, request, *args, **kwargs):
    kwargs['partial'] = True
    return self.update(request, *args, **kwargs)
```

### 5. Delete Property (DELETE /api/properties/{id}/)

**Request**: No body required

**Response**:
```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

**Implementation Example**:

```python
def destroy(self, request, *args, **kwargs):
    instance = self.get_object()
    self.perform_destroy(instance)
    return Response({
        'success': True,
        'message': 'Property deleted successfully'
    }, status=status.HTTP_200_OK)
```

## Models Required

### Property Model
```python
from django.db import models

class Property(models.Model):
    STATUS_CHOICES = [
        ('rent', 'For Rent'),
        ('sale', 'For Sale'),
    ]

    title = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='₦')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    type = models.CharField(max_length=100)
    area = models.IntegerField(null=True, blank=True)
    guests = models.IntegerField(null=True, blank=True)
    bedrooms = models.IntegerField()
    bathrooms = models.IntegerField()
    living_rooms = models.IntegerField()
    garages = models.IntegerField(default=0)
    description = models.TextField()
    amenities = models.JSONField(default=list)  # Store as JSON array
    entity = models.CharField(max_length=255, null=True, blank=True)
    agent = models.ForeignKey('Agent', on_delete=models.CASCADE, related_name='properties')
    featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True)
    available_from = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
```

### PropertyImage Model
```python
class PropertyImage(models.Model):
    CATEGORY_CHOICES = [
        ('Living Room', 'Living Room'),
        ('Kitchen', 'Kitchen'),
        ('Bedroom', 'Bedroom'),
        ('Bathroom', 'Bathroom'),
        ('Exterior', 'Exterior'),
        ('Garden', 'Garden'),
        ('Pool', 'Pool'),
        ('Gym', 'Gym'),
        ('Parking', 'Parking'),
        ('Additional Views', 'Additional Views'),
        ('Other', 'Other'),
    ]

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='properties/%Y/%m/%d/')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Other')
    order = models.IntegerField(default=0)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.property.title} - {self.category} ({self.order})"
```

### Agent Model
```python
class Agent(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    mobile = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    skype = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.name
```

## URL Configuration

```python
# In urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet

router = DefaultRouter()
router.register(r'properties', PropertyViewSet, basename='property')

urlpatterns = [
    path('api/', include(router.urls)),
]
```

## Settings Configuration

```python
# In settings.py

INSTALLED_APPS = [
    # ...
    'rest_framework',
    'corsheaders',
    # your app
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... other middleware
]

# CORS settings for development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
}
```

## Testing the Endpoints

You can test the endpoints using curl:

```bash
# Create Property
curl -X POST http://localhost:8000/api/properties/ \
  -F "title=Luxury Apartment" \
  -F "location=Abuja" \
  -F "price=5000000" \
  -F "currency=₦" \
  -F "status=sale" \
  -F "type=Apartment" \
  -F "bedrooms=3" \
  -F "bathrooms=2" \
  -F "living_rooms=1" \
  -F "description=Beautiful apartment" \
  -F "agent_name=John Doe" \
  -F "agent_email=john@example.com" \
  -F "agent_phone=+2341234567890" \
  -F "agent_mobile=+2341234567890" \
  -F "images=@/path/to/image1.jpg" \
  -F "image_0_category=Living Room" \
  -F "image_0_order=0" \
  -F "image_0_is_primary=true"

# Update Property
curl -X PATCH http://localhost:8000/api/properties/1/ \
  -F "title=Updated Luxury Apartment" \
  -F "price=5500000"

# Delete Property
curl -X DELETE http://localhost:8000/api/properties/1/
```

## Frontend Integration Status

✅ All frontend endpoints are integrated and ready:
- Create Property: `/admin/properties/new`
- Edit Property: `/admin/properties/{id}/edit`
- Delete Property: Property list page
- Toast notifications using sonner
- Image upload with categories and primary selection
