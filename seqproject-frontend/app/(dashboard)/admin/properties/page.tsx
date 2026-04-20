'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, Plus, Edit, Trash2, Eye, MapPin, Building } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DataTable } from '@/components/admin/DataTable';
import {
  useGetApartmentsQuery,
  useDeleteApartmentMutation,
  useGetPropertiesQuery,
  useDeletePropertyMutation,
  ApiApartment,
  ApiProperty
} from '@/lib/store/api/propertyApi';

export default function PropertiesManagement() {
  const [activeTab, setActiveTab] = useState<'buildings' | 'units'>('units');

  // Queries for both types
  const {
    data: apartmentsData,
    isLoading: apartmentsLoading,
    error: apartmentsError
  } = useGetApartmentsQuery({ page_size: 1000 });

  const {
    data: propertiesData,
    isLoading: propertiesLoading,
    error: propertiesError
  } = useGetPropertiesQuery({ page_size: 1000 });

  const [deleteApartment, { isLoading: isDeletingApartment }] = useDeleteApartmentMutation();
  const [deleteProperty, { isLoading: isDeletingProperty }] = useDeletePropertyMutation();

  const apartments = apartmentsData?.results || [];
  const buildings = propertiesData?.results || [];

  const handleDeleteApartment = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete unit "${title}"?`)) {
      try {
        await deleteApartment(id).unwrap();
        toast.success('Unit deleted successfully!');
      } catch (error: any) {
        toast.error(error?.data?.detail || 'Failed to delete unit');
      }
    }
  };

  const handleDeleteBuilding = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete building "${name}"? This might affect units inside it.`)) {
      try {
        await deleteProperty(id).unwrap();
        toast.success('Building deleted successfully!');
      } catch (error: any) {
        toast.error(error?.data?.detail || 'Failed to delete building');
      }
    }
  };

  // Columns for Units (Apartments)
  const unitColumns: ColumnDef<ApiApartment>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Unit',
        cell: ({ row }) => {
          const apartment = row.original;
          const firstImage = Array.isArray(apartment.images) && apartment.images.length > 0
            ? (typeof apartment.images[0] === 'string' ? apartment.images[0] : apartment.images[0].image)
            : null;

          return (
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-lg bg-gray-200 mr-4 overflow-hidden shrink-0">
                {firstImage && (
                  <img src={firstImage} alt={apartment.title} className="h-full w-full object-cover" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 line-clamp-1">{apartment.title}</div>
                <div className="text-sm text-gray-500">{apartment.property_details?.name || 'No Building'}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ row }) => (
          <div className="flex items-center text-sm text-gray-900">
            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
            {row.original.location}
          </div>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => (
          <div className="text-sm font-semibold text-gray-900">
            {row.original.currency}{Number(row.original.price).toLocaleString()}
            {row.original.status === 'rent' && <span className="text-gray-500 font-normal">/night</span>}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.original.status === 'rent' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
            {row.original.status === 'rent' ? 'Rent' : 'Sale'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Link href={`/admin/properties/${row.original.id}`}>
              <button className="p-2 hover:bg-gray-100 rounded text-gray-600"><Eye className="h-4 w-4" /></button>
            </Link>
            <Link href={`/admin/properties/${row.original.id}/edit`}>
              <button className="p-2 hover:bg-blue-50 rounded text-blue-600"><Edit className="h-4 w-4" /></button>
            </Link>
            <button
              onClick={() => handleDeleteApartment(row.original.id, row.original.title)}
              className="p-2 hover:bg-red-50 rounded text-red-600"
              disabled={isDeletingApartment}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [isDeletingApartment]
  );

  // Columns for Buildings (Properties)
  const buildingColumns: ColumnDef<ApiProperty>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Building Name',
        cell: ({ row }) => (
          <div className="flex items-center">
            <div className="h-10 w-10 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
              <Building className="h-5 w-5" />
            </div>
            <span className="font-medium text-gray-900">{row.original.name}</span>
          </div>
        )
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ row }) => (
          <div className="text-sm text-gray-600">
            {row.original.location_details?.name || 'No Location'}
          </div>
        )
      },
      {
        accessorKey: 'apartment_count',
        header: 'Units',
        cell: ({ row }) => (
          <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
            {row.original.apartment_count}
          </span>
        )
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Link href={`/admin/properties/edit-building/${row.original.id}`}>
              <button className="p-2 hover:bg-blue-50 rounded text-blue-600"><Edit className="h-4 w-4" /></button>
            </Link>
            <button
              onClick={() => handleDeleteBuilding(row.original.id, row.original.name)}
              className="p-2 hover:bg-red-50 rounded text-red-600"
              disabled={isDeletingProperty}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [isDeletingProperty]
  );

  const isLoading = activeTab === 'units' ? apartmentsLoading : propertiesLoading;
  const error = activeTab === 'units' ? apartmentsError : propertiesError;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Property Management</h1>
          <p className="text-gray-600 mt-1">Manage buildings and individual bookable units</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/properties/new-building">
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              Add Building
            </button>
          </Link>
          <Link href="/admin/properties/new">
            <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              Add Unit
            </button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 sticky top-0 bg-white z-10">
        <button
          onClick={() => setActiveTab('units')}
          className={`py-3 px-6 text-sm font-medium transition-colors border-b-2 ${activeTab === 'units' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Units / Apartments ({apartments.length})
        </button>
        <button
          onClick={() => setActiveTab('buildings')}
          className={`py-3 px-6 text-sm font-medium transition-colors border-b-2 ${activeTab === 'buildings' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Buildings / Properties ({buildings.length})
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading {activeTab}...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          Failed to load {activeTab}. Please refresh or try again later.
        </div>
      ) : activeTab === 'units' ? (
        <DataTable
          columns={unitColumns}
          data={apartments}
          searchKey="title"
          searchPlaceholder="Search units..."
        />
      ) : (
        <DataTable
          columns={buildingColumns}
          data={buildings}
          searchKey="name"
          searchPlaceholder="Search buildings..."
        />
      )}
    </div>
  );
}
