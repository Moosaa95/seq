'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Check,
  Phone,
  Mail,
  ArrowLeft,
  Share2,
  Heart,
  Home as HomeIcon,
  User,
  CalendarCheck,
  Users,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import ImageWithLoader from '@/components/ImageWithLoader';
import BookingModal from '@/components/BookingModal';
import { useGetApartmentQuery } from '@/lib/store/api/propertyApi';
import { useSubmitPropertyInquiryMutation } from '@/lib/store/api/inquiryApi';

export default function ApartmentDetailClient({ apartmentId }: { apartmentId: string }) {
  const { data: apartment, isLoading, error: loadError } = useGetApartmentQuery(apartmentId);
  const [submitInquiry, { isLoading: isSubmitting, isSuccess: success, error: inquiryError }] =
    useSubmitPropertyInquiryMutation();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'I am interested in this property. Please contact me with more details.',
  });

  useEffect(() => {
    if (apartment?.categorized_images?.[0]?.category) {
      setSelectedCategory(apartment.categorized_images[0].category);
    }
  }, [apartment]);

  useEffect(() => {
    if (success) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: 'I am interested in this property. Please contact me with more details.',
      });
      setTimeout(() => setShowContactForm(false), 3000);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitInquiry({
        apartment_id: apartmentId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      }).unwrap();
    } catch (err) {
      console.error('Failed to submit inquiry', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent" />
      </div>
    );
  }

  if (loadError || !apartment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-xl font-bold">Apartment not found</h2>
        <Link href="/properties" className="text-emerald-600 hover:underline">
          Back to Properties
        </Link>
      </div>
    );
  }

  const amenitiesList = Array.isArray(apartment.amenities) ? apartment.amenities : [];
  const categorizedImages = apartment.categorized_images || [];
  const displayImages =
    apartment.images && apartment.images.length > 0
      ? apartment.images.map((img: any) => (typeof img === 'string' ? img : img.image))
      : [];

  const agentName = apartment.agent?.name || 'Agent';
  const agentPhone = apartment.agent?.phone || '';
  const agentEmail = apartment.agent?.email || '';

  const backHref = apartment.parent_property
    ? `/properties/${apartment.parent_property}`
    : '/properties';

  return (
    <div className="pt-20 min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Property
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-xl w-full"
            >
              <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] group overflow-hidden w-full">
                <ImageWithLoader
                  src={displayImages[currentImageIndex]}
                  alt={apartment.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute top-4 right-4 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-all shadow-lg cursor-pointer"
                  >
                    <Share2 className="h-5 w-5 text-gray-700" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-all shadow-lg cursor-pointer"
                  >
                    <Heart className="h-5 w-5 text-gray-700 hover:text-red-500 transition-colors" />
                  </motion.button>
                </div>
                <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg">
                  For {apartment.status === 'rent' ? 'Rent' : 'Sale'}
                </div>
              </div>
              {displayImages.length > 1 && (
                <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50">
                  {displayImages.map((image: string, index: number) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative h-16 sm:h-20 md:h-24 rounded-xl overflow-hidden transition-all cursor-pointer ${
                        currentImageIndex === index
                          ? 'ring-2 sm:ring-4 ring-emerald-600 shadow-lg'
                          : 'ring-1 ring-gray-200 hover:ring-emerald-300'
                      }`}
                    >
                      <ImageWithLoader
                        src={image}
                        alt={`View ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 150px"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Apartment Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg w-full"
            >
              {apartment.entity && (
                <div className="mb-4">
                  <span className="inline-block bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                    Managed by {apartment.entity}
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                <div className="flex-1 min-w-0 w-full">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 break-words">
                    {apartment.title}
                  </h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 shrink-0" />
                    <span className="text-sm sm:text-base md:text-lg">{apartment.location}</span>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto shrink-0">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-600 whitespace-nowrap">
                    {apartment.currency}{Number(apartment.price).toLocaleString()}
                  </div>
                  {apartment.status === 'rent' && (
                    <div className="text-sm sm:text-base text-gray-600">per night</div>
                  )}
                </div>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y">
                <div className="text-center">
                  <BedDouble className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{apartment.bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center">
                  <Bath className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{apartment.bathrooms}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center">
                  <HomeIcon className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{apartment.living_rooms}</div>
                  <div className="text-sm text-gray-600">Living Rooms</div>
                </div>
                <div className="text-center">
                  {apartment.status === 'rent' && apartment.guests && (
                    <>
                      <Users className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{apartment.guests}</div>
                      <div className="text-sm text-gray-600">Guests</div>
                    </>
                  )}
                  {apartment.status === 'sale' && apartment.area && (
                    <>
                      <Maximize className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{apartment.area} sqft</div>
                      <div className="text-sm text-gray-600">Area</div>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Description</h2>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{apartment.description}</p>
              </div>

              {/* Tags */}
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="bg-gray-50 px-3 sm:px-4 py-2 rounded-lg">
                  <span className="text-xs sm:text-sm text-gray-600">Type: </span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{apartment.type}</span>
                </div>
                {apartment.units && (
                  <div className="bg-gray-50 px-3 sm:px-4 py-2 rounded-lg">
                    <span className="text-xs sm:text-sm text-gray-600">Units: </span>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{apartment.units}</span>
                  </div>
                )}
                {apartment.garages && (
                  <div className="bg-gray-50 px-3 sm:px-4 py-2 rounded-lg">
                    <span className="text-xs sm:text-sm text-gray-600">Garages: </span>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{apartment.garages}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {amenitiesList.map((amenity: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-emerald-100 p-1.5 sm:p-2 rounded-full shrink-0">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                    </div>
                    <span className="text-gray-700 text-sm sm:text-base">{amenity}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Categorized Image Gallery */}
            {categorizedImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Explore the Apartment</h2>

                <div className="flex flex-wrap gap-2 mb-6">
                  {categorizedImages.map((category: any) => (
                    <button
                      key={category.category}
                      onClick={() => setSelectedCategory(category.category)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                        selectedCategory === category.category
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.category}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categorizedImages
                    .find((cat: any) => cat.category === selectedCategory)
                    ?.images.map((image: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative h-48 rounded-xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-shadow"
                      >
                        <ImageWithLoader
                          src={image}
                          alt={`${selectedCategory} view ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-3 left-3 text-white text-sm font-medium">
                            {selectedCategory}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Contact Agent */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg lg:sticky lg:top-28"
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Contact Agent</h3>

              <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="bg-emerald-100 p-2 sm:p-3 rounded-full shrink-0">
                    <User className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900 text-sm sm:text-base truncate">{agentName}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Property Agent</div>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <a
                    href={`tel:${agentPhone}`}
                    className="flex items-center gap-2 sm:gap-3 text-gray-700 hover:text-emerald-600 transition-colors text-sm sm:text-base"
                  >
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span className="truncate">{agentPhone}</span>
                  </a>
                  <a
                    href={`mailto:${agentEmail}`}
                    className="flex items-center gap-2 sm:gap-3 text-gray-700 hover:text-emerald-600 transition-colors text-sm sm:text-base"
                  >
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span className="truncate">{agentEmail}</span>
                  </a>
                </div>
              </div>

              {!showContactForm ? (
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowBookingModal(true)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition-all font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CalendarCheck className="h-5 w-5" />
                    Book Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowContactForm(true)}
                    className="w-full bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all font-semibold cursor-pointer"
                  >
                    Send Message
                  </motion.button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {inquiryError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">
                        {'data' in inquiryError
                          ? (inquiryError.data as any)?.message || 'Failed to send inquiry'
                          : 'Failed to send inquiry'}
                      </p>
                    </div>
                  )}

                  {success && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-700">Inquiry sent successfully!</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || success}
                      className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Sending...' : success ? 'Sent!' : 'Send'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="flex-1 bg-gray-100 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        propertyTitle={apartment.title}
        propertyId={apartment.id}
      />
    </div>
  );
}
