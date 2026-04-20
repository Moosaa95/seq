from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Agent,
    Property,
    Apartment,
    ApartmentImage,
    PropertyImage,
    Booking,
    Payment,
    ContactInquiry,
    ApartmentInquiry,
    Location,
    InventoryItem,
    LocationInventory,
    PropertyInventory,
    ApartmentInventory,
    InventoryMovement,
    BookingDispute,
)


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    fields = ["image", "category", "order", "is_primary"]


class ApartmentImageInline(admin.TabularInline):
    model = ApartmentImage
    extra = 1
    fields = ["image", "category", "order", "is_primary"]


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "phone", "mobile", "created_at"]
    search_fields = ["name", "email", "phone", "mobile"]
    list_filter = ["created_at"]
    ordering = ["name"]


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    """Admin for Parent Property (Building/Site)"""
    list_display = ["id", "name", "location", "featured", "is_active", "created_at"]
    list_filter = ["location", "featured", "is_active", "created_at"]
    search_fields = ["id", "name", "location__name", "description"]
    list_editable = ["featured", "is_active"]
    inlines = [PropertyImageInline]


@admin.register(Apartment)
class ApartmentAdmin(admin.ModelAdmin):
    """Admin for Apartment (Bookable Units)"""
    list_display = [
        "id",
        "parent_property",
        "title",
        "status",
        "type",
        "price",
        "bedrooms",
        "bathrooms",
        "featured",
        "is_active",
    ]
    list_filter = ["parent_property", "status", "type", "featured", "is_active", "created_at"]
    search_fields = ["id", "title", "parent_property__location__name", "description"]
    list_editable = ["featured", "is_active"]
    inlines = [ApartmentImageInline]


@admin.register(ApartmentImage)
@admin.register(PropertyImage)
class MultiImageAdmin(admin.ModelAdmin):
    list_display = ["get_parent", "category", "order", "is_primary", "image_preview", "created_at"]
    list_filter = ["category", "is_primary", "created_at"]
    list_editable = ["order", "is_primary"]

    def get_parent(self, obj):
        return getattr(obj, "apartment", getattr(obj, "property", "-"))
    get_parent.short_description = "Parent"

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" style="object-fit:cover;" />', obj.image.url)
        return "-"
    image_preview.short_description = "Preview"


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        "booking_id",
        "apartment",
        "name",
        "email",
        "check_in",
        "check_out",
        "status",
        "payment_status",
        "created_at",
    ]
    list_filter = ["status", "payment_status", "occupancy_status", "created_at"]
    search_fields = ["booking_id", "name", "email", "apartment__title"]
    readonly_fields = ["booking_id", "nights", "checked_in_at", "checked_out_at", "created_at"]
    list_editable = ["status", "payment_status"]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["transaction_reference", "booking", "amount", "status", "paid_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["transaction_reference", "booking__booking_id"]


@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "subject", "is_read", "created_at"]
    list_filter = ["is_read", "created_at"]
    search_fields = ["name", "email", "message"]


@admin.register(ApartmentInquiry)
class ApartmentInquiryAdmin(admin.ModelAdmin):
    list_display = ["apartment", "name", "email", "is_read", "created_at"]
    list_filter = ["is_read", "created_at"]
    search_fields = ["name", "email", "apartment__title"]


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ["name", "is_active", "created_at"]
    list_filter = ["is_active"]


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "unit", "is_active"]
    list_filter = ["category", "is_active"]


@admin.register(LocationInventory)
class LocationInventoryAdmin(admin.ModelAdmin):
    list_display = ["location", "item", "quantity", "min_threshold", "is_low_stock"]
    list_filter = ["location", "item__category"]

    def is_low_stock(self, obj):
        return obj.is_low_stock
    is_low_stock.boolean = True


@admin.register(PropertyInventory)
class PropertyInventoryAdmin(admin.ModelAdmin):
    """Admin for Building-level inventory"""
    list_display = ["property", "item", "quantity", "updated_at"]
    list_filter = ["property", "item__category"]
    search_fields = ["property__name", "item__name"]


@admin.register(ApartmentInventory)
class ApartmentInventoryAdmin(admin.ModelAdmin):
    """Admin for Unit-level inventory"""
    list_display = ["apartment", "item", "quantity", "updated_at"]
    list_filter = ["apartment", "item__category"]
    search_fields = ["apartment__title", "item__name"]


@admin.register(InventoryMovement)
class InventoryMovementAdmin(admin.ModelAdmin):
    list_display = ["created_at", "location", "item", "movement_type", "quantity", "property", "apartment"]
    list_filter = ["movement_type", "location", "created_at"]
    search_fields = ["item__name", "property__name", "apartment__title", "reason"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(BookingDispute)
class BookingDisputeAdmin(admin.ModelAdmin):
    list_display = ["booking", "dispute_type", "status", "created_at"]
    list_filter = ["status", "dispute_type"]


admin.site.site_header = "Sequoia Projects Administration"
admin.site.site_title = "Sequoia Projects Admin"
admin.site.index_title = "Welcome to Sequoia Projects Admin Panel"
