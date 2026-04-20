'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import PropertyImageUpload, { PropertyImage } from '@/components/admin/PropertyImageUpload';
import { useCreatePropertyMutation } from '@/lib/store/api/propertyApi';
import { useGetLocationsQuery } from '@/lib/store/api/inventoryApi';

interface BuildingFormData {
  name: string;
  description: string;
  location_id: string;
  amenities: string;
  entity: string;
  featured: boolean;
}

export default function AddBuildingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [formData, setFormData] = useState<BuildingFormData>({
    name: '',
    description: '',
    location_id: '',
    amenities: '',
    entity: 'Sequoia Projects',
    featured: false,
  });

  const { data: locations = [], isLoading: locationsLoading } = useGetLocationsQuery({});
  const [createProperty] = useCreatePropertyMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location_id) {
      toast.error('Please select a location');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location_id', formData.location_id);
      formDataToSend.append('entity', formData.entity);
      formDataToSend.append('featured', formData.featured.toString());

      // Amenities as JSON array string
      const amenitiesList = formData.amenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);
      formDataToSend.append('amenities', JSON.stringify(amenitiesList));

      // Images
      images.forEach((image, index) => {
        if (image.file) {
          formDataToSend.append('images', image.file);
          formDataToSend.append(`image_${index}_order`, image.order.toString());
          formDataToSend.append(`image_${index}_is_primary`, image.is_primary.toString());
        }
      });

      toast.loading('Creating building...', { id: 'create-building' });

      await createProperty(formDataToSend).unwrap();

      toast.success('Building created successfully!', { id: 'create-building' });
      router.push('/admin/properties');
    } catch (error: any) {
      console.error('Error creating building:', error);
      const message = error?.data?.detail || error?.data?.message || 'Failed to create building';
      toast.error(message, { id: 'create-building' });
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
          Back to Buildings
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Building / Property</h1>
        <p className="text-gray-600 mt-1">Define a parent property that will contain individual units</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Building Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Sequoia Heights, San Gwari District"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                {locationsLoading ? (
                  <div className="animate-pulse h-10 bg-gray-100 rounded-lg" />
                ) : (
                  <div className="relative">
                    <select
                      name="location_id"
                      value={formData.location_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white font-medium"
                      required
                    >
                      <option value="">Select a location...</option>
                      {locations.map((loc: any) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} {loc.state_name ? `(${loc.state_name})` : ''}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                    </div>
                  </div>
                )}
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
              placeholder="Describe the building and its features..."
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
              placeholder="Enter building-wide amenities separated by commas (e.g., 24/7 Power, Security, Water Treatment, Parking)"
            />
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Building Images</h2>
            <PropertyImageUpload images={images} onChange={setImages} />
          </div>

          {/* Additional Options */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Options</h2>
            <div className="space-y-4">
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
                  Mark as Featured Building
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Save className="h-5 w-5" />
              {loading ? 'Creating...' : 'Create Building'}
            </button>
            <Link href="/admin/properties">
              <button
                type="button"
                className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
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
