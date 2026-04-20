'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  DollarSign,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useGetPaymentQuery } from '@/lib/store/api/adminApi';

export default function TransactionDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    data: transaction,
    isLoading: loading,
    error
  } = useGetPaymentQuery(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-semibold">Transaction not found</p>
          <p className="text-sm">
            {error && 'status' in error ? `Error: ${(error as any).status}` : "The transaction you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'successful':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-600" />;
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-600" />;
      default:
        return <RefreshCw className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Transaction Details</h1>
          <p className="text-gray-600 mt-1">Payment ID: {transaction.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Payment Status</h2>
              {getStatusIcon(transaction.status)}
            </div>

            <div className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(transaction.status)}`}>
              <div>
                <p className="text-sm font-medium mb-1">Current Status</p>
                <p className="text-2xl font-bold capitalize">{transaction.status}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium mb-1">Amount</p>
                <p className="text-2xl font-bold">₦{parseFloat(transaction.amount).toLocaleString()}</p>
              </div>
            </div>

            {transaction.status === 'failed' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-800 mb-1">Payment Failed</p>
                <p className="text-sm text-red-700">
                  This payment was not successful. The customer may need to retry the transaction.
                </p>
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Payment Reference</p>
                  <p className="font-semibold text-gray-900 break-all">{transaction.transaction_reference}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Currency</p>
                  <p className="font-semibold text-gray-900">{transaction.currency}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Transaction Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(transaction.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(transaction.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          {transaction.booking_details && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Related Booking</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Guest Name</p>
                    <p className="font-semibold text-gray-900">{transaction.booking_details.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{transaction.booking_details.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-900">{transaction.booking_details.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Check-in / Check-out</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(transaction.booking_details.check_in).toLocaleDateString()} - {new Date(transaction.booking_details.check_out).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => router.push(`/admin/bookings/${transaction.booking}`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Building2 className="h-4 w-4" />
                View Booking
              </button>
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                Print Receipt
              </button>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">₦{parseFloat(transaction.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Payment Fee</span>
                <span className="font-semibold text-gray-900">₦0.00</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-emerald-600">₦{parseFloat(transaction.amount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Info</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Payment Gateway</p>
                <p className="font-semibold text-gray-900">Paystack</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Transaction ID</p>
                <p className="font-mono text-xs break-all text-gray-900">{transaction.id}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Booking ID</p>
                <p className="font-mono text-xs break-all text-gray-900">{transaction.booking}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
