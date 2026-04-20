# Django Backend Setup Guide

## Quick Fix for Current Errors

### Error 1: `id: ["This field is required."]`

**Solution**: In your Django `serializers.py`, make sure `id` is in `read_only_fields`:

```python
class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']  # ← Add 'id' here
```

### Error 2: `amenities: ["Value must be valid JSON."]`

**Solution**: Add a validator to handle JSON string from FormData:

```python
class PropertySerializer(serializers.ModelSerializer):
    # ... other code ...

    def validate_amenities(self, value):
        """Handle amenities sent as JSON string from FormData"""
        if isinstance(value, str):
            try:
                import json
                return json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Amenities must be valid JSON")
        return value
```

## Complete Minimal Backend Setup

### 1. Install Required Packages

```bash
pip install django djangorestframework django-cors-headers pillow
```

### 2. Django Settings (`settings.py`)

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party apps
    'rest_framework',
    'corsheaders',

    # Your app
    'api',  # Replace with your app name
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ← Add this at the top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Or for development only (less secure):
# CORS_ALLOW_ALL_ORIGINS = True

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
}
```

### 3. Models (`api/models.py`)

```python
from django.db import models

class Agent(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    mobile = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    skype = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.name


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
    amenities = models.JSONField(default=list)
    entity = models.CharField(max_length=255, null=True, blank=True)
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='properties')
    featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True)
    available_from = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Properties'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


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
        return f"{self.property.title} - {self.category}"
```

### 4. Serializers (`api/serializers.py`)

```python
from rest_framework import serializers
from .models import Property, PropertyImage, Agent
import json


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = ['id', 'name', 'phone', 'mobile', 'email', 'skype']
        read_only_fields = ['id']


class PropertyImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'category', 'order', 'is_primary']
        read_only_fields = ['id']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    agent = AgentSerializer(read_only=True)

    # Write-only fields for agent creation/update
    agent_name = serializers.CharField(write_only=True, required=False)
    agent_phone = serializers.CharField(write_only=True, required=False)
    agent_mobile = serializers.CharField(write_only=True, required=False)
    agent_email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_amenities(self, value):
        """Handle amenities sent as JSON string from FormData"""
        if isinstance(value, str):
            try:
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
        property_instance = Property.objects.create(**validated_data)
        return property_instance

    def update(self, instance, validated_data):
        # Handle agent update if provided
        if 'agent_email' in validated_data:
            agent_data = {
                'name': validated_data.pop('agent_name', instance.agent.name),
                'phone': validated_data.pop('agent_phone', instance.agent.phone),
                'mobile': validated_data.pop('agent_mobile', instance.agent.mobile),
                'email': validated_data.pop('agent_email', instance.agent.email),
            }
            agent, _ = Agent.objects.get_or_create(
                email=agent_data['email'],
                defaults=agent_data
            )
            validated_data['agent'] = agent

        # Update property fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
```

### 5. Views (`api/views.py`)

```python
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Property, PropertyImage
from .serializers import PropertySerializer


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        queryset = Property.objects.all()

        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by type
        type_filter = self.request.query_params.get('type', None)
        if type_filter:
            queryset = queryset.filter(type=type_filter)

        # Filter by featured
        featured = self.request.query_params.get('featured', None)
        if featured:
            queryset = queryset.filter(featured=featured.lower() == 'true')

        return queryset

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
        return Response(
            output_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

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
                    is_primary_str = request.data.get(f'existing_image_{image_id}_is_primary', 'false')
                    image.is_primary = is_primary_str.lower() == 'true'
                    image.save()
                except PropertyImage.DoesNotExist:
                    pass

        output_serializer = self.get_serializer(property_instance)
        return Response(output_serializer.data)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'success': True,
            'message': 'Property deleted successfully'
        }, status=status.HTTP_200_OK)
```

### 6. URLs (`api/urls.py`)

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet

router = DefaultRouter()
router.register(r'properties', PropertyViewSet, basename='property')

urlpatterns = [
    path('', include(router.urls)),
]
```

### 7. Main URLs (`project/urls.py`)

```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # Replace 'api' with your app name
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### 8. Admin Configuration (`api/admin.py`)

```python
from django.contrib import admin
from .models import Property, PropertyImage, Agent


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'mobile']
    search_fields = ['name', 'email']


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['title', 'location', 'price', 'status', 'type', 'featured', 'created_at']
    list_filter = ['status', 'type', 'featured', 'is_active']
    search_fields = ['title', 'location', 'description']
    inlines = [PropertyImageInline]


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ['property', 'category', 'order', 'is_primary', 'created_at']
    list_filter = ['category', 'is_primary']
```

### 9. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser  # Create admin user
python manage.py runserver
```

### 10. Test the API

```bash
# Test in browser
http://localhost:8000/api/properties/

# Or use the Django admin
http://localhost:8000/admin/
```

## Frontend is Already Configured

The frontend at `http://localhost:3000` is ready and will automatically connect to your backend at `http://localhost:8000/api/`.

Make sure your `.env.local` has:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```
