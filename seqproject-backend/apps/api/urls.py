from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for ViewSets
router = DefaultRouter()

# Register all ViewSets
router.register(r'properties', views.PropertyViewSet, basename='property')
router.register(r'apartments', views.ApartmentViewSet, basename='apartment')
router.register(r'bookings', views.BookingViewSet, basename='booking')
router.register(r'payments', views.PaymentViewSet, basename='payment')
router.register(r'contact-inquiries', views.ContactInquiryViewSet, basename='contact-inquiry')
router.register(r'apartment-inquiries', views.ApartmentInquiryViewSet, basename='apartment-inquiry')
router.register(r'agents', views.AgentViewSet, basename='agent')
router.register(r'external-calendars', views.ExternalCalendarViewSet, basename='external-calendar')
router.register(r'blocked-dates', views.BlockedDateViewSet, basename='blocked-date')

# Inventory management
router.register(r"locations", views.LocationViewSet)
router.register(r"countries", views.CountryViewSet)
router.register(r"states", views.StateViewSet)
router.register(r"inventory-items", views.InventoryItemViewSet, basename='inventory-item')
router.register(r'location-inventory', views.LocationInventoryViewSet, basename='location-inventory')
router.register(r'property-inventory', views.PropertyInventoryViewSet, basename='property-inventory')
router.register(r'apartment-inventory', views.ApartmentInventoryViewSet, basename='apartment-inventory')
router.register(r'inventory-movements', views.InventoryMovementViewSet, basename='inventory-movement')

# Dispute management
router.register(r'disputes', views.BookingDisputeViewSet, basename='dispute')

app_name = 'api'

urlpatterns = [
    # Health check endpoint
    path('health/', views.health_check, name='health-check'),

    # Paystack webhook endpoint
    path('payments/webhook/', views.PaystackWebhookView.as_view(), name='paystack-webhook'),

    # iCal export endpoint
    path('apartments/<uuid:apartment_id>/ical/', views.export_apartment_ical, name='apartment-ical-export'),

    # Calendar sync endpoint
    path('calendars/sync-all/', views.sync_all_calendars, name='sync-all-calendars'),

    # Router URLs (all ViewSets)
    path('', include(router.urls)),
]

