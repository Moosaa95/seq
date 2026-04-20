'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  RefreshCw,
  Building2
} from 'lucide-react';
import { useGetBookingsQuery } from '@/lib/store/api/adminApi';

interface Customer {
  email: string;
  name: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  lastBooking: string;
  bookings: string[];
}

export default function CustomersPage() {
  const { data: bookingsData, isLoading: loading, error: apiError, refetch } = useGetBookingsQuery({ page_size: 100 });
  const bookings = bookingsData?.results || [];
  const error = apiError ? (('data' in (apiError as any) ? (apiError as any).data.message || 'Failed to fetch customers' : 'Failed to fetch customers')) : null;
  const [searchTerm, setSearchTerm] = useState('');

  const handleRefresh = () => {
    refetch();
  };

  // Extract unique customers from bookings
  const customers: Customer[] = Object.values(
    bookings.reduce((acc, booking) => {
      const email = booking.email;
      if (!acc[email]) {
        acc[email] = {
          email: booking.email,
          name: booking.name,
          phone: booking.phone,
          totalBookings: 0,
          totalSpent: 0,
          lastBooking: booking.created_at,
          bookings: [],
        };
      }
      acc[email].totalBookings += 1;
      acc[email].totalSpent += parseFloat(booking.total_amount);
      acc[email].bookings.push(booking.booking_id);

      // Update last booking if this one is more recent
      if (new Date(booking.created_at) > new Date(acc[email].lastBooking)) {
        acc[email].lastBooking = booking.created_at;
      }

      return acc;
    }, {} as Record<string, Customer>)
  );

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Calculate stats
  const stats = {
    totalCustomers: customers.length,
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, b) => sum + parseFloat(b.total_amount), 0),
    averageBookings: customers.length > 0 ? (bookings.length / customers.length).toFixed(1) : '0',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">View and manage customer information</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error loading customers</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Customers</p>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Bookings</p>
            <Calendar className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <CreditCard className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-900">
            ₦{stats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Avg Bookings/Customer</p>
            <Building2 className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.averageBookings}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Customers List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-xl text-gray-600 mb-2">No customers found</p>
          <p className="text-gray-500">Customers will appear here once bookings are made</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.email}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{customer.name}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <a
                            href={`mailto:${customer.email}`}
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            {customer.email}
                          </a>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <a
                            href={`tel:${customer.phone}`}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            {customer.phone}
                          </a>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          Last booking: {new Date(customer.lastBooking).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="border-l border-gray-200 pl-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">{customer.totalBookings}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Spent</p>
                      <p className="text-xl font-bold text-emerald-600">
                        ₦{customer.totalSpent.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Average per Booking</p>
                      <p className="text-sm font-semibold text-gray-900">
                        ₦{(customer.totalSpent / customer.totalBookings).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                <a
                  href={`mailto:${customer.email}`}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1"
                >
                  <Mail className="h-4 w-4" />
                  Send Email
                </a>
                <button
                  onClick={() => console.log('Customer bookings:', customer.bookings)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  View Bookings ({customer.totalBookings})
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
