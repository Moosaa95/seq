'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyCard from './PropertyCard';
import { Property } from '@/lib/data';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface PropertySliderProps {
  properties: any[];
  renderCard?: (property: any, index: number) => ReactNode;
}

export default function PropertySlider({ properties, renderCard }: PropertySliderProps) {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  const handlePrevClick = () => {
    if (swiperInstance) {
      swiperInstance.slidePrev();
    }
  };

  const handleNextClick = () => {
    if (swiperInstance) {
      swiperInstance.slideNext();
    }
  };

  return (
    <div className="relative group pt-16">
      {/* Custom Navigation Buttons - Top Right */}
      <div className="absolute -top-2 right-0 z-10 flex gap-2 transition-opacity duration-300">
        <button
          onClick={handlePrevClick}
          className="bg-white/90 hover:bg-white shadow-lg cursor-pointer rounded-full p-3 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>

        <button
          onClick={handleNextClick}
          className="bg-white/90 hover:bg-white shadow-lg cursor-pointer rounded-full p-3 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 text-gray-800" />
        </button>
      </div>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        onSwiper={setSwiperInstance}
        spaceBetween={24}
        slidesPerView={1}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={properties.length > 4}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 24,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 32,
          },
          1280: {
            slidesPerView: 4,
            spaceBetween: 32,
          },
        }}
        className="!pb-12"
      >
        {properties.map((property, index) => (
          <SwiperSlide key={property.id}>
            {renderCard ? renderCard(property, index) : <PropertyCard property={property} index={index} />}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Styles for Pagination */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          background: #d1d5db;
          opacity: 1;
          width: 8px;
          height: 8px;
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-active {
          background: #059669;
          width: 24px;
          border-radius: 4px;
        }
        .swiper-pagination {
          bottom: 0 !important;
        }
      `}</style>
    </div>
  );
}
