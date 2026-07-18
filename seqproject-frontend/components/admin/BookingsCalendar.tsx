'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    addMonths,
    subMonths,
    differenceInCalendarDays,
    parseISO,
    isToday,
    isBefore,
    startOfDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, X, User, Mail, Phone, MapPin, DollarSign, Calendar as CalendarIcon, Plus, AlertTriangle, Receipt, Eye, Pencil, Ban } from 'lucide-react';
import type { ApiBooking } from '@/lib/store/api/adminApi';
import type { ApiApartment } from '@/lib/store/api/propertyApi';
import type { BlockedDate } from '@/lib/store/api/calendarApi';

const DARK = '#403D3D';

interface BookingsCalendarProps {
    bookings: ApiBooking[];
    apartments: ApiApartment[];
    blockedDates?: BlockedDate[];
    onStatusChange?: (bookingId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') => void;
    /** Called when admin clicks an empty cell to create a walk-in booking */
    onWalkInBook?: (apartment: ApiApartment, date: string) => void;
    onRaiseDispute?: (booking: ApiBooking) => void;
    onPrintReceipt?: (booking: ApiBooking) => void;
    onViewMore?: (booking: ApiBooking) => void;
    onEditBooking?: (booking: ApiBooking) => void;
    onCancelBooking?: (booking: ApiBooking) => void;
}

const ROW_H = 40;

const STATUS_STYLES: Record<string, { bar: string; text: string }> = {
    confirmed: { bar: 'bg-emerald-500', text: 'text-white' },
    pending:   { bar: 'bg-amber-400',   text: 'text-amber-900' },
    cancelled: { bar: 'bg-red-400',     text: 'text-white' },
    completed: { bar: 'bg-blue-500',    text: 'text-white' },
};

export default function BookingsCalendar({ bookings, apartments, blockedDates = [], onStatusChange, onWalkInBook, onRaiseDispute, onPrintReceipt, onViewMore, onEditBooking, onCancelBooking }: BookingsCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedBooking, setSelectedBooking] = useState<ApiBooking | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Responsive dimensions
    const [windowWidth, setWindowWidth] = useState(0);
    useEffect(() => {
        const update = () => setWindowWidth(window.innerWidth);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);
    const isMobile = windowWidth > 0 && windowWidth < 640;
    const isTablet = windowWidth >= 640 && windowWidth < 1024;
    const CELL_W   = isMobile ? 28 : isTablet ? 34 : 42;
    const SIDEBAR_W = isMobile ? 100 : isTablet ? 150 : 200;

    const days = useMemo(() => {
        return eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
    }, [currentMonth]);

    // Scroll timeline to today on initial load (once window width is known)
    useEffect(() => {
        if (!scrollRef.current || windowWidth === 0) return;
        const todayOffset = differenceInCalendarDays(today, days[0]);
        if (todayOffset > 0 && todayOffset < days.length) {
            scrollRef.current.scrollLeft = Math.max(0, (todayOffset - 2) * CELL_W);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [windowWidth]);

    const rangeStart = days[0];
    const totalDays = days.length;
    const today = startOfDay(new Date());

    const groups = useMemo(() => {
        const map = new Map<string, { propertyName: string; propertyId: string | null; apts: ApiApartment[] }>();
        for (const apt of apartments) {
            const propId = apt.parent_property ?? '__standalone__';
            const propName = apt.property_details?.name ?? (apt.parent_property ? `Property ${apt.parent_property}` : 'Standalone Units');
            if (!map.has(propId)) map.set(propId, { propertyName: propName, propertyId: apt.parent_property, apts: [] });
            map.get(propId)!.apts.push(apt);
        }
        return Array.from(map.values()).sort((a, b) => {
            if (a.propertyId === null) return 1;
            if (b.propertyId === null) return -1;
            return a.propertyName.localeCompare(b.propertyName);
        }).map(group => ({ ...group, apts: group.apts.slice().sort((a, b) => a.title.localeCompare(b.title)) }));
    }, [apartments]);

    const bookingsByApt = useMemo(() => {
        const idx = new Map<string, ApiBooking[]>();
        for (const b of bookings) {
            if (!b.apartment_details) continue;
            const id = b.apartment_details.id;
            if (!idx.has(id)) idx.set(id, []);
            idx.get(id)!.push(b);
        }
        return idx;
    }, [bookings]);

    const blockedByApt = useMemo(() => {
        const idx = new Map<string, BlockedDate[]>();
        for (const bd of blockedDates) {
            const id = bd.apartment;
            if (!idx.has(id)) idx.set(id, []);
            idx.get(id)!.push(bd);
        }
        return idx;
    }, [blockedDates]);

    function blockedBarGeometry(bd: BlockedDate) {
        const start = parseISO(bd.start_date);
        const end = parseISO(bd.end_date);
        const rawStart = differenceInCalendarDays(start, rangeStart);
        const rawEnd = differenceInCalendarDays(end, rangeStart);
        const startDay = Math.max(0, rawStart);
        const endDay = Math.min(totalDays, rawEnd);
        const width = endDay - startDay;
        if (width <= 0) return null;
        return { left: startDay * CELL_W, width: width * CELL_W - 2 };
    }

    /**
     * Returns pixel geometry for a booking bar within this month's view.
     * Check-out day is NOT included in the bar (it's free for a new check-in).
     */
    function barGeometry(booking: ApiBooking) {
        const checkIn  = parseISO(booking.check_in);
        const checkOut = parseISO(booking.check_out);
        const rawStart = differenceInCalendarDays(checkIn, rangeStart);
        const rawEnd   = differenceInCalendarDays(checkOut, rangeStart);
        const startDay = Math.max(0, rawStart);
        const endDay   = Math.min(totalDays, rawEnd);
        const width    = endDay - startDay;
        if (width <= 0) return null;
        return {
            left:         startDay * CELL_W,
            width:        width * CELL_W - 2,
            clippedLeft:  rawStart < 0,
            clippedRight: rawEnd > totalDays,
        };
    }

    return (
        <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden" style={{ background: '#fff' }}>
            {/* Month navigation bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200" style={{ backgroundColor: DARK }}>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setCurrentMonth(m => subMonths(m, 1))}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4 text-white" />
                    </button>
                    <h2 className="text-base font-semibold text-white min-w-[140px] text-center">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                    <button
                        onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <ChevronRight className="h-4 w-4 text-white" />
                    </button>
                    <button
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-2.5 py-1 text-xs font-medium text-white bg-white/15 border border-white/20 rounded-md hover:bg-white/25 transition-colors"
                    >
                        Today
                    </button>
                </div>

                <div className="hidden sm:flex items-center gap-4 text-xs text-white/80">
                    {Object.entries(STATUS_STYLES).map(([s, st]) => (
                        <div key={s} className="flex items-center gap-1.5">
                            <span className={`inline-block w-3 h-3 rounded-sm ${st.bar}`} />
                            <span className="capitalize">{s}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-1.5 border-l border-white/20 pl-4">
                        <span className="inline-block w-3 h-3 rounded-sm bg-white/40" />
                        <span>Blocked (ext.)</span>
                    </div>
                    {onWalkInBook && (
                        <div className="flex items-center gap-1.5 border-l border-white/20 pl-4 text-white/70">
                            <Plus className="h-3 w-3" />
                            <span>Click empty cell to book walk-in</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Scrollable timeline */}
            <div className="overflow-x-auto" ref={scrollRef}>
                <div style={{ minWidth: SIDEBAR_W + totalDays * CELL_W }}>

                    {/* Header: day numbers */}
                    <div className="flex sticky top-0 z-20 border-b border-gray-200" style={{ background: '#fff' }}>
                        <div
                            className="flex-shrink-0 sticky left-0 z-30 border-r border-gray-200 flex items-center px-2"
                            style={{ width: SIDEBAR_W, height: 36, backgroundColor: DARK }}
                        >
                            <span className="text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider truncate">
                                {isMobile ? 'Unit' : 'Property / Unit'}
                            </span>
                        </div>
                        {days.map(day => {
                            const todayCell = isToday(day);
                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`flex-shrink-0 flex flex-col items-center justify-center border-r border-gray-100 font-medium
                                        ${todayCell ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500'}`}
                                    style={{ width: CELL_W, height: 36, fontSize: isMobile ? 9 : 11 }}
                                >
                                    <span className="leading-none">{format(day, 'EEE').charAt(0)}</span>
                                    <span className={`leading-none mt-0.5 font-bold ${todayCell ? 'text-emerald-700' : ''}`}
                                        style={todayCell ? undefined : { color: DARK }}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Property groups + rows */}
                    {groups.map(group => (
                        <div key={group.propertyId ?? '__standalone__'}>
                            {/* Property header */}
                            <div className="flex border-b border-gray-200" style={{ backgroundColor: `${DARK}12` }}>
                                <div
                                    className="flex-shrink-0 sticky left-0 z-10 border-r border-gray-200 flex items-center px-2 gap-1"
                                    style={{ width: SIDEBAR_W, height: 28, backgroundColor: `${DARK}12` }}
                                >
                                    <span className="font-bold truncate flex-1 min-w-0" style={{ color: DARK, fontSize: isMobile ? 9 : 11 }}>{group.propertyName}</span>
                                    <span className="text-gray-400 flex-shrink-0" style={{ fontSize: isMobile ? 9 : 11 }}>({group.apts.length})</span>
                                </div>
                                <div style={{ width: totalDays * CELL_W, height: 28, backgroundColor: `${DARK}08` }} />
                            </div>

                            {/* Apartment rows */}
                            {group.apts.map((apt, aptIdx) => {
                                const aptBookings = (bookingsByApt.get(apt.id) ?? []).filter(b =>
                                    b.status !== 'cancelled'
                                );
                                const aptBlocked = blockedByApt.get(apt.id) ?? [];

                                return (
                                    <div
                                        key={apt.id}
                                        className={`flex border-b border-gray-100 ${aptIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                                        style={{ height: ROW_H }}
                                    >
                                        {/* Apartment label */}
                                        <div
                                            className={`flex-shrink-0 sticky left-0 z-10 border-r border-gray-200 flex items-center px-2 gap-1.5
                                                ${aptIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                                            style={{ width: SIDEBAR_W }}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${apt.is_locked ? 'bg-red-400' : 'bg-emerald-400'}`} />
                                            <span className="truncate flex-1 min-w-0" style={{ color: DARK, fontSize: isMobile ? 9 : 11 }}>{apt.title}</span>
                                            {apt.is_locked && !isMobile && <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1 rounded ml-auto flex-shrink-0">LOCK</span>}
                                        </div>

                                        {/* Day cells + booking bars */}
                                        <div className="relative" style={{ width: totalDays * CELL_W }}>
                                            <div className="absolute inset-0 flex">
                                                {days.map(day => {
                                                    const isPast = isBefore(day, today);
                                                    const todayCell = isToday(day);
                                                    const permLocked = !!apt.is_locked;
                                                    const rangeLocked = aptBlocked.some(bd => {
                                                        const s = parseISO(bd.start_date);
                                                        const e = parseISO(bd.end_date);
                                                        return !isBefore(day, s) && isBefore(day, e);
                                                    });
                                                    // Only confirmed bookings actually hold a date — pending
                                                    // bookings are unpaid/unconfirmed and must not block a
                                                    // walk-in booking for the same date (they still render
                                                    // below so staff can see them).
                                                    const activeBooking = aptBookings.find(b => {
                                                        if (b.status !== 'confirmed') return false;
                                                        const s = parseISO(b.check_in);
                                                        const e = parseISO(b.check_out);
                                                        return !isBefore(day, s) && isBefore(day, e);
                                                    });
                                                    const isBooked = !!activeBooking;
                                                    const isLocked = permLocked || rangeLocked || isBooked;
                                                    const canBook = !isPast && !isLocked && !!onWalkInBook;
                                                    return (
                                                        <div
                                                            key={day.toISOString()}
                                                            onClick={() => {
                                                                if (canBook) {
                                                                    onWalkInBook!(apt, format(day, 'yyyy-MM-dd'));
                                                                }
                                                            }}
                                                            title={
                                                                isLocked
                                                                    ? permLocked
                                                                        ? `${apt.title} is locked`
                                                                        : activeBooking
                                                                            ? `Booked: ${activeBooking.name} (${format(parseISO(activeBooking.check_in), 'MMM d')} → ${format(parseISO(activeBooking.check_out), 'MMM d')})`
                                                                            : `Blocked on ${format(day, 'MMM d')}`
                                                                    : canBook
                                                                        ? `Walk-in booking on ${format(day, 'MMM d')}`
                                                                        : undefined
                                                            }
                                                            className={[
                                                                'flex-shrink-0 h-full border-r group relative',
                                                                todayCell && !isLocked ? 'bg-emerald-50/60 border-emerald-200' : 'border-gray-100',
                                                                isLocked ? 'cursor-not-allowed bg-red-50/40' : '',
                                                                canBook ? 'cursor-pointer hover:bg-blue-50/50' : '',
                                                            ].filter(Boolean).join(' ')}
                                                            style={{ width: CELL_W }}
                                                        >
                                                            {canBook && (
                                                                <Plus className="absolute inset-0 m-auto h-3 w-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Booking bars */}
                                            {aptBookings.map(booking => {
                                                const geo = barGeometry(booking);
                                                if (!geo) return null;
                                                const style = STATUS_STYLES[booking.status] ?? STATUS_STYLES.pending;
                                                const roundedL = !geo.clippedLeft ? 'rounded-l-full' : 'rounded-l-none';
                                                const roundedR = !geo.clippedRight ? 'rounded-r-full' : 'rounded-r-none';
                                                return (
                                                    <button
                                                        key={booking.booking_id}
                                                        onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}
                                                        className={`absolute flex items-center px-1.5 gap-1 hover:brightness-90 transition-all shadow-sm z-10 ${style.bar} ${style.text} ${roundedL} ${roundedR}`}
                                                        style={{
                                                            top:    4,
                                                            left:   geo.left + 1,
                                                            width:  geo.width,
                                                            height: ROW_H - 10,
                                                            borderLeft: geo.clippedLeft ? '3px dashed rgba(255,255,255,0.5)' : undefined,
                                                            fontSize: isMobile ? 8 : 11,
                                                        }}
                                                        title={`${booking.name} · ${booking.check_in} → ${booking.check_out}`}
                                                    >
                                                        <span className="font-medium truncate">{isMobile ? booking.name.split(' ')[0] : booking.name}</span>
                                                        {geo.width > (isMobile ? 50 : 80) && (
                                                            <span className="opacity-75 truncate ml-auto">
                                                                {booking.nights}n
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}

                                            {/* Blocked date bars (Airbnb / admin) */}
                                            {(blockedByApt.get(apt.id) ?? []).map(bd => {
                                                const geo = blockedBarGeometry(bd);
                                                if (!geo) return null;
                                                const isExternal = !!bd.external_calendar;
                                                const source = bd.external_calendar_details?.source_display ?? bd.notes ?? (isExternal ? 'iCal Block' : 'Blocked');
                                                // External (Airbnb etc): red stripes; Admin manual block: orange stripes
                                                const stripe1 = isExternal ? '#ef444455' : '#f9731655';
                                                const stripe2 = isExternal ? '#ef444422' : '#f9731622';
                                                const labelColor = isExternal ? '#991b1b' : '#9a3412';
                                                const bgColor = isExternal ? '#fee2e2' : '#ffedd5';
                                                const borderColor = isExternal ? '#fca5a5' : '#fdba74';
                                                return (
                                                    <div
                                                        key={bd.id}
                                                        className="absolute flex items-center px-1.5 gap-1 rounded z-10 pointer-events-none select-none overflow-hidden"
                                                        style={{
                                                            top: 4,
                                                            left: geo.left + 1,
                                                            width: geo.width,
                                                            height: ROW_H - 10,
                                                            backgroundColor: bgColor,
                                                            border: `1px solid ${borderColor}`,
                                                            backgroundImage: `repeating-linear-gradient(45deg, ${stripe1} 0, ${stripe1} 4px, ${stripe2} 4px, ${stripe2} 10px)`,
                                                        }}
                                                        title={`${source} · ${bd.start_date} → ${bd.end_date}${bd.notes ? ` · ${bd.notes}` : ''}`}
                                                    >
                                                        <span className="font-bold truncate" style={{ color: labelColor, fontSize: isMobile ? 8 : 10 }}>
                                                            {isMobile ? source : (isExternal ? '[iCal] ' : '[Block] ') + source}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {groups.length === 0 && (
                        <div className="flex items-center justify-center h-40 text-sm text-gray-400">
                            No apartments to display
                        </div>
                    )}
                </div>
            </div>

            {/* Booking detail panel */}
            {selectedBooking && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedBooking(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200" style={{ backgroundColor: DARK }}>
                            <div>
                                <h3 className="font-bold text-white">{selectedBooking.apartment_details?.title ?? 'Booking'}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize
                                        ${selectedBooking.status === 'confirmed' ? 'bg-emerald-400/30 text-emerald-100' :
                                          selectedBooking.status === 'pending'   ? 'bg-amber-400/30 text-amber-100' :
                                          selectedBooking.status === 'cancelled' ? 'bg-red-400/30 text-red-100' :
                                                                                   'bg-blue-400/30 text-blue-100'}`}>
                                        {selectedBooking.status}
                                    </span>
                                    {selectedBooking.is_walk_in && (
                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-400/30 text-purple-100">
                                            Walk-in
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setSelectedBooking(null)} className="p-1 hover:bg-white/10 rounded-full">
                                <X className="h-5 w-5 text-white/70" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Guest info */}
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium" style={{ color: DARK }}>{selectedBooking.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">{selectedBooking.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">{selectedBooking.phone}</span>
                                </div>
                                {selectedBooking.address && (
                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                        <span className="text-gray-600">{selectedBooking.address}</span>
                                    </div>
                                )}
                            </div>

                            {/* Walk-in specific info */}
                            {(selectedBooking.id_type || selectedBooking.purpose) && (
                                <div className="bg-purple-50 rounded-lg p-3 space-y-1.5">
                                    {selectedBooking.id_type && (
                                        <div className="text-sm">
                                            <span className="text-gray-500 text-xs">ID Type: </span>
                                            <span className="font-medium capitalize" style={{ color: DARK }}>
                                                {selectedBooking.id_type.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    )}
                                    {selectedBooking.purpose && (
                                        <div className="text-sm">
                                            <span className="text-gray-500 text-xs">Purpose: </span>
                                            <span className="text-gray-700">{selectedBooking.purpose}</span>
                                        </div>
                                    )}
                                    {selectedBooking.id_document_url && (
                                        <a
                                            href={selectedBooking.id_document_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-purple-700 font-medium hover:underline mt-1"
                                        >
                                            View ID Document ↗
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Property */}
                            {selectedBooking.apartment_details?.property_details && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>{selectedBooking.apartment_details.property_details.name}</span>
                                </div>
                            )}

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-emerald-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Check-in</p>
                                    <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: DARK }}>
                                        <CalendarIcon className="h-3.5 w-3.5 text-emerald-500" />
                                        {format(parseISO(selectedBooking.check_in), 'MMM d, yyyy')}
                                    </div>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Check-out</p>
                                    <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: DARK }}>
                                        <CalendarIcon className="h-3.5 w-3.5 text-blue-500" />
                                        {format(parseISO(selectedBooking.check_out), 'MMM d, yyyy')}
                                    </div>
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <DollarSign className="h-4 w-4 text-emerald-600" />
                                    <span>{selectedBooking.nights} nights · {selectedBooking.guests} guests</span>
                                </div>
                                <span className="text-lg font-bold text-emerald-600">
                                    {selectedBooking.currency}{parseFloat(selectedBooking.total_amount).toLocaleString()}
                                </span>
                            </div>

                            {selectedBooking.special_requests && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Special Requests</p>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                                        {selectedBooking.special_requests}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Primary actions: View More / Edit / Cancel */}
                        <div className="p-4 border-t border-gray-200 space-y-2">
                            {onViewMore && (
                                <button
                                    onClick={() => { onViewMore(selectedBooking); setSelectedBooking(null); }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                                >
                                    <Eye className="h-4 w-4" />
                                    View More / Payment
                                </button>
                            )}
                            <div className="flex gap-2">
                                {onEditBooking && (
                                    <button
                                        onClick={() => { onEditBooking(selectedBooking); setSelectedBooking(null); }}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
                                        style={{ color: DARK }}
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Edit Booking
                                    </button>
                                )}
                                {onCancelBooking && selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                                    <button
                                        onClick={() => { onCancelBooking(selectedBooking); setSelectedBooking(null); }}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors"
                                    >
                                        <Ban className="h-4 w-4" />
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Status change + Dispute + Receipt */}
                        {onStatusChange && (
                            <div className="px-4 pb-2">
                                <p className="text-xs text-gray-400 mb-2">Change status:</p>
                                <div className="flex flex-wrap gap-2">
                                    {(['confirmed', 'completed'] as const).map(s => (
                                        <button
                                            key={s}
                                            disabled={selectedBooking.status === s}
                                            onClick={() => { onStatusChange(selectedBooking.booking_id, s); setSelectedBooking(null); }}
                                            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                                                ${s === 'confirmed' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' :
                                                                      'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                                        >
                                            Mark {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="px-4 pb-4 flex gap-2">
                            {onPrintReceipt && (
                                <button
                                    onClick={() => { onPrintReceipt(selectedBooking); setSelectedBooking(null); }}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                    style={{ color: DARK }}
                                >
                                    <Receipt className="h-4 w-4" />
                                    Receipt
                                </button>
                            )}
                            {onRaiseDispute && (
                                <button
                                    onClick={() => { onRaiseDispute(selectedBooking); setSelectedBooking(null); }}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors"
                                >
                                    <AlertTriangle className="h-4 w-4" />
                                    Raise Dispute
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
