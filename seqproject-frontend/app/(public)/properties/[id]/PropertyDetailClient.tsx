'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin, Check, ArrowLeft, Building2, Home as HomeIcon, Navigation,
} from 'lucide-react';
import ImageWithLoader from '@/components/ImageWithLoader';
import PropertyCard from '@/components/PropertyCard';
import { useGetPropertyQuery, useGetApartmentsQuery } from '@/lib/store/api/propertyApi';

function PropertyMap({ latitude, longitude, address, name }: {
  latitude: string;
  longitude: string;
  address?: string;
  name: string;
}) {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const delta = 0.008;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg"
    >
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Location</h2>
          {address && (
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              {address}
            </p>
          )}
        </div>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow"
        >
          <Navigation className="w-4 h-4" />
          Get Directions
        </a>
      </div>
      <div className="relative w-full h-72 sm:h-96">
        <iframe
          title={`Map for ${name}`}
          src={src}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
        />
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t text-xs text-gray-400">
        Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">OpenStreetMap</a> contributors
      </div>
    </motion.div>
  );
}

export default function PropertyDetailClient({ propertyId }: { propertyId: string }) {
  const { data: property, isLoading, error } = useGetPropertyQuery(propertyId);
  const { data: apartmentsData, isLoading: apartmentsLoading } = useGetApartmentsQuery(
    { parent_property: propertyId },
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const apartments = (apartmentsData?.results || []).filter(
    (apt) => apt.parent_property === propertyId,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-r-transparent" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-xl font-bold">Property not found</h2>
        <Link href="/properties" className="text-emerald-600 hover:underline">Back to Properties</Link>
      </div>
    );
  }

  const amenitiesList = Array.isArray(property.amenities) ? property.amenities : [];
  const displayImages = (property.images || []).map((img: any) =>
    typeof img === 'string' ? img : img.image,
  );

  const hasMap = property.latitude && property.longitude;
  const mapAddress = property.address || property.location_details?.name;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Back */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Properties
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg"
        >
          {property.entity && (
            <span className="inline-block bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md mb-4">
              Managed by {property.entity}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{property.name}</h1>
          {property.location_details && (
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-5 w-5 mr-2 shrink-0 text-emerald-600" />
              <span className="text-lg">{property.location_details.name}</span>
            </div>
          )}
          {property.address && (
            <p className="text-gray-500 text-sm mb-4 ml-7">{property.address}</p>
          )}
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span className="font-medium">
              {property.apartment_count} available unit{property.apartment_count !== 1 ? 's' : ''}
            </span>
          </div>
          {property.description && (
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          )}
        </motion.div>

        {/* Images */}
        {displayImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl overflow-hidden shadow-lg"
          >
            <div className="relative h-72 sm:h-96 lg:h-[480px]">
              <ImageWithLoader
                src={displayImages[currentImageIndex]}
                alt={property.name}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </div>
            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-3 bg-gray-50">
                {displayImages.slice(0, 8).map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`relative h-20 rounded-xl overflow-hidden transition-all ${
                      currentImageIndex === i
                        ? 'ring-2 ring-emerald-600 shadow-md'
                        : 'ring-1 ring-gray-200 hover:ring-emerald-300'
                    }`}
                  >
                    <ImageWithLoader
                      src={img}
                      alt={`View ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Amenities */}
        {amenitiesList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Amenities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {amenitiesList.map((amenity: string, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-full shrink-0">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-gray-700 text-sm">{amenity}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Map */}
        {hasMap && (
          <PropertyMap
            latitude={property.latitude!}
            longitude={property.longitude!}
            address={mapAddress}
            name={property.name}
          />
        )}

        {/* Apartments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Units</h2>
          {apartmentsLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-r-transparent" />
            </div>
          ) : apartments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {apartments.map((apt, i) => (
                <PropertyCard
                  key={apt.id}
                  property={apt}
                  index={i}
                  linkHref={`/apartments/${apt.id}`}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
              <HomeIcon className="h-14 w-14 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No units available at this time</p>
              <p className="text-gray-400 text-sm mt-1">Check back soon or contact us for availability</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
