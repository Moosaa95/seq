import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { X, AlertCircle, CreditCard } from 'lucide-react';
import { useAppDispatch } from '@/lib/store/hooks';
import { useCreateBookingMutation } from '@/lib/store/api/bookingApi';
import { useInitializePaymentMutation, useGetPaystackConfigQuery } from '@/lib/store/api/paymentApi';
import { usePaystack } from '@/lib/hooks/usePaystack';
import DatePicker from '@/components/DatePicker';
import { useGetBookedDatesQuery } from '@/lib/store/api/propertyApi';
import { eachDayOfInterval, parseISO, format } from 'date-fns';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle: string;
  propertyId: string;
}

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export default function BookingModal({ isOpen, onClose, propertyTitle, propertyId }: BookingModalProps) {
  const router = useRouter();
  const dispatch = useAppDispatch(); // Keeping for cleanup if slices are still around

  // RTK Query Hooks
  const { data: paystackConfigData } = useGetPaystackConfigQuery();
  const { data: bookedRanges } = useGetBookedDatesQuery(propertyId, { skip: !isOpen });
  const [createBooking, { isLoading: bookingLoading, isSuccess: bookingSuccess, data: bookingResponse, error: bookingErrorObj }] = useCreateBookingMutation();
  const [initializePayment, { data: paymentResponse, isSuccess: paymentSuccess }] = useInitializePaymentMutation();

  const [authorizationUrl, setAuthorizationUrl] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
  });

  const { isLoaded: paystackLoaded, initializePayment: initPaystackPopup } = usePaystack();

  const paystackConfig = paystackConfigData ? { publicKey: paystackConfigData.public_key } : null;
  const currentBooking = bookingResponse?.booking;
  const error = bookingErrorObj ? (('data' in (bookingErrorObj as any) ? (bookingErrorObj as any).data.message || 'Booking failed' : 'Booking failed')) : null;
  const loading = bookingLoading;
  const success = bookingSuccess;

  // Calculate excluded dates
  const excludeDates: string[] = [];
  if (bookedRanges) {
    bookedRanges.forEach(range => {
      try {
        const start = parseISO(range.start);
        const end = parseISO(range.end);
        const days = eachDayOfInterval({ start, end });
        days.forEach(day => excludeDates.push(format(day, 'yyyy-MM-dd')));
      } catch (e) {
        console.error("Invalid date range", range);
      }
    });
  }

  // Handle successful booking - Initialize payment
  useEffect(() => {
    if (bookingSuccess && currentBooking && !paymentSuccess) {
      // Initialize payment with Paystack
      initializePayment({
        booking_id: currentBooking.booking_id,
        metadata: {
          property_title: propertyTitle,
          customer_name: formData.name,
        },
      });
    }
  }, [bookingSuccess, currentBooking, paymentSuccess, initializePayment, propertyTitle, formData.name]);

  // Handle payment initialization success
  useEffect(() => {
    if (paymentSuccess && paymentResponse) {
      setAuthorizationUrl(paymentResponse.authorization_url);
      setReference(paymentResponse.reference);
    }
  }, [paymentSuccess, paymentResponse]);

  // When payment is initialized, open Paystack popup
  useEffect(() => {
    if (authorizationUrl && reference && currentBooking && paystackConfig && paystackLoaded) {
      // Convert amount to kobo (multiply by 100)
      const amountInKobo = Math.round(parseFloat(currentBooking.total_amount) * 100);

      initPaystackPopup({
        publicKey: paystackConfig.publicKey,
        email: formData.email,
        amount: amountInKobo,
        currency: currentBooking.currency === '₦' ? 'NGN' : 'USD',
        ref: reference,
        metadata: {
          booking_id: currentBooking.booking_id,
          property_title: propertyTitle,
          customer_name: formData.name,
        },
        onSuccess: (response: any) => {
          // Redirect to verification page
          router.push(`/payment/verify?reference=${response.reference}`);
          // Clean up
          handleCleanup();
        },
        onClose: () => {
          // User closed payment modal without paying
          console.log('Payment cancelled by user');
        },
      });
    }
  }, [authorizationUrl, reference, currentBooking, paystackConfig, paystackLoaded, formData.email, formData.name, propertyTitle, initPaystackPopup, router]);

  const handleCleanup = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      checkIn: '',
      checkOut: '',
      guests: 1,
    });
    setAuthorizationUrl(null);
    setReference(null);
    // dispatch(clearBooking()); // Optional now
    // dispatch(clearPaymentState()); // Optional now
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createBooking({
        apartment_id: propertyId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        check_in: formData.checkIn,
        check_out: formData.checkOut,
        guests: formData.guests,
      }).unwrap();
    } catch (err) {
      console.error("Booking creation failed", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleDateChange = (field: 'checkIn' | 'checkOut', date: string) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto border border-gray-200"
            >
              {/* Header - Cleaner */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Request to book</h2>
                  <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">{propertyTitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Form - Cleaner spacing */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-900">Booking Error</h3>
                      <p className="text-sm text-red-700 mt-1 whitespace-pre-line">{error}</p>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {success && currentBooking && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-blue-900">Booking Created - Processing Payment</h3>
                      <p className="text-sm text-blue-700 mt-1 whitespace-pre-line">
                        Booking ID: {currentBooking.booking_id}{'\n'}
                        Total Amount: {currentBooking.currency}{parseFloat(currentBooking.total_amount).toLocaleString()}{'\n'}
                        Nights: {currentBooking.nights}{'\n\n'}
                        {authorizationUrl ? 'Opening payment window...' : 'Initializing payment...'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Full name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                {/* Email and Phone - Side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+234 800 000 0000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Dates - Using Custom DatePicker */}
                <div className="border border-gray-300 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <DatePicker
                        label="CHECK-IN"
                        placeholder="Select Date"
                        selectedDate={formData.checkIn}
                        onChange={(date) => handleDateChange('checkIn', date)}
                        minDate={today}
                        excludeDates={excludeDates}
                        required
                      />
                    </div>
                    <div className="border-l border-gray-300 pl-4">
                      <DatePicker
                        label="CHECK-OUT"
                        placeholder="Select Date"
                        selectedDate={formData.checkOut}
                        onChange={(date) => handleDateChange('checkOut', date)}
                        minDate={formData.checkIn || today}
                        excludeDates={excludeDates}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Guests */}
                <div className="border border-gray-300 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900">
                        Guests
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">Maximum 10 guests</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, guests: Math.max(1, prev.guests - 1) }))}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer"
                      >
                        <span className="text-gray-600 font-medium">−</span>
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-900">{formData.guests}</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, guests: Math.min(10, prev.guests + 1) }))}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer"
                      >
                        <span className="text-gray-600 font-medium">+</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Buttons - Sticky footer */}
                <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 -mx-6 px-6 -mb-6 pb-6 mt-6">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || success}
                      className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors font-semibold shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating Booking...' : success ? 'Processing Payment...' : 'Book & Pay'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
