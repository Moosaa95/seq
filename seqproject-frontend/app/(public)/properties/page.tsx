'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import PropertyBuildingCard from '@/components/PropertyBuildingCard';
import ImageWithLoader from '@/components/ImageWithLoader';
import { useGetPropertiesQuery } from '@/lib/store/api/propertyApi';

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const queryParams = {
    ...(searchTerm && { search: searchTerm }),
  };

  const { data: propertiesData, isLoading: loading, error } = useGetPropertiesQuery(queryParams);
  const properties = propertiesData?.results || [];

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-[35vh] sm:min-h-[40vh] md:h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithLoader
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80"
            alt="Properties"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            Our Properties
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-gray-200 px-4"
          >
            Browse our premium property developments and find your perfect home
          </motion.p>
        </div>
      </section>

      {/* Search */}
      <section className="bg-white shadow-md sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by property name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-3 text-gray-600 text-sm">
            Showing <span className="font-semibold text-emerald-600">{properties.length}</span>{' '}
            {properties.length === 1 ? 'property' : 'properties'}
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12 sm:py-20">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent" />
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 sm:py-20">
              <p className="text-xl text-red-600 mb-4">Failed to load properties</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12 sm:py-20">
              <p className="text-xl text-gray-600 mb-4">No properties found</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {properties.map((property, index) => (
                <PropertyBuildingCard key={property.id} property={property} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
