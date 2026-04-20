'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Building2, ArrowRight } from 'lucide-react';
import ImageWithLoader from './ImageWithLoader';
import { ApiProperty } from '@/lib/store/api/propertyApi';

interface PropertyBuildingCardProps {
  property: ApiProperty;
  index: number;
}

export default function PropertyBuildingCard({ property, index }: PropertyBuildingCardProps) {
  const images = property.images || [];
  const firstImage = images.length > 0
    ? (typeof images[0] === 'string' ? images[0] : (images[0] as any).image)
    : '';
  const locationName = property.location_details?.name || '';
  const href = `/properties/${property.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-gray-100"
    >
      <div className="relative h-56 overflow-hidden">
        <Link href={href}>
          <div className="w-full h-full relative">
            <ImageWithLoader
              src={firstImage}
              alt={property.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {property.featured && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg bg-amber-500 text-white">
              Featured
            </span>
          </div>
        )}

        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-semibold text-gray-800">
            {property.apartment_count} unit{property.apartment_count !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
          <Link href={href}>
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
              {property.name}
            </h3>
          </Link>
          {locationName && (
            <div className="flex items-center text-gray-500 text-sm mb-3">
              <MapPin className="w-4 h-4 mr-1 shrink-0 text-emerald-600" />
              <span className="line-clamp-1">{locationName}</span>
            </div>
          )}
          <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{property.description}</p>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
          {property.entity ? (
            <span className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-600 truncate max-w-[140px]">
              {property.entity}
            </span>
          ) : <span />}
          <Link
            href={href}
            className="flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            View Units <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
