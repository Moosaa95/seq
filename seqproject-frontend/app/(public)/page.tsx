'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Building2, Key, ClipboardList, HardHat, Home,
    Star, Shield, Users, MapPin, ChevronRight, CheckCircle2,
    Phone, Award, Wrench, Calendar,
} from 'lucide-react';
import { testimonials } from '@/lib/data';
import PropertySlider from '@/components/PropertySlider';
import PropertyBuildingCard from '@/components/PropertyBuildingCard';
import ImageWithLoader from '@/components/ImageWithLoader';
import { useGetPropertiesQuery } from '@/lib/store/api/propertyApi';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.7, delay: i * 0.11, ease },
    }),
};

// ─── Marquee ──────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
    'Premium Real Estate', 'Construction Excellence', 'Property Management',
    'Short-Let & Airbnb', '8+ Years Experience', '200+ Happy Clients',
    'Abuja · Nigeria', 'Quality You Can Trust',
];

function MarqueeStrip() {
    const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
    return (
        <div className="bg-emerald-600 py-3 overflow-hidden select-none">
            <motion.div
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="flex whitespace-nowrap"
            >
                {doubled.map((item, i) => (
                    <span key={i} className="inline-flex items-center gap-5 px-6 text-white text-sm font-semibold uppercase tracking-widest">
                        {item}
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 flex-shrink-0" />
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

function SectionLabel({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
    if (dark) return (
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            {children}
        </div>
    );
    return (
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            {children}
        </div>
    );
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function HomePage() {
    const { data: propertiesData, isLoading: propertiesLoading } = useGetPropertiesQuery({ page_size: 6, ordering: '-created_at' });
    const properties = propertiesData?.results || [];
    const totalCount = propertiesData?.count || 0;

    const { scrollY } = useScroll();
    const heroParallax = useTransform(scrollY, [0, 700], [0, 100]);

    const heroSlides = [
        { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80', label: 'Luxury Living', tagline: 'Find your dream home in Abuja' },
        { url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80', label: 'Construction', tagline: 'Built with precision and purpose' },
        { url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80', label: 'Property Management', tagline: 'Your investments, expertly managed' },
        { url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80', label: 'Development', tagline: 'Shaping tomorrow\'s skylines' },
    ];

    const [currentSlide, setCurrentSlide] = React.useState(0);
    React.useEffect(() => {
        const t = setInterval(() => setCurrentSlide(p => (p + 1) % heroSlides.length), 5500);
        return () => clearInterval(t);
    }, [heroSlides.length]);

    const stats = [
        { value: '8+', label: 'Years of Excellence', icon: Award },
        { value: `${totalCount || 50}+`, label: 'Properties Listed', icon: Building2 },
        { value: '200+', label: 'Happy Clients', icon: Users },
        { value: '24/7', label: 'Expert Support', icon: Shield },
    ];

    const constructionPhases = [
        { num: '01', title: 'Planning & Design', desc: 'Architectural planning, structural engineering, and detailed blueprints tailored to your vision.' },
        { num: '02', title: 'Site Preparation', desc: 'Land clearing, grading, foundation excavation, and full site readiness assessment.' },
        { num: '03', title: 'Structural Build', desc: 'Concrete works, steel framing, roofing, and all primary structural elements.' },
        { num: '04', title: 'Interior Finishing', desc: 'Plastering, tiling, painting, electrical, plumbing, and premium interior installations.' },
        { num: '05', title: 'Handover & Support', desc: 'Quality inspection, snagging, final walkthrough, and post-handover maintenance support.' },
    ];

    const processSteps = [
        { icon: MapPin, step: '01', title: 'Browse Properties', desc: 'Explore our curated portfolio of premium properties across Abuja.' },
        { icon: Calendar, step: '02', title: 'Schedule a Tour', desc: 'Book an in-person or virtual viewing with one of our expert agents.' },
        { icon: ClipboardList, step: '03', title: 'Agree Terms', desc: 'Our team handles all documentation, legals, and negotiation for you.' },
        { icon: CheckCircle2, step: '04', title: 'Move In', desc: 'Keys in hand — we support you from signing all the way to settlement.' },
    ];

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">

            {/* ─── HERO ─────────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                <motion.div style={{ y: heroParallax }} className="absolute inset-0 scale-110">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, scale: 1.04 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.4, ease: 'easeOut' }}
                            className="absolute inset-0"
                        >
                            <ImageWithLoader
                                src={heroSlides[currentSlide].url}
                                alt={heroSlides[currentSlide].label}
                                fill className="object-cover" priority
                            />
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/60 to-black/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Slide label top-right */}
                <div className="absolute top-32 right-10 hidden lg:block text-right z-10">
                    <AnimatePresence mode="wait">
                        <motion.div key={currentSlide}
                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.45 }}
                        >
                            <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">{heroSlides[currentSlide].label}</div>
                            <div className="text-white/55 text-sm">{heroSlides[currentSlide].tagline}</div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Content */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-24">
                    <div className="max-w-3xl">
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
                            className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 text-emerald-300 text-sm font-medium px-5 py-2 rounded-full mb-8"
                        >
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            Sequoia Projects — Abuja, Nigeria
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.1, ease }}
                            className="text-5xl sm:text-6xl lg:text-[72px] xl:text-[80px] font-black text-white leading-[1.04] tracking-tight mb-7"
                        >
                            We Build.
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                We Manage.
                            </span>
                            We Deliver.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.22, ease }}
                            className="text-white/75 text-lg lg:text-xl leading-relaxed mb-10 max-w-xl"
                        >
                            Abuja's premier integrated real estate and construction firm. From luxury short-lets and estate developments to full property management — all under one roof.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.32, ease }}
                            className="flex flex-col sm:flex-row gap-4 mb-12"
                        >
                            <Link href="/properties"
                                className="group bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Explore Properties
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link href="/services"
                                className="bg-white/10 hover:bg-white/18 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Wrench className="w-4 h-4" />
                                Our Services
                            </Link>
                        </motion.div>

                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                            className="flex flex-wrap gap-5"
                        >
                            {['Verified Properties', 'Licensed Builders', '24/7 Client Support', 'No Hidden Fees'].map(b => (
                                <div key={b} className="flex items-center gap-1.5 text-white/65 text-sm">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    {b}
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Slide indicators */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5">
                    {heroSlides.map((_, i) => (
                        <button key={i} onClick={() => setCurrentSlide(i)} aria-label={`Slide ${i + 1}`}>
                            <motion.div
                                animate={{ width: i === currentSlide ? 28 : 8 }}
                                transition={{ duration: 0.4 }}
                                className={`h-2 rounded-full transition-colors ${i === currentSlide ? 'bg-emerald-400' : 'bg-white/30 hover:bg-white/55'}`}
                            />
                        </button>
                    ))}
                </div>

                {/* Scroll hint */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
                    className="absolute bottom-10 right-8 hidden lg:flex flex-col items-center gap-2"
                >
                    <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}
                        className="w-5 h-8 border border-white/30 rounded-full flex justify-center pt-1.5"
                    >
                        <div className="w-0.5 h-2 bg-white/50 rounded-full" />
                    </motion.div>
                    <span className="text-white/35 text-[10px] tracking-widest uppercase">Scroll</span>
                </motion.div>
            </section>

            {/* ─── MARQUEE ──────────────────────────────────────────────── */}
            <MarqueeStrip />

            {/* ─── BOOK NOW BANNER ──────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-white py-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="relative rounded-3xl overflow-hidden"
                    >
                        {/* Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800" />
                        <div className="absolute inset-0 opacity-[0.07]"
                            style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
                        />
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full translate-x-1/3 -translate-y-1/2 blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-300/20 rounded-full -translate-x-1/3 translate-y-1/2 blur-2xl pointer-events-none" />

                        <div className="relative z-10 px-8 py-14 sm:px-16 flex flex-col lg:flex-row items-center justify-between gap-10">
                            {/* Text */}
                            <div className="text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white/90 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Instant Booking
                                </div>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-4">
                                    Ready for Your Next Stay?
                                    <span className="block text-emerald-200 text-2xl sm:text-3xl font-bold mt-1">
                                        Fully serviced apartments, Abuja.
                                    </span>
                                </h2>
                                <p className="text-white/75 text-base sm:text-lg max-w-lg leading-relaxed">
                                    Browse our curated short-let apartments, pick your dates, and book instantly — no middleman, no hassle.
                                </p>
                            </div>

                            {/* CTA block */}
                            <div className="flex flex-col items-center gap-5 shrink-0">
                                <div className="flex items-center gap-4 text-white/80 text-sm">
                                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-300" /> Instant Confirmation</div>
                                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-300" /> No Hidden Fees</div>
                                </div>
                                <Link
                                    href="/booking"
                                    className="group relative inline-flex items-center justify-center gap-3 bg-white text-emerald-700 hover:bg-emerald-50 px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-black/25 hover:shadow-black/35 transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <Calendar className="w-5 h-5" />
                                    Book Your Stay
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <p className="text-white/55 text-xs">1-bedroom units from ₦75,000/night</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ─── STATS ────────────────────────────────────────────────── */}
            <section className="bg-gray-900">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
                        {stats.map((s, i) => (
                            <motion.div key={s.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                                className="flex flex-col sm:flex-row items-center sm:items-start gap-3 py-8 px-6"
                            >
                                <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <s.icon className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <div className="text-2xl md:text-3xl font-black text-white">{s.value}</div>
                                    <div className="text-gray-400 text-xs mt-0.5 uppercase tracking-wide">{s.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── ABOUT / PLATFORM OVERVIEW ────────────────────────────── */}
            <section className="py-28 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        {/* Left */}
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                            <SectionLabel>About Sequoia Projects</SectionLabel>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight mb-6">
                                One Firm.{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                                    Complete Solutions.
                                </span>
                            </h2>
                            <p className="text-gray-500 text-lg leading-relaxed mb-10">
                                {"Sequoia Projects is Abuja's leading integrated real estate and construction firm. We don't just list properties — we build them, manage them, and maximise their value for owners, tenants, and investors alike."}
                            </p>

                            <div className="space-y-6 mb-10">
                                {[
                                    { icon: Building2, title: 'Real Estate Sales & Rentals', desc: "Premium apartments, villas, and commercial spaces in Abuja's finest locations — curated and verified." },
                                    { icon: HardHat, title: 'Construction & Development', desc: 'Full-cycle construction from design to handover — residential villas, commercial builds, and estate projects.' },
                                    { icon: Key, title: 'Property & Short-Let Management', desc: "We handle tenant placement, rent collection, Airbnb hosting, and maintenance — you earn without the effort." },
                                    { icon: ClipboardList, title: 'Consultancy & Project Planning', desc: 'Expert feasibility studies, budget planning, and execution guidance for any real estate project.' },
                                ].map((item, i) => (
                                    <motion.div key={item.title} custom={i + 1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                                        className="flex gap-4 group"
                                    >
                                        <div className="w-11 h-11 bg-emerald-50 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                                            <item.icon className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 mb-1">{item.title}</div>
                                            <div className="text-gray-500 text-sm leading-relaxed">{item.desc}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <Link href="/about" className="group inline-flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                                Learn more about us
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </motion.div>

                        {/* Right — image collage */}
                        <motion.div
                            initial={{ opacity: 0, x: 48 }} whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.85, ease }}
                            className="relative hidden lg:block"
                        >
                            <div className="grid grid-cols-2 gap-4" style={{ height: 560 }}>
                                {/* Left tall image */}
                                <div className="relative rounded-3xl overflow-hidden">
                                    <ImageWithLoader
                                        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700&q=80"
                                        alt="Luxury property" fill className="object-cover" sizes="300px"
                                    />
                                </div>
                                {/* Right: two stacked images */}
                                <div className="flex flex-col gap-4">
                                    <div className="relative rounded-3xl overflow-hidden flex-1">
                                        <ImageWithLoader
                                            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=80"
                                            alt="Construction site" fill className="object-cover" sizes="300px"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5">
                                            <span className="text-white text-sm font-bold">Construction</span>
                                        </div>
                                    </div>
                                    <div className="relative rounded-3xl overflow-hidden flex-1">
                                        <ImageWithLoader
                                            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&q=80"
                                            alt="Property management" fill className="object-cover" sizes="300px"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5">
                                            <span className="text-white text-sm font-bold">Property Management</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Floating stat card */}
                            <div className="absolute -bottom-5 left-6 bg-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4 z-10">
                                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Award className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-gray-900">8+ Years</div>
                                    <div className="text-sm text-gray-500">Of proven excellence</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ─── SERVICES BENTO ───────────────────────────────────────── */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
                        <SectionLabel>What We Do</SectionLabel>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">
                            Full-Spectrum Real Estate Services
                        </h2>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                            From finding your dream home to building it from the ground up — your end-to-end real estate partner.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* Real Estate – wide card */}
                        <motion.div custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                            whileHover={{ y: -4 }}
                            className="relative rounded-3xl overflow-hidden md:col-span-2 lg:col-span-2 group cursor-pointer"
                            style={{ height: 360 }}
                        >
                            <ImageWithLoader src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80" alt="Real Estate"
                                fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width:768px) 100vw, 66vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-8">
                                <div className="inline-flex items-center gap-2 bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
                                    <Building2 className="w-3.5 h-3.5" /> Real Estate
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">Buy, Sell & Lease</h3>
                                <p className="text-white/70 text-sm leading-relaxed max-w-md">Premium residential and commercial properties across Abuja's most desirable neighbourhoods — curated, verified, and ready for you.</p>
                            </div>
                            <div className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="w-4 h-4 text-white" />
                            </div>
                        </motion.div>

                        {/* Construction */}
                        <motion.div custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                            whileHover={{ y: -4 }}
                            className="relative rounded-3xl overflow-hidden group cursor-pointer"
                            style={{ height: 360 }}
                        >
                            <ImageWithLoader src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80" alt="Construction"
                                fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width:768px) 100vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-6">
                                <div className="inline-flex items-center gap-2 bg-amber-500 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
                                    <HardHat className="w-3.5 h-3.5" /> Construction
                                </div>
                                <h3 className="text-xl font-black text-white mb-2">We Build to Last</h3>
                                <p className="text-white/70 text-sm leading-relaxed">Quality construction for villas, estates & commercial projects.</p>
                            </div>
                        </motion.div>

                        {/* Property Management */}
                        <motion.div custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                            whileHover={{ y: -4 }}
                            className="bg-white rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-lg border border-gray-100 hover:border-blue-100 transition-all duration-300 group"
                        >
                            <div>
                                <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center mb-6 transition-colors">
                                    <Key className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Property Management</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">Full-service management — tenant screening, rent collection, maintenance, and compliance reporting.</p>
                            </div>
                            <Link href="/services" className="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-sm mt-6 group-hover:gap-2.5 transition-all">
                                Learn more <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>

                        {/* Short-Let */}
                        <motion.div custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                            whileHover={{ y: -4 }}
                            className="bg-gray-900 rounded-3xl p-8 flex flex-col justify-between group"
                        >
                            <div>
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                    <Home className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Short-Let & Airbnb</h3>
                                <p className="text-white/55 text-sm leading-relaxed">Complete short-let management: bookings, cleaning, guest communication, and revenue optimisation.</p>
                            </div>
                            <Link href="/services" className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-sm mt-6 group-hover:gap-2.5 transition-all">
                                Learn more <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>

                        {/* Consultancy */}
                        <motion.div custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                            whileHover={{ y: -4 }}
                            className="bg-white rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-lg border border-gray-100 hover:border-rose-100 transition-all duration-300 group"
                        >
                            <div>
                                <div className="w-12 h-12 bg-rose-50 group-hover:bg-rose-100 rounded-2xl flex items-center justify-center mb-6 transition-colors">
                                    <ClipboardList className="w-6 h-6 text-rose-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Project Consultancy</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">Feasibility studies, development planning, budgeting, and expert project execution support from start to finish.</p>
                            </div>
                            <Link href="/services" className="inline-flex items-center gap-1.5 text-rose-600 font-semibold text-sm mt-6 group-hover:gap-2.5 transition-all">
                                Learn more <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ─── CONSTRUCTION SHOWCASE ────────────────────────────────── */}
            <section className="relative bg-gray-950 py-28 overflow-hidden">
                <div className="absolute inset-0">
                    <ImageWithLoader
                        src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&q=80"
                        alt="Construction workers" fill className="object-cover opacity-[0.15]" sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/95 to-gray-950/75" />
                </div>
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)', backgroundSize: '48px 48px' }}
                />

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-20 items-start">
                        {/* Left */}
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/25 text-amber-400 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                                <HardHat className="w-3.5 h-3.5" /> Construction Division
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tight mb-6">
                                Built with{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                                    Precision.
                                </span>
                                <br />Finished with Care.
                            </h2>
                            <p className="text-white/55 text-lg leading-relaxed mb-10">
                                Our construction arm delivers residential villas, commercial developments, and estate projects across Abuja — on time, within budget, and to uncompromising standards of quality.
                            </p>

                            {/* Construction stats */}
                            <div className="grid grid-cols-3 gap-4 mb-10">
                                {[
                                    { value: '25+', label: 'Projects Completed' },
                                    { value: '12K+', label: 'Sq. Metres Built' },
                                    { value: '100%', label: 'On-Time Delivery' },
                                ].map((stat, i) => (
                                    <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center"
                                    >
                                        <div className="text-2xl font-black text-amber-400 mb-1">{stat.value}</div>
                                        <div className="text-white/45 text-xs uppercase tracking-wide leading-tight">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Construction types */}
                            <div className="flex flex-wrap gap-3 mb-10">
                                {['Residential Villas', 'Estate Developments', 'Commercial Builds', 'Renovations', 'Interior Fit-Out'].map(tag => (
                                    <span key={tag} className="px-4 py-2 rounded-full bg-white/8 border border-white/12 text-white/65 text-sm font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <Link href="/services"
                                className="group inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-amber-500/20 transition-all duration-300"
                            >
                                View Construction Services
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </motion.div>

                        {/* Right – construction phases */}
                        <motion.div
                            initial={{ opacity: 0, x: 32 }} whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.85, ease }}
                        >
                            <div className="mb-8">
                                <div className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">Our Construction Process</div>
                                <div className="h-px bg-white/10" />
                            </div>
                            <div className="space-y-0">
                                {constructionPhases.map((phase, i) => (
                                    <motion.div key={phase.num} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                                        className="flex gap-5 group"
                                    >
                                        <div className="flex flex-col items-center flex-shrink-0">
                                            <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/35 rounded-full flex items-center justify-center text-amber-400 font-black text-xs group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-all duration-300">
                                                {phase.num}
                                            </div>
                                            {i < constructionPhases.length - 1 && (
                                                <div className="w-px flex-1 bg-white/8 my-2 min-h-[24px]" />
                                            )}
                                        </div>
                                        <div className={`${i < constructionPhases.length - 1 ? 'pb-8' : ''}`}>
                                            <h4 className="text-white font-bold mb-1.5 group-hover:text-amber-400 transition-colors duration-200">{phase.title}</h4>
                                            <p className="text-white/45 text-sm leading-relaxed">{phase.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ─── FEATURED PROPERTIES ──────────────────────────────────── */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                            <SectionLabel>Portfolio</SectionLabel>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Featured Properties</h2>
                            <p className="text-gray-500 mt-2">Handpicked premium developments across Abuja</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                            <Link href="/properties" className="group inline-flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                                View all properties
                                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </motion.div>
                    </div>

                    {propertiesLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : properties.length > 0 ? (
                        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                            <PropertySlider
                                properties={properties}
                                renderCard={(property, index) => <PropertyBuildingCard property={property} index={index} />}
                            />
                        </motion.div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl">
                            <Home className="h-14 w-14 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium">New properties coming soon</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ─── HOW IT WORKS ─────────────────────────────────────────── */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
                        <SectionLabel>Process</SectionLabel>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">How It Works</h2>
                        <p className="text-gray-500 text-lg max-w-xl mx-auto">From first browse to keys in hand — a seamless journey, every step of the way.</p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {processSteps.map((step, i) => (
                            <motion.div key={step.step} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                                whileHover={{ y: -4 }}
                                className="relative bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 text-center group"
                            >
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-emerald-600 text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                    {step.step}
                                </div>
                                <div className="mt-5 mb-5">
                                    <div className="w-14 h-14 bg-emerald-50 group-hover:bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto transition-colors">
                                        <step.icon className="w-7 h-7 text-emerald-600" />
                                    </div>
                                </div>
                                <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-center mt-12"
                    >
                        <Link href="/properties"
                            className="group inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all duration-300"
                        >
                            Start Your Journey
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ─── TESTIMONIALS ─────────────────────────────────────────── */}
            <section className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
                        <SectionLabel>Client Stories</SectionLabel>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">What Our Clients Say</h2>
                        <p className="text-gray-500 text-lg max-w-xl mx-auto">Real words from people who trusted us with their biggest decisions.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {testimonials.map((t, i) => (
                            <motion.div key={t.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                                className="bg-slate-50 p-8 rounded-3xl border border-gray-100 hover:border-emerald-100 hover:shadow-xl transition-all duration-300"
                            >
                                <div className="text-6xl font-black text-emerald-100 leading-none mb-2 select-none">"</div>
                                <div className="flex gap-1 mb-4">
                                    {[...Array(t.rating ?? 5)].map((_, j) => (
                                        <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-8 text-[15px]">{t.content}</p>
                                <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                                    <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-emerald-100 flex-shrink-0">
                                        <ImageWithLoader src={t.image} alt={t.name} width={44} height={44} className="object-cover w-full h-full" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                                        <div className="text-emerald-600 text-xs font-medium mt-0.5">{t.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA ──────────────────────────────────────────────────── */}
            <section className="relative py-28 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900" />
                <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-emerald-500/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />

                <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-7">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-full">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            Ready to Begin?
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                            Your Property Journey
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                Starts Here
                            </span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
                            Whether you're looking to rent, buy, build, or invest — our team is ready to guide you every step of the way.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                            <Link href="/properties"
                                className="group bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Browse Properties
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link href="/contact"
                                className="bg-white/10 hover:bg-white/15 border border-white/20 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
                            >
                                <Phone className="w-4 h-4" />
                                Talk to an Agent
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
