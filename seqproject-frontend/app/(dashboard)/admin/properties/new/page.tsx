'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import PropertyImageUpload, { PropertyImage } from '@/components/admin/PropertyImageUpload';
import { useCreateApartmentMutation, useGetPropertiesQuery } from '@/lib/store/api/propertyApi';
import { useGetLocationsQuery } from '@/lib/store/api/inventoryApi';

interface PropertyFormData {
  title: string;
  parent_property: string;
  price: number;
  currency: string;
  status: 'rent' | 'sale';
  type: string;
  area: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  garages: number;
  description: string;
  amenities: string;
  entity: string;
  agentName: string;
  agentPhone: string;
  agentMobile: string;
  agentEmail: string;
  featured: boolean;
}

export default function AddApartmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    parent_property: '',
    price: 0,
    currency: '₦',
    status: 'rent',
    type: 'Apartment',
    area: 0,
    guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    livingRooms: 1,
    garages: 0,
    description: '',
    amenities: '',
    entity: 'Sequoia Projects',
    agentName: '',
    agentPhone: '',
    agentMobile: '',
    agentEmail: '',
    featured: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 :
        type === 'checkbox' ? (e.target as HTMLInputElement).checked :
          value
    }));
  };

  const [createApartment, { isLoading: isCreating }] = useCreateApartmentMutation();
  const { data: buildingsData, isLoading: buildingsLoading } = useGetPropertiesQuery({});
  const buildings = buildingsData?.results || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for multipart/form-data submission
      const formDataToSend = new FormData();

      // Add basic unit fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('parent_property', formData.parent_property);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('currency', formData.currency);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('area', formData.area.toString());
      formDataToSend.append('guests', formData.guests.toString());
      formDataToSend.append('bedrooms', formData.bedrooms.toString());
      formDataToSend.append('bathrooms', formData.bathrooms.toString());
      formDataToSend.append('living_rooms', formData.livingRooms.toString());
      formDataToSend.append('garages', formData.garages.toString());
      formDataToSend.append('description', formData.description);
      formDataToSend.append('entity', formData.entity);
      formDataToSend.append('featured', formData.featured.toString());

      // Add amenities as JSON string
      const amenitiesList = formData.amenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);
      formDataToSend.append('amenities', JSON.stringify(amenitiesList));

      // Add agent info
      formDataToSend.append('agent_name', formData.agentName);
      formDataToSend.append('agent_phone', formData.agentPhone);
      formDataToSend.append('agent_mobile', formData.agentMobile);
      formDataToSend.append('agent_email', formData.agentEmail);

      // Add images with metadata
      images.forEach((image, index) => {
        if (image.file) {
          formDataToSend.append('images', image.file);
          formDataToSend.append(`image_${index}_category`, image.category);
          formDataToSend.append(`image_${index}_order`, image.order.toString());
          formDataToSend.append(`image_${index}_is_primary`, image.is_primary.toString());
        }
      });

      toast.loading('Creating unit...', { id: 'create-unit' });

      await createApartment(formDataToSend).unwrap();

      toast.success('Unit created successfully!', { id: 'create-unit' });
      router.push('/admin/properties');
    } catch (error: any) {
      console.error('Error creating unit:', error);

      const errorData = error?.data || {};

      if (errorData.errors) {
        // Display specific field errors
        Object.entries(errorData.errors).forEach(([field, messages]: [string, any]) => {
          toast.error(`${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`, { id: 'create-unit' });
        });
      } else if (errorData.detail || errorData.message) {
        toast.error(errorData.detail || errorData.message, { id: 'create-unit' });
      } else {
        toast.error('Failed to create unit. Please try again.', { id: 'create-unit' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/properties"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Units
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Unit / Apartment</h1>
        <p className="text-gray-600 mt-1">Fill in the details below to add a new bookable unit</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Luxury 2-Bedroom Apartment"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Building (Parent Property) *
                </label>
                {buildingsLoading ? (
                  <div className="animate-pulse h-10 bg-gray-100 rounded-lg" />
                ) : (
                  <div className="relative">
                    <select
                      name="parent_property"
                      value={formData.parent_property}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white font-medium"
                      required
                    >
                      <option value="">Select a building...</option>
                      {buildings.map((building: any) => (
                        <option key={building.id} value={building.id}>{building.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="₦">₦ (Naira)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="rent">For Rent</option>
                  <option value="sale">For Sale</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Type *
                </label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Apartment, Villa, Studio"
                />
              </div>
            </div>
          </div>

          {/* Unit Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Unit Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Living Rooms *
                </label>
                <input
                  type="number"
                  name="livingRooms"
                  value={formData.livingRooms}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Garages
                </label>
                <input
                  type="number"
                  name="garages"
                  value={formData.garages}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (sqm)
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Guests
                </label>
                <input
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Describe the unit..."
            />
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
            <textarea
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter amenities separated by commas (e.g., WiFi, Pool, Gym, Parking)"
            />
          </div>

          {/* Unit Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Unit Images</h2>
            <PropertyImageUpload images={images} onChange={setImages} />
          </div>

          {/* Agent Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Name *
                </label>
                <input
                  type="text"
                  name="agentName"
                  value={formData.agentName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Email *
                </label>
                <input
                  type="email"
                  name="agentEmail"
                  value={formData.agentEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Phone *
                </label>
                <input
                  type="tel"
                  name="agentPhone"
                  value={formData.agentPhone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Mobile *
                </label>
                <input
                  type="tel"
                  name="agentMobile"
                  value={formData.agentMobile}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Options</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entity/Owner
                </label>
                <input
                  type="text"
                  name="entity"
                  value={formData.entity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  Mark as Featured Unit
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              {loading ? 'Creating...' : 'Create Unit'}
            </button>
            <Link href="/admin/properties">
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                Cancel
              </button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
