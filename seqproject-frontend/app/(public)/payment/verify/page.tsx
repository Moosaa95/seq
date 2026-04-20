'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useVerifyPaymentQuery } from '@/lib/store/api/paymentApi';

function PaymentLoading() {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-16 w-16 animate-spin text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h2>
        <p className="text-gray-600">Please wait while we confirm your payment</p>
      </div>
    </div>
  );
}

function PaymentVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  const { data: verifiedPayment, isLoading: loading, error: apiError } = useVerifyPaymentQuery(reference || '', {
    skip: !reference,
  });

  const error = apiError ? (('data' in (apiError as any) ? (apiError as any).data.message || 'Payment verification failed' : 'Payment verification failed')) : null;

  // Validate reference and redirect if missing
  useEffect(() => {
    if (!reference) {
      router.push('/');
    }
  }, [reference, router]);

  if (loading) {
    return <PaymentLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <XCircle className="h-20 w-20 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/properties')}
              className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Browse Properties
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (verifiedPayment?.success) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your booking has been confirmed and payment received.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-semibold text-gray-900">{verifiedPayment.booking_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-semibold text-gray-900">{verifiedPayment.payment_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold text-gray-900">
                  {verifiedPayment.currency} {verifiedPayment.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-green-600 capitalize">{verifiedPayment.status}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              A confirmation email with your booking details has been sent to your email address.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/properties')}
              className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Browse More Properties
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentVerifyContent />
    </Suspense>
  );
}
