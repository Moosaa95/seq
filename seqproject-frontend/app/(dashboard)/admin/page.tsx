'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  Calendar,
  CreditCard,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { useGetBookingsQuery, useGetPaymentsQuery } from '@/lib/store/api/adminApi';
import { useGetPropertiesQuery, useGetApartmentsQuery } from '@/lib/store/api/propertyApi';
import ImageWithLoader from '@/components/ImageWithLoader';

export default function AdminDashboard() {
  // Use RTK Query hooks
  const { data: buildingsData } = useGetPropertiesQuery({});
  const { data: apartmentsData } = useGetApartmentsQuery({});
  const { data: bookingsData } = useGetBookingsQuery({ page_size: 100 });
  const { data: paymentsData } = useGetPaymentsQuery({ page_size: 100 });

  const buildings = buildingsData?.results || [];
  const apartments = apartmentsData?.results || [];
  const bookings = bookingsData?.results || [];
  const payments = paymentsData?.results || [];

  // Calculate real stats from API data
  const activeBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  ).length;

  const successfulPayments = payments.filter((p) => p.status === 'successful');
  const totalRevenue = successfulPayments.reduce(
    (sum, payment) => sum + parseFloat(payment.amount),
    0
  );

  const pendingPayments = payments.filter((p) => p.status === 'pending').length;
  const failedPayments = payments.filter((p) => p.status === 'failed').length;

  const stats = [
    {
      title: 'Total Buildings',
      value: buildings.length,
      icon: Building2,
      color: 'bg-indigo-500',
      change: '+2',
      href: '/admin/properties' // Should ideally be /admin/buildings later
    },
    {
      title: 'Total Units',
      value: apartments.length,
      icon: Building2,
      color: 'bg-blue-500',
      change: '+12%',
      href: '/admin/properties'
    },
    {
      title: 'Active Bookings',
      value: activeBookings,
      icon: Calendar,
      color: 'bg-green-500',
      change: '+8%',
      href: '/admin/bookings'
    },
    {
      title: 'Total Revenue',
      value: totalRevenue > 0
        ? `₦${(totalRevenue / 1000000).toFixed(1)}M`
        : '₦0',
      icon: TrendingUp,
      color: 'bg-emerald-500',
      change: '+23%',
      href: '/admin/transactions'
    },
    {
      title: 'Pending Payments',
      value: pendingPayments,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '-3%',
      href: '/admin/transactions'
    },
  ];

  const transactionStats = [
    { label: 'Successful', value: successfulPayments.length, color: 'text-green-600', icon: CheckCircle },
    { label: 'Failed', value: failedPayments, color: 'text-red-600', icon: XCircle },
    { label: 'Pending', value: pendingPayments, color: 'text-yellow-600', icon: Clock },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, index) => (
          <Link key={index} href={stat.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all cursor-pointer border border-gray-100 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Transaction Summary</h2>
            <Link href="/admin/transactions" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1">
              View All <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {transactionStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="font-medium text-gray-700">{stat.label}</span>
                </div>
                <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/admin/properties">
              <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left group">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Manage Properties</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </Link>
            <Link href="/admin/bookings">
              <button className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left group">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">View Bookings</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-green-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </Link>
            <Link href="/admin/transactions">
              <button className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors text-left group">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-emerald-900">Track Transactions</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Recent Properties */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Units</h2>
          <Link href="/admin/properties" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1">
            View All <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        {apartments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No units yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apartments.slice(0, 3).map((apartment) => (
              <Link key={apartment.id} href={`/admin/properties/${apartment.id}`}>
                <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="relative h-40 bg-gray-100">
                    {apartment.images?.[0] && (
                      <div className="relative w-full h-full">
                        <ImageWithLoader
                          src={typeof apartment.images[0] === 'string' ? apartment.images[0] : (apartment.images[0] as any).image}
                          alt={apartment.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">{apartment.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{apartment.property_details?.name || 'No Building'}</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {apartment.currency}{apartment.price.toLocaleString()}
                      {apartment.status === 'rent' && <span className="text-sm text-gray-500 font-normal">/night</span>}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
