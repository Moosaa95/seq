'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Edit,
  Trash2,
  ArrowLeft,
  Calendar,
  TrendingUp,
  CheckCircle,
  Eye
} from 'lucide-react';
import { useGetApartmentQuery, useDeleteApartmentMutation } from '@/lib/store/api/propertyApi';
import { toast } from 'sonner';
import CalendarSyncCard from '@/components/admin/CalendarSyncCard';

export default function AdminPropertyDetail() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const { data: apartment, isLoading: loading, error } = useGetApartmentQuery(propertyId);
  const [deleteApartment, { isLoading: isDeleting }] = useDeleteApartmentMutation();

  // TODO: Refactor admin slice/bookings to use RTK Query
  // For now we just initialize empty to prevent crash until bookingApi has getBookings
  const allBookings: any[] = [];
  const propertyBookings = allBookings.filter((b) => b.property === apartment?.id);
  const confirmedBookings = propertyBookings.filter((b) => b.status === 'confirmed' || b.status === 'completed');
  const totalRevenue = propertyBookings.reduce((sum, b) => sum + parseFloat(b.total_amount), 0);

  const [selectedImage, setSelectedImage] = useState(0);

  const handleDelete = async () => {
    if (!apartment) return;

    if (confirm(`Are you sure you want to delete "${apartment.title}"? This action cannot be undone.`)) {
      const toastId = `delete-${apartment.id}`;

      try {
        toast.loading('Deleting property...', { id: toastId });

        await deleteApartment(apartment.id).unwrap();

        toast.success('Property deleted successfully!', { id: toastId });

        // Redirect to properties list after successful delete
        router.push('/admin/properties');
      } catch (error: any) {
        console.error('Error deleting property:', error);
        toast.error(error?.data?.detail || error?.data?.message || 'Failed to delete property', { id: toastId });
      }
    }
  };

  const handleEdit = () => {
    router.push(`/admin/properties/${apartment?.id}/edit`);
  };

  const images = apartment?.images
    ? (Array.isArray(apartment.images) ? apartment.images.map(img => typeof img === 'string' ? img : img.image) : [])
    : [];
  const amenities = apartment?.amenities
    ? (Array.isArray(apartment.amenities) ? apartment.amenities : []) // Assuming array
    : [];

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading property details...</div>;
  }

  if (error || !apartment) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold mb-2">Error Loading Property</h2>
        <p>Could not load property details. Please try again.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{apartment.title}</h1>
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              <p>{apartment.location}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Bookings</p>
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{propertyBookings.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Confirmed</p>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{confirmedBookings.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-900">
            ₦{totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Listing Type</p>
            {apartment.status === 'sale' ? (
              <Building2 className="h-5 w-5 text-purple-600" />
            ) : (
              <Calendar className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <p className="text-sm font-semibold capitalize text-gray-900">
            For {apartment.status === 'rent' ? 'Rent' : 'Sale'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Images</h2>
            {images.length > 0 ? (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={images[selectedImage]}
                    alt={apartment.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-video rounded-lg overflow-hidden ${selectedImage === index ? 'ring-2 ring-emerald-500' : ''
                        }`}
                    >
                      <img
                        src={image}
                        alt={`${apartment.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No images available</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm sm:text-lg md:text-xl font-bold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{apartment.description}</p>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities</h2>
            {amenities.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    {amenity}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No amenities listed</p>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
            {propertyBookings.length > 0 ? (
              <div className="space-y-3">
                {propertyBookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.booking_id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{booking.name}</p>
                      <p className="text-sm text-gray-600">{booking.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">
                        ₦{parseFloat(booking.total_amount).toLocaleString()}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No bookings yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Unit Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Price</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {apartment.currency}{Number(apartment.price).toLocaleString()}
                  {apartment.status === 'rent' && <span className="text-sm text-gray-500 font-normal">/night</span>}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Type</p>
                <p className="text-base font-semibold text-gray-900 capitalize">{apartment.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-base font-semibold text-gray-900 capitalize">{apartment.status}</p>
              </div>
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3">
                  <Bed className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{apartment.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center gap-3">
                  <Bath className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{apartment.bathrooms} Bathrooms</span>
                </div>
                {apartment.area && (
                  <div className="flex items-center gap-3">
                    <Maximize className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{apartment.area} sqft</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Agent Information */}
          {apartment.agent && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Agent Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="text-base font-semibold text-gray-900">{apartment.agent.name}</p>
                </div>
                {apartment.agent.email && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <a
                      href={`mailto:${apartment.agent.email}`}
                      className="text-base text-emerald-600 hover:text-emerald-700"
                    >
                      {apartment.agent.email}
                    </a>
                  </div>
                )}
                {apartment.agent.phone && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <a
                      href={`tel:${apartment.agent.phone}`}
                      className="text-base text-emerald-600 hover:text-emerald-700"
                    >
                      {apartment.agent.phone}
                    </a>
                  </div>
                )}
                {apartment.agent.mobile && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Mobile</p>
                    <a
                      href={`tel:${apartment.agent.mobile}`}
                      className="text-base text-emerald-600 hover:text-emerald-700"
                    >
                      {apartment.agent.mobile}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a
                href={`/properties/${apartment.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="h-4 w-4" />
                View Public Page
              </a>
            </div>
          </div>

          {/* Calendar Sync */}
          <CalendarSyncCard propertyId={apartment.id} propertyTitle={apartment.title} />
        </div>
      </div>
    </div>
  );
}
