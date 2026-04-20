'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, BedDouble, Bath, Users, MapPin, Calendar,
    SlidersHorizontal, X, ArrowRight, Home, Sparkles,
} from 'lucide-react';
import ImageWithLoader from '@/components/ImageWithLoader';
import BookingModal from '@/components/BookingModal';
import { useGetApartmentsQuery, ApiApartment } from '@/lib/store/api/propertyApi';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.55, delay: i * 0.08, ease },
    }),
};

function formatPrice(price: string | number, currency: string) {
    const n = typeof price === 'string' ? parseFloat(price) : price;
    return `${currency}${n.toLocaleString()}`;
}

interface ApartmentCardProps {
    apartment: ApiApartment;
    index: number;
    onBook: (apt: ApiApartment) => void;
}

function ApartmentCard({ apartment, index, onBook }: ApartmentCardProps) {
    const images = apartment.images || [];
    const firstImage = images.length > 0
        ? (typeof images[0] === 'string' ? images[0] : images[0].image)
        : '';
    const primaryImage = apartment.primary_image || firstImage;

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            custom={index}
            variants={fadeUp}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col"
        >
            <div className="relative h-52 overflow-hidden">
                <ImageWithLoader
                    src={primaryImage}
                    alt={apartment.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {apartment.featured && (
                    <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-full uppercase tracking-wide shadow">
                            Featured
                        </span>
                    </div>
                )}

                <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1 bg-emerald-600 text-white text-sm font-bold rounded-full shadow">
                        {formatPrice(apartment.price, apartment.currency)}<span className="font-normal text-xs opacity-80">/night</span>
                    </span>
                </div>

                {!apartment.is_available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">Not Available</span>
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {apartment.title}
                </h3>

                {apartment.location && (
                    <div className="flex items-center text-gray-400 text-xs mb-3">
                        <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 text-emerald-500" />
                        <span className="line-clamp-1">{apartment.location}</span>
                    </div>
                )}

                <div className="flex items-center gap-4 text-gray-500 text-xs mb-4">
                    <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-emerald-500" />{apartment.bedrooms} bed</span>
                    <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-emerald-500" />{apartment.bathrooms} bath</span>
                    {apartment.guests && (
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-emerald-500" />{apartment.guests} guests</span>
                    )}
                </div>

                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed flex-grow mb-4">
                    {apartment.description}
                </p>

                <button
                    onClick={() => onBook(apartment)}
                    disabled={!apartment.is_available}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-emerald-500/30 hover:shadow-lg"
                >
                    <Calendar className="w-4 h-4" />
                    Book Now
                </button>
            </div>
        </motion.div>
    );
}

const TYPES = ['All', '1-Bedroom', '2-Bedroom', '3-Bedroom', 'Studio', 'Penthouse'];

export default function BookingPage() {
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const [maxPrice, setMaxPrice] = useState<number | ''>('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedApartment, setSelectedApartment] = useState<ApiApartment | null>(null);

    const { data, isLoading } = useGetApartmentsQuery({ page_size: 50, ordering: '-created_at' });
    const apartments = data?.results || [];

    const filtered = useMemo(() => {
        return apartments.filter((apt) => {
            const matchesSearch =
                !search ||
                apt.title.toLowerCase().includes(search.toLowerCase()) ||
                (apt.location || '').toLowerCase().includes(search.toLowerCase()) ||
                apt.description.toLowerCase().includes(search.toLowerCase());
            const matchesType = selectedType === 'All' || apt.type === selectedType;
            const price = typeof apt.price === 'string' ? parseFloat(apt.price) : apt.price;
            const matchesPrice = !maxPrice || price <= maxPrice;
            return matchesSearch && matchesType && matchesPrice;
        });
    }, [apartments, search, selectedType, maxPrice]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <div className="relative bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 pt-28 pb-16 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
                />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/15 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-5">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-full">
                            <Sparkles className="w-3.5 h-3.5" />
                            Book Your Stay
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                            Find Your Perfect
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                Home Away From Home
                            </span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto">
                            Fully furnished, serviced apartments in {"Abuja's"} finest locations. Book instantly, stay comfortably.
                        </p>
                    </motion.div>

                    {/* Search bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-10 max-w-2xl mx-auto"
                    >
                        <div className="flex gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2">
                            <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4">
                                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search apartments, locations…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1 py-3 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
                                />
                                {search && (
                                    <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${showFilters ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters
                            </button>
                        </div>

                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 overflow-hidden"
                                >
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <label className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-2 block">Type</label>
                                            <div className="flex flex-wrap gap-2">
                                                {TYPES.map((t) => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setSelectedType(t)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedType === t ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="sm:w-52">
                                            <label className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-2 block">Max Price / night</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 150000"
                                                value={maxPrice}
                                                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                                                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/40 text-sm outline-none border border-white/10 focus:border-emerald-400"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {isLoading ? 'Loading…' : `${filtered.length} apartment${filtered.length !== 1 ? 's' : ''} available`}
                        </h2>
                        {(search || selectedType !== 'All' || maxPrice) && (
                            <p className="text-gray-500 text-sm mt-1">
                                Filtered results ·{' '}
                                <button
                                    onClick={() => { setSearch(''); setSelectedType('All'); setMaxPrice(''); }}
                                    className="text-emerald-600 hover:underline font-medium"
                                >
                                    Clear all
                                </button>
                            </p>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 animate-pulse">
                                <div className="h-52 bg-gray-200" />
                                <div className="p-5 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    <div className="h-10 bg-gray-200 rounded-xl mt-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((apt, i) => (
                            <ApartmentCard
                                key={apt.id}
                                apartment={apt}
                                index={i}
                                onBook={setSelectedApartment}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl">
                        <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-400 mb-2">No apartments found</h3>
                        <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                        <button
                            onClick={() => { setSearch(''); setSelectedType('All'); setMaxPrice(''); }}
                            className="mt-4 text-emerald-600 hover:underline font-semibold text-sm"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            <BookingModal
                isOpen={!!selectedApartment}
                onClose={() => setSelectedApartment(null)}
                propertyTitle={selectedApartment?.title || ''}
                propertyId={selectedApartment?.id || ''}
            />
        </div>
    );
}
