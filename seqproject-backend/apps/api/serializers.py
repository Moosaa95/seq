from rest_framework import serializers
from django.utils import timezone
from .models import (
    Agent,
    Property,
    PropertyImage,
    Apartment,
    ApartmentImage,
    Booking,
    Payment,
    ContactInquiry,
    ApartmentInquiry,
    ExternalCalendar,
    BlockedDate,
    Location,
    InventoryItem,
    LocationInventory,
    PropertyInventory,
    ApartmentInventory,
    InventoryMovement,
    BookingDispute,
    Country,
    State,
)


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = "__all__"


class StateSerializer(serializers.ModelSerializer):
    country_details = CountrySerializer(source="country", read_only=True)
    country_id = serializers.PrimaryKeyRelatedField(
        queryset=Country.objects.all(), source="country", write_only=True
    )

    class Meta:
        model = State
        fields = [
            "id",
            "name",
            "country_id",
            "country_details",
            "created_at",
            "updated_at",
        ]


class LocationSerializer(serializers.ModelSerializer):
    """Serializer for Location model"""

    inventory_count = serializers.SerializerMethodField()
    state_details = StateSerializer(source="state", read_only=True)
    state_id = serializers.PrimaryKeyRelatedField(
        queryset=State.objects.all(), source="state", write_only=True, required=False, allow_null=True
    )
    # Helper fields to flatten the response for simpler frontend consumption
    state_name = serializers.CharField(source="state.name", read_only=True)
    country_name = serializers.CharField(source="state.country.name", read_only=True)

    class Meta:
        model = Location
        fields = [
            "id",
            "name",
            "address",
            "state_id",
            "state_details",
            "state_name",
            "country_name",
            "is_active",
            "inventory_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_inventory_count(self, obj):
        """Get total number of inventory items at this location"""
        return obj.inventory_stock.count()


class AgentSerializer(serializers.ModelSerializer):
    """Serializer for Agent model"""

    class Meta:
        model = Agent
        fields = ["id", "name", "phone", "mobile", "email", "skype"]


class PropertyImageSerializer(serializers.ModelSerializer):
    """Serializer for Property (Parent Building/Site) Images"""

    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ["id", "image", "image_url", "order", "is_primary"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ApartmentImageSerializer(serializers.ModelSerializer):
    """Serializer for Apartment (Unit) Images"""

    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ApartmentImage
        fields = ["id", "image", "image_url", "category", "order", "is_primary"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class PropertySerializer(serializers.ModelSerializer):
    """Serializer for Parent Building/Complex/Site"""

    images = PropertyImageSerializer(many=True, read_only=True)
    location_details = LocationSerializer(source="location", read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(),
        source="location",
        write_only=True,
        required=False,
        allow_null=True,
    )
    apartment_count = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            "id",
            "name",
            "description",
            "location_id",
            "location_details",
            "amenities",
            "entity",
            "address",
            "latitude",
            "longitude",
            "featured",
            "is_active",
            "images",
            "apartment_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_apartment_count(self, obj):
        return obj.apartments.count()

    def create(self, validated_data):
        property_obj = Property.objects.create(**validated_data)
        
        # Handle images
        request = self.context.get("request")
        if request and request.FILES:
            images = request.FILES.getlist("images")
            for index, image_file in enumerate(images):
                order = int(request.data.get(f"image_{index}_order", index))
                is_primary = request.data.get(f"image_{index}_is_primary", "false").lower() == "true"
                PropertyImage.objects.create(
                    property=property_obj,
                    image=image_file,
                    order=order,
                    is_primary=is_primary,
                )
        return property_obj


class PropertyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for property listings"""

    location_details = LocationSerializer(source="location", read_only=True)
    apartment_count = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = ["id", "name", "featured", "primary_image", "location_details", "apartment_count"]

    def get_apartment_count(self, obj):
        return obj.apartments.count()

    def get_primary_image(self, obj):
        request = self.context.get("request")
        primary_img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if primary_img and primary_img.image and hasattr(primary_img.image, "url"):
            if request is not None:
                return request.build_absolute_uri(primary_img.image.url)
            return primary_img.image.url
        return None


class ApartmentSerializer(serializers.ModelSerializer):
    """Serializer for Individual Apartment Units"""

    agent = AgentSerializer(read_only=True)
    agent_id = serializers.PrimaryKeyRelatedField(
        queryset=Agent.objects.all(), source="agent", write_only=True, required=False
    )
    
    # Parent Property
    property_details = PropertyListSerializer(source="parent_property", read_only=True)
    property_id = serializers.PrimaryKeyRelatedField(
        queryset=Property.objects.all(), source="parent_property", write_only=True, required=False, allow_null=True
    )

    # Images serialization
    images = serializers.SerializerMethodField()
    categorized_images = serializers.SerializerMethodField()

    # Additional computed fields
    is_available = serializers.ReadOnlyField()
    location = serializers.CharField(source="parent_property.location.name", read_only=True)

    class Meta:
        model = Apartment
        fields = [
            "id",
            "parent_property",
            "property_id",
            "property_details",
            "title",
            "location",
            "price",
            "currency",
            "status",
            "type",
            "area",
            "guests",
            "bedrooms",
            "bathrooms",
            "living_rooms",
            "garages",
            "units",
            "description",
            "amenities",
            "entity",
            "agent",
            "agent_id",
            "featured",
            "is_active",
            "available_from",
            "is_available",
            "images",
            "categorized_images",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "is_available"]

    def get_images(self, obj):
        request = self.context.get("request")
        apartment_images = obj.images.all()
        image_urls = []
        for img in apartment_images:
            if img.image and hasattr(img.image, "url"):
                if request is not None:
                    image_urls.append(request.build_absolute_uri(img.image.url))
                else:
                    image_urls.append(img.image.url)
        return image_urls

    def get_categorized_images(self, obj):
        request = self.context.get("request")
        apartment_images = obj.images.exclude(category__isnull=True).exclude(category="")
        categorized = {}
        for img in apartment_images:
            if img.category not in categorized:
                categorized[img.category] = []
            if img.image and hasattr(img.image, "url"):
                if request is not None:
                    categorized[img.category].append(request.build_absolute_uri(img.image.url))
                else:
                    categorized[img.category].append(img.image.url)
        return [{"category": cat, "images": imgs} for cat, imgs in categorized.items()]

    def create(self, validated_data):
        # Sync location char field if location_data present
        if validated_data.get('location_data'):
             validated_data['location'] = validated_data['location_data'].name
             
        apartment = Apartment.objects.create(**validated_data)
        
        # Handle images
        request = self.context.get("request")
        if request and request.FILES:
            images = request.FILES.getlist("images")
            for index, image_file in enumerate(images):
                category = request.data.get(f"image_{index}_category", "")
                order = int(request.data.get(f"image_{index}_order", index))
                is_primary = request.data.get(f"image_{index}_is_primary", "false").lower() == "true"
                ApartmentImage.objects.create(
                    apartment=apartment,
                    image=image_file,
                    category=category,
                    order=order,
                    is_primary=is_primary,
                )
        return apartment


class ApartmentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for apartment listings"""

    agent = AgentSerializer(read_only=True)
    location_data_details = LocationSerializer(source="parent_property.location", read_only=True)
    property_details = PropertyListSerializer(source="parent_property", read_only=True)
    primary_image = serializers.SerializerMethodField()
    location = serializers.CharField(source="parent_property.location.name", read_only=True)

    class Meta:
        model = Apartment
        fields = [
            "id",
            "property_details",
            "title",
            "location",
            "location_data_details",
            "price",
            "currency",
            "status",
            "type",
            "bedrooms",
            "bathrooms",
            "guests",
            "featured",
            "primary_image",
            "agent",
        ]

    def get_primary_image(self, obj):
        """Get the primary/first image for the apartment"""
        request = self.context.get("request")
        primary_img = obj.images.filter(is_primary=True).first() or obj.images.first()

        if primary_img and primary_img.image and hasattr(primary_img.image, "url"):
            if request is not None:
                return request.build_absolute_uri(primary_img.image.url)
            return primary_img.image.url
        return None


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for Bookings"""
    apartment_details = ApartmentListSerializer(source="apartment", read_only=True)
    apartment_id = serializers.CharField(write_only=True)

    class Meta:
        model = Booking
        fields = [
            "booking_id",
            "apartment",
            "apartment_id",
            "apartment_details",
            "name",
            "email",
            "phone",
            "check_in",
            "check_out",
            "guests",
            "nights",
            "total_amount",
            "currency",
            "status",
            "payment_status",
            "special_requests",
            "cancellation_reason",
            "checked_in_at",
            "checked_out_at",
            "occupancy_status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "booking_id",
            "apartment",
            "nights",
            "total_amount",
            "currency",
            "checked_in_at",
            "checked_out_at",
            "created_at",
            "updated_at",
        ]

    def validate(self, data):
        """Validate booking data"""
        check_in = data.get("check_in")
        check_out = data.get("check_out")

        # Validate dates
        if check_in and check_out:
            if check_out <= check_in:
                raise serializers.ValidationError(
                    {"check_out": "Check-out date must be after check-in date"}
                )

            if check_in < timezone.now().date():
                raise serializers.ValidationError(
                    {"check_in": "Check-in date cannot be in the past"}
                )

        # Check apartment availability
        apartment_id = data.get("apartment_id")
        if apartment_id:
            try:
                apartment_obj = Apartment.objects.get(id=apartment_id)
                if not apartment_obj.is_available:
                    raise serializers.ValidationError(
                        {"apartment_id": "This apartment is not currently available"}
                    )

                # Check availability (includes both bookings and blocked dates)
                from .ical_service import ICalService

                is_available = ICalService.check_availability_with_blocked_dates(
                    apartment_obj, check_in, check_out
                )

                # When updating, exclude current booking from check
                if self.instance:
                    # Check if current booking overlaps
                    if self.instance.apartment_id == apartment_id:
                        # Re-check excluding this booking
                        other_bookings = Booking.objects.filter(
                            apartment_id=apartment_id, status__in=["pending", "confirmed"]
                        ).filter(check_in__lt=check_out, check_out__gt=check_in).exclude(pk=self.instance.pk)

                        # Check blocked dates
                        from .models import BlockedDate
                        blocked = BlockedDate.objects.filter(
                            apartment_id=apartment_id
                        ).filter(start_date__lt=check_out, end_date__gt=check_in)

                        is_available = not other_bookings.exists() and not blocked.exists()

                if not is_available:
                    raise serializers.ValidationError(
                        {"check_in": "Apartment is not available for selected dates (may be booked or blocked from external calendars)"}
                    )

            except Apartment.DoesNotExist:
                raise serializers.ValidationError({"apartment_id": "Apartment not found"})

        return data

    def create(self, validated_data):
        """Create booking with apartment assignment and pending payment transaction"""
        apartment_id = validated_data.pop("apartment_id")
        apartment_obj = Apartment.objects.get(id=apartment_id)

        # Calculate total amount based on apartment price and nights
        nights = (validated_data["check_out"] - validated_data["check_in"]).days
        total_amount = apartment_obj.price * nights

        booking = Booking.objects.create(
            apartment=apartment_obj,
            total_amount=total_amount,
            currency=apartment_obj.currency,
            **validated_data,
        )

        # Automatically create a pending payment transaction
        from .models import PAYMENT_STATUS_CHOICES, PAYMENT_METHOD_CHOICES

        Payment.objects.create(
            booking=booking,
            amount=total_amount,
            currency=apartment_obj.currency,
            payment_method=PAYMENT_METHOD_CHOICES.PAYSTACK,
            status=PAYMENT_STATUS_CHOICES.PENDING,
        )

        return booking


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model"""

    booking_details = BookingSerializer(source="booking", read_only=True)
    booking_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "booking",
            "booking_id",
            "booking_details",
            "amount",
            "currency",
            "payment_method",
            "transaction_reference",
            "gateway_response",
            "status",
            "paid_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "paid_at", "created_at", "updated_at"]

    def create(self, validated_data):
        """Create payment with booking assignment"""
        booking_id = validated_data.pop("booking_id")
        try:
            booking = Booking.objects.get(booking_id=booking_id)
        except Booking.DoesNotExist:
            raise serializers.ValidationError({"booking_id": "Booking not found"})

        payment = Payment.objects.create(booking=booking, **validated_data)

        return payment


class ContactInquirySerializer(serializers.ModelSerializer):
    """Serializer for Contact Inquiries"""

    class Meta:
        model = ContactInquiry
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "subject",
            "message",
            "is_read",
            "responded",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_read", "responded", "created_at", "updated_at"]


class ApartmentInquirySerializer(serializers.ModelSerializer):
    """Serializer for Apartment-specific Inquiries"""

    apartment_details = ApartmentListSerializer(source="apartment", read_only=True)
    apartment_id = serializers.CharField(write_only=True)

    class Meta:
        model = ApartmentInquiry
        fields = [
            "id",
            "apartment",
            "apartment_id",
            "apartment_details",
            "name",
            "email",
            "phone",
            "message",
            "is_read",
            "responded",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "apartment", "is_read", "responded", "created_at", "updated_at"]

    def create(self, validated_data):
        """Create inquiry with apartment assignment"""
        apartment_id = validated_data.pop("apartment_id")
        try:
            apartment_obj = Apartment.objects.get(id=apartment_id)
        except Apartment.DoesNotExist:
            raise serializers.ValidationError({"apartment_id": "Apartment not found"})

        inquiry = ApartmentInquiry.objects.create(
            apartment=apartment_obj, **validated_data
        )

        return inquiry


class ExternalCalendarSerializer(serializers.ModelSerializer):
    """Serializer for External Calendar feeds synchronization with apartments"""

    apartment_details = ApartmentListSerializer(source="apartment", read_only=True)
    apartment_id = serializers.CharField(write_only=True)
    source_display = serializers.CharField(source="get_source_display", read_only=True)

    class Meta:
        model = ExternalCalendar
        fields = [
            "id",
            "apartment",
            "apartment_id",
            "apartment_details",
            "source",
            "source_display",
            "ical_url",
            "is_active",
            "last_synced",
            "sync_errors",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "apartment", "last_synced", "sync_errors", "created_at", "updated_at"]

    def create(self, validated_data):
        apartment_id = validated_data.pop("apartment_id")
        try:
            apartment_obj = Apartment.objects.get(id=apartment_id)
        except Apartment.DoesNotExist:
            raise serializers.ValidationError({"apartment_id": "Apartment not found"})

        return ExternalCalendar.objects.create(apartment=apartment_obj, **validated_data)


class BlockedDateSerializer(serializers.ModelSerializer):
    """Serializer for Blocked Dates for apartments"""

    apartment_details = ApartmentListSerializer(source="apartment", read_only=True)
    apartment_id = serializers.CharField(write_only=True)
    external_calendar_details = ExternalCalendarSerializer(source="external_calendar", read_only=True)

    class Meta:
        model = BlockedDate
        fields = [
            "id",
            "apartment",
            "apartment_id",
            "apartment_details",
            "external_calendar",
            "external_calendar_details",
            "start_date",
            "end_date",
            "source_booking_id",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, data):
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        if start_date and end_date and end_date <= start_date:
            raise serializers.ValidationError({"end_date": "End date must be after start date"})
        return data

    def create(self, validated_data):
        apartment_id = validated_data.pop("apartment_id")
        try:
            apartment_obj = Apartment.objects.get(id=apartment_id)
        except Apartment.DoesNotExist:
            raise serializers.ValidationError({"apartment_id": "Apartment not found"})
        return BlockedDate.objects.create(apartment=apartment_obj, **validated_data)


# =============================================================================
# INVENTORY MANAGEMENT SERIALIZERS
# =============================================================================


class InventoryItemSerializer(serializers.ModelSerializer):
    """Serializer for InventoryItem model"""

    class Meta:
        model = InventoryItem
        fields = [
            "id",
            "name",
            "description",
            "category",
            "unit",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class LocationInventorySerializer(serializers.ModelSerializer):
    """Serializer for LocationInventory model"""

    location_details = LocationSerializer(source="location", read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), source="location", write_only=True
    )
    item_details = InventoryItemSerializer(source="item", read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=InventoryItem.objects.all(), source="item", write_only=True
    )
    is_low_stock = serializers.ReadOnlyField()

    class Meta:
        model = LocationInventory
        fields = [
            "id",
            "location",
            "location_id",
            "location_details",
            "item",
            "item_id",
            "item_details",
            "quantity",
            "min_threshold",
            "is_low_stock",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "location", "item", "created_at", "updated_at"]


class PropertyInventorySerializer(serializers.ModelSerializer):
    """Serializer for PropertyInventory (Parent Stock)"""

    property_details = PropertyListSerializer(source="property", read_only=True)
    property_id = serializers.PrimaryKeyRelatedField(
        queryset=Property.objects.all(), source="property", write_only=True
    )
    item_details = InventoryItemSerializer(source="item", read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=InventoryItem.objects.all(), source="item", write_only=True
    )

    class Meta:
        model = PropertyInventory
        fields = [
            "id",
            "property",
            "property_id",
            "property_details",
            "item",
            "item_id",
            "item_details",
            "quantity",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "property", "item", "created_at", "updated_at"]


class ApartmentInventorySerializer(serializers.ModelSerializer):
    """Serializer for ApartmentInventory (Unit Stock)"""

    apartment_details = ApartmentListSerializer(source="apartment", read_only=True)
    apartment_id = serializers.PrimaryKeyRelatedField(
        queryset=Apartment.objects.all(), source="apartment", write_only=True
    )
    item_details = InventoryItemSerializer(source="item", read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=InventoryItem.objects.all(), source="item", write_only=True
    )

    class Meta:
        model = ApartmentInventory
        fields = [
            "id",
            "apartment",
            "apartment_id",
            "apartment_details",
            "item",
            "item_id",
            "item_details",
            "quantity",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "apartment", "item", "created_at", "updated_at"]


class InventoryMovementSerializer(serializers.ModelSerializer):
    """Serializer for InventoryMovement model"""

    location_details = LocationSerializer(source="location", read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), source="location", write_only=True
    )
    item_details = InventoryItemSerializer(source="item", read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=InventoryItem.objects.all(), source="item", write_only=True
    )
    
    property_details = PropertyListSerializer(source="property", read_only=True)
    property_id = serializers.PrimaryKeyRelatedField(
        queryset=Property.objects.all(), source="property", write_only=True, required=False, allow_null=True
    )
    
    apartment_details = ApartmentListSerializer(source="apartment", read_only=True)
    apartment_id = serializers.PrimaryKeyRelatedField(
        queryset=Apartment.objects.all(), source="apartment", write_only=True, required=False, allow_null=True
    )

    booking_details = BookingSerializer(source="booking", read_only=True)
    booking_ref = serializers.UUIDField(write_only=True, required=False)
    movement_type_display = serializers.CharField(source="get_movement_type_display", read_only=True)

    class Meta:
        model = InventoryMovement
        fields = [
            "id",
            "location",
            "location_id",
            "location_details",
            "item",
            "item_id",
            "item_details",
            "property",
            "property_id",
            "property_details",
            "apartment",
            "apartment_id",
            "apartment_details",
            "booking",
            "booking_ref",
            "booking_details",
            "movement_type",
            "movement_type_display",
            "quantity",
            "reason",
            "performed_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "location", "item", "property", "apartment", "booking", "created_at", "updated_at"]

    def create(self, validated_data):
        booking_ref = validated_data.pop("booking_ref", None)
        if booking_ref:
            try:
                booking = Booking.objects.get(booking_id=booking_ref)
                validated_data["booking"] = booking
            except Booking.DoesNotExist:
                raise serializers.ValidationError({"booking_ref": "Booking not found"})

        movement = InventoryMovement.objects.create(**validated_data)

        # Update location inventory
        location = validated_data["location"]
        item = validated_data["item"]
        quantity_change = validated_data["quantity"]

        location_inv, created = LocationInventory.objects.get_or_create(
            location=location, item=item, defaults={"quantity": 0}
        )
        location_inv.quantity += quantity_change
        if location_inv.quantity < 0:
            location_inv.quantity = 0
        location_inv.save()

        return movement


# =============================================================================
# DISPUTE RESOLUTION SERIALIZERS
# =============================================================================


class BookingDisputeSerializer(serializers.ModelSerializer):
    """Serializer for BookingDispute model"""

    booking_details = BookingSerializer(source="booking", read_only=True)
    booking_ref = serializers.UUIDField(write_only=True)
    dispute_type_display = serializers.CharField(source="get_dispute_type_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = BookingDispute
        fields = [
            "id",
            "booking",
            "booking_ref",
            "booking_details",
            "dispute_type",
            "dispute_type_display",
            "status",
            "status_display",
            "description",
            "resolution",
            "resolved_at",
            "resolved_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "booking", "resolved_at", "created_at", "updated_at"]

    def create(self, validated_data):
        booking_ref = validated_data.pop("booking_ref")
        try:
            booking = Booking.objects.get(booking_id=booking_ref)
        except Booking.DoesNotExist:
            raise serializers.ValidationError({"booking_ref": "Booking not found"})
        return BookingDispute.objects.create(booking=booking, **validated_data)

    def update(self, instance, validated_data):
        new_status = validated_data.get("status")
        resolution = validated_data.get("resolution")
        if new_status in ["resolved", "closed"] and resolution and not instance.resolved_at:
            validated_data["resolved_at"] = timezone.now()
        return super().update(instance, validated_data)
