'use client';

import { useMemo, useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { X, User, Mail, Phone, MapPin, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup date-fns localizer
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
    getDay,
    locales,
});

// Types
interface BookingEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: {
        booking_id: string;
        name: string;
        email: string;
        phone: string;
        apartment_title: string;
        apartment_location: string;
        status: string;
        payment_status: string;
        total_amount: string;
        currency: string;
        guests: number;
        nights: number;
        occupancy_status?: string;
        checked_in_at?: string;
        checked_out_at?: string;
        special_requests?: string;
    };
}

interface ApiBooking {
    booking_id: string;
    apartment_details: {
        title: string;
        location: string;
    };
    name: string;
    email: string;
    phone: string;
    check_in: string;
    check_out: string;
    guests: number;
    nights: number;
    total_amount: string;
    currency: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    payment_status: string;
    occupancy_status?: string;
    checked_in_at?: string;
    checked_out_at?: string;
    special_requests?: string;
}

interface BookingsCalendarProps {
    bookings: ApiBooking[];
    onSelectBooking?: (bookingId: string) => void;
    onStatusChange?: (bookingId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') => void;
}

// Status colors
const statusColors: Record<string, { bg: string; border: string; text: string }> = {
    pending: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
    confirmed: { bg: '#D1FAE5', border: '#10B981', text: '#065F46' },
    cancelled: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },
    completed: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF' },
};

export default function BookingsCalendar({ bookings, onSelectBooking, onStatusChange }: BookingsCalendarProps) {
    const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [currentView, setCurrentView] = useState<View>('month');
    const [currentDate, setCurrentDate] = useState(new Date());

    // Convert bookings to calendar events
    const events: BookingEvent[] = useMemo(() => {
        return bookings.map((booking) => {
            const checkIn = new Date(booking.check_in);
            const checkOut = new Date(booking.check_out);

            return {
                id: booking.booking_id,
                title: `${booking.name} - ${booking.apartment_details.title}`,
                start: checkIn,
                end: checkOut,
                resource: {
                    booking_id: booking.booking_id,
                    name: booking.name,
                    email: booking.email,
                    phone: booking.phone,
                    apartment_title: booking.apartment_details.title,
                    apartment_location: booking.apartment_details.location,
                    status: booking.status,
                    payment_status: booking.payment_status,
                    total_amount: booking.total_amount,
                    currency: booking.currency,
                    guests: booking.guests,
                    nights: booking.nights,
                    occupancy_status: booking.occupancy_status,
                    checked_in_at: booking.checked_in_at,
                    checked_out_at: booking.checked_out_at,
                    special_requests: booking.special_requests,
                },
            };
        });
    }, [bookings]);

    // Event style getter - color code by status
    const eventStyleGetter = useCallback((event: BookingEvent) => {
        const colors = statusColors[event.resource.status] || statusColors.pending;
        return {
            style: {
                backgroundColor: colors.bg,
                borderLeft: `4px solid ${colors.border}`,
                color: colors.text,
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '12px',
                fontWeight: '500',
            },
        };
    }, []);

    // Handle event selection
    const handleSelectEvent = useCallback((event: BookingEvent) => {
        setSelectedEvent(event);
        setShowModal(true);
        onSelectBooking?.(event.id);
    }, [onSelectBooking]);

    // Handle status change from modal
    const handleStatusChange = useCallback((status: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
        if (selectedEvent && onStatusChange) {
            onStatusChange(selectedEvent.id, status);
            setShowModal(false);
        }
    }, [selectedEvent, onStatusChange]);

    // Status badge component
    const StatusBadge = ({ status }: { status: string }) => {
        const colors = statusColors[status] || statusColors.pending;
        return (
            <span
                className="px-2 py-1 rounded-full text-xs font-semibold capitalize"
                style={{ backgroundColor: colors.bg, color: colors.text }}
            >
                {status}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-gray-200">
                <span className="text-sm text-gray-600 font-medium">Status:</span>
                {Object.entries(statusColors).map(([status, colors]) => (
                    <div key={status} className="flex items-center gap-1.5">
                        <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: colors.bg, border: `2px solid ${colors.border}` }}
                        />
                        <span className="text-xs text-gray-600 capitalize">{status}</span>
                    </div>
                ))}
            </div>

            {/* Calendar */}
            <div style={{ height: 650 }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    view={currentView}
                    onView={setCurrentView}
                    date={currentDate}
                    onNavigate={setCurrentDate}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={handleSelectEvent}
                    views={['month', 'week', 'day', 'agenda']}
                    popup
                    selectable={false}
                    style={{ height: '100%' }}
                />
            </div>

            {/* Booking Details Modal */}
            {showModal && selectedEvent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Booking Details</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 space-y-4">
                            {/* Property */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    {selectedEvent.resource.apartment_title}
                                </h3>
                                <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {selectedEvent.resource.apartment_location}
                                </div>
                            </div>

                            {/* Status & Payment */}
                            <div className="flex gap-2">
                                <StatusBadge status={selectedEvent.resource.status} />
                                <StatusBadge status={selectedEvent.resource.payment_status} />
                                {selectedEvent.resource.occupancy_status && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${selectedEvent.resource.occupancy_status === 'occupied' ? 'bg-purple-100 text-purple-800' :
                                        selectedEvent.resource.occupancy_status === 'departed' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {selectedEvent.resource.occupancy_status}
                                    </span>
                                )}
                            </div>

                            {/* Guest Info */}
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                <div className="flex items-center text-sm">
                                    <User className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="font-medium text-gray-900">{selectedEvent.resource.name}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-600">{selectedEvent.resource.email}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-600">{selectedEvent.resource.phone}</span>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Check-in</p>
                                    <div className="flex items-center text-sm font-medium text-gray-900">
                                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                                        {format(selectedEvent.start, 'MMM d, yyyy')}
                                    </div>
                                    {selectedEvent.resource.checked_in_at && (
                                        <p className="text-xs text-green-600 mt-1">
                                            Arrived: {format(new Date(selectedEvent.resource.checked_in_at), 'h:mm a')}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Check-out</p>
                                    <div className="flex items-center text-sm font-medium text-gray-900">
                                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                                        {format(selectedEvent.end, 'MMM d, yyyy')}
                                    </div>
                                    {selectedEvent.resource.checked_out_at && (
                                        <p className="text-xs text-blue-600 mt-1">
                                            Departed: {format(new Date(selectedEvent.resource.checked_out_at), 'h:mm a')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="bg-emerald-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <DollarSign className="h-4 w-4 text-emerald-600 mr-1" />
                                        Total Amount
                                    </div>
                                    <span className="text-xl font-bold text-emerald-600">
                                        {selectedEvent.resource.currency}
                                        {parseFloat(selectedEvent.resource.total_amount).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {selectedEvent.resource.nights} nights • {selectedEvent.resource.guests} guests
                                </p>
                            </div>

                            {/* Special Requests */}
                            {selectedEvent.resource.special_requests && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Special Requests</p>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                        {selectedEvent.resource.special_requests}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer - Actions */}
                        {onStatusChange && (
                            <div className="p-4 border-t border-gray-200 space-y-2">
                                <p className="text-xs text-gray-500 mb-2">Update Status:</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleStatusChange('confirmed')}
                                        disabled={selectedEvent.resource.status === 'confirmed'}
                                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange('completed')}
                                        disabled={selectedEvent.resource.status === 'completed' || selectedEvent.resource.status === 'cancelled'}
                                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Complete
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange('cancelled')}
                                        disabled={selectedEvent.resource.status === 'cancelled' || selectedEvent.resource.status === 'completed'}
                                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Custom styles for react-big-calendar */}
            <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 8px;
          font-weight: 600;
          color: #374151;
          background: #F9FAFB;
          border-bottom: 1px solid #E5E7EB;
        }
        .rbc-today {
          background-color: #ECFDF5;
        }
        .rbc-off-range-bg {
          background-color: #F9FAFB;
        }
        .rbc-event {
          border: none !important;
          outline: none !important;
        }
        .rbc-event:focus {
          outline: 2px solid #10B981 !important;
          outline-offset: 2px;
        }
        .rbc-toolbar button {
          color: #374151;
          border: 1px solid #E5E7EB;
          background: white;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 6px;
        }
        .rbc-toolbar button:hover {
          background: #F3F4F6;
          border-color: #D1D5DB;
        }
        .rbc-toolbar button.rbc-active {
          background: #10B981;
          color: white;
          border-color: #10B981;
        }
        .rbc-btn-group button + button {
          margin-left: -1px;
        }
        .rbc-btn-group button:first-child {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
        .rbc-btn-group button:last-child {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
        .rbc-btn-group button:not(:first-child):not(:last-child) {
          border-radius: 0;
        }
        .rbc-toolbar-label {
          font-weight: 600;
          font-size: 1.1rem;
          color: #1F2937;
        }
        .rbc-month-view, .rbc-time-view {
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          overflow: hidden;
        }
        .rbc-agenda-view table.rbc-agenda-table {
          border: 1px solid #E5E7EB;
          border-radius: 8px;
        }
        .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
          background: #F9FAFB;
          color: #374151;
          font-weight: 600;
        }
      `}</style>
        </div>
    );
}
