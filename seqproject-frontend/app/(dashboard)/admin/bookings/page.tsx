'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Search,
  Filter,
  MapPin,
  User,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  LayoutGrid,
  List
} from 'lucide-react';
import AdminBookingModal from '@/components/admin/AdminBookingModal';
import CancellationModal from '@/components/admin/bookings/CancellationModal';
import BookingsCalendar from '@/components/admin/BookingsCalendar';
import { useGetBookingsQuery, useUpdateBookingStatusMutation } from '@/lib/store/api/adminApi';
import { toast } from 'sonner';

type ViewMode = 'calendar' | 'list';

export default function BookingsManagement() {
  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Load view preference from localStorage on mount
  useEffect(() => {
    const savedView = localStorage.getItem('bookingsViewMode') as ViewMode;
    if (savedView === 'calendar' || savedView === 'list') {
      setViewMode(savedView);
    }
  }, []);

  // Save view preference to localStorage when changed
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('bookingsViewMode', mode);
  };

  // RTK Query hooks
  const { data: bookingsData, isLoading, error, refetch } = useGetBookingsQuery({ page_size: 100 });
  const [updateBookingStatus] = useUpdateBookingStatusMutation();

  const bookings = bookingsData?.results || [];

  const handleStatusUpdate = async (
    bookingId: string,
    newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ) => {
    try {
      await updateBookingStatus({ bookingId, status: newStatus }).unwrap();
      toast.success(`Booking ${newStatus} successfully`);
    } catch (error) {
      console.error('Failed to update booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Bookings refreshed');
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.apartment_details.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">View and manage all property bookings</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Calendar
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <List className="h-4 w-4" />
              List
            </button>
          </div>

          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Booking
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error loading bookings</p>
          <p className="text-sm">{'message' in error ? (error as any).message : 'Something went wrong'}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      ) : viewMode === 'calendar' ? (
        /* Calendar View */
        <BookingsCalendar
          bookings={filteredBookings}
          onStatusChange={handleStatusUpdate}
        />
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-xl text-gray-600 mb-2">No bookings found</p>
          <p className="text-gray-500">Bookings will appear here once customers make reservations</p>
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.booking_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Property & Customer Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {booking.apartment_details.title}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        {booking.apartment_details.location}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)} flex items-center gap-1`}>
                        {getStatusIcon(booking.status)}
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadge(booking.payment_status)} flex items-center gap-1`}>
                        {getStatusIcon(booking.payment_status)}
                        {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{booking.name}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">{booking.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">{booking.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="border-l border-gray-200 pl-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Check-in</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(booking.check_in).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Check-out</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(booking.check_out).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                      <p className="text-xl font-bold text-emerald-600">
                        {booking.currency}{parseFloat(booking.total_amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.nights} nights • {booking.guests} guests
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusUpdate(booking.booking_id, 'confirmed')}
                  disabled={booking.status === 'confirmed'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${booking.status === 'confirmed'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                >
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  Confirm
                </button>
                <button
                  onClick={() => handleStatusUpdate(booking.booking_id, 'completed')}
                  disabled={booking.status === 'completed' || booking.status === 'cancelled'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${booking.status === 'completed' || booking.status === 'cancelled'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  Complete
                </button>
                <button
                  onClick={() => handleStatusUpdate(booking.booking_id, 'cancelled')}
                  disabled={booking.status === 'cancelled' || booking.status === 'completed'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${booking.status === 'cancelled' || booking.status === 'completed'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                >
                  <XCircle className="h-4 w-4 inline mr-1" />
                  Cancel
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Admin Booking Modal */}
      <AdminBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          refetch();
          setIsBookingModalOpen(false);
        }}
      />

      {/* Cancellation Modal */}
      {selectedBookingId && (
        <CancellationModal
          isOpen={isCancellationModalOpen}
          onClose={() => {
            setIsCancellationModalOpen(false);
            setSelectedBookingId(null);
          }}
          bookingId={selectedBookingId}
          onSuccess={() => {
            refetch();
            toast.success('Booking cancelled');
          }}
        />
      )}
    </div>
  );
}
