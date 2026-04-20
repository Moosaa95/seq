'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, BedDouble, Bath, Home as HomeIcon, Maximize, Heart, ArrowRight } from 'lucide-react';
import ImageWithLoader from './ImageWithLoader';

interface PropertyCardProps {
  property: any;
  index: number;
  linkHref?: string;
}

export default function PropertyCard({ property, index, linkHref }: PropertyCardProps) {
  const href = linkHref ?? `/properties/${property.id}`;
  const images = property.images || [];
  const firstImage = images.length > 0
    ? (typeof images[0] === 'string' ? images[0] : images[0].image)
    : '';

  const livingRooms = property.livingRooms || property.living_rooms;
  const area = property.area;
  const price = typeof property.price === 'string' ? parseFloat(property.price) : property.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-gray-100"
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <Link href={href}>
          <div className="w-full h-full relative">
            <ImageWithLoader
              src={firstImage}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
        <div className="absolute top-4 left-4">
          <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg ${property.status === 'rent'
            ? 'bg-emerald-500 text-white'
            : 'bg-blue-600 text-white'
            }`}>
            For {property.status === 'rent' ? 'Rent' : 'Sale'}
          </span>
        </div>
        <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white text-gray-700 hover:text-red-500 transition-all transform hover:scale-110">
          <Heart className="w-5 h-5" />
        </button>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
          <div>
            <p className="text-2xl font-bold">{property.currency}{price?.toLocaleString()}</p>
            {property.status === 'rent' && <p className="text-sm font-medium opacity-90">/night</p>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-4 flex-grow">
          <Link href={href}>
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
              {property.title}
            </h3>
          </Link>
          <div className="flex items-start text-gray-600 text-sm mb-4">
            <MapPin className="w-4 h-4 mr-1 mt-0.5 shrink-0 text-emerald-600" />
            <span className="line-clamp-2">{property.location}</span>
          </div>
          <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
          <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-lg">
            <BedDouble className="w-5 h-5 text-emerald-600 mb-1" />
            <span className="text-sm font-bold text-gray-900">{property.bedrooms}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">Beds</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-lg">
            <Bath className="w-5 h-5 text-emerald-600 mb-1" />
            <span className="text-sm font-bold text-gray-900">{property.bathrooms}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">Baths</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-lg">
            {property.status === 'rent' ? (
              <>
                <HomeIcon className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-sm font-bold text-gray-900">{livingRooms}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wide">Living</span>
              </>
            ) : (
              <>
                <Maximize className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-sm font-bold text-gray-900">{area} sqft</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wide">Area</span>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-600">
            {property.type}
          </span>
          <Link
            href={href}
            className="flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Details <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
