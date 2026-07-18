'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, AlertCircle, Search, ChevronLeft, ChevronRight,
  Upload, User, MapPin, FileText, Tag, UserCheck, CheckCircle2,
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  addMonths, subMonths, isSameDay, isBefore, isAfter,
  isToday, getDay, parseISO, startOfDay, differenceInDays,
} from 'date-fns';
import { useGetApartmentsQuery } from '@/lib/store/api/propertyApi';
import { useCreateBookingMutation, useUpdateBookingMutation, useSearchGuestProfilesQuery } from '@/lib/store/api/adminApi';
import type { ApiApartment } from '@/lib/store/api/propertyApi';
import type { ApiBooking } from '@/lib/store/api/adminApi';
import type { BlockedDate } from '@/lib/store/api/calendarApi';
import BookingPaymentLedger from '@/components/admin/BookingPaymentLedger';

interface AdminBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** Pre-filled from calendar cell click */
  initialApartment?: ApiApartment;
  initialCheckIn?: string;
  /** When provided, modal operates in edit mode */
  bookingToEdit?: ApiBooking;
  bookings?: ApiBooking[];
  blockedDates?: BlockedDate[];
}

interface BookingFormData {
  apartment_id: string;
  name: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  special_requests: string;
  address: string;
  id_type: string;
  id_document: File | null;
  purpose: string;
}

const ID_TYPES = [
  { value: 'national_id', label: 'National Identity Card (NIN)' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'international_passport', label: 'International Passport' },
  { value: 'voters_card', label: "Voter's Card" },
  { value: 'other', label: 'Other' },
];

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function CalendarPicker({
  checkIn,
  checkOut,
  onSelect,
  selectedApartmentId,
  bookings = [],
  blockedDates = [],
  editingBookingId,
}: {
  checkIn: string;
  checkOut: string;
  onSelect: (checkIn: string, checkOut: string) => void;
  selectedApartmentId?: string;
  bookings?: ApiBooking[];
  blockedDates?: BlockedDate[];
  editingBookingId?: string;
}) {
  const [month, setMonth] = useState(() => (checkIn ? parseISO(checkIn) : new Date()));
  const [selecting, setSelecting] = useState<'checkIn' | 'checkOut'>(
    checkIn ? 'checkOut' : 'checkIn'
  );
  const [hovered, setHovered] = useState<Date | null>(null);
  const prevCheckIn = useRef(checkIn);

  // When checkIn is set from outside (pre-fill), jump to that month and switch to checkout mode
  useEffect(() => {
    if (checkIn && checkIn !== prevCheckIn.current) {
      setMonth(parseISO(checkIn));
      setSelecting('checkOut');
    }
    prevCheckIn.current = checkIn;
  }, [checkIn]);

  const today = startOfDay(new Date());
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const startPad = getDay(startOfMonth(month));

  const checkInDate = checkIn ? parseISO(checkIn) : null;
  const checkOutDate = checkOut ? parseISO(checkOut) : null;

  const isBlockedDay = (day: Date) => {
    if (!selectedApartmentId) return false;
    
    // Check bookings overlap — only confirmed bookings actually hold a date;
    // pending bookings are unpaid/unconfirmed and must not block re-booking.
    const overlapsBooking = bookings.some(b => {
      if (editingBookingId && b.booking_id === editingBookingId) return false;
      if (b.status !== 'confirmed') return false;
      if (b.apartment_details?.id !== selectedApartmentId && b.apartment !== selectedApartmentId) return false;
      const start = parseISO(b.check_in);
      const end = parseISO(b.check_out);
      return !isBefore(day, start) && isBefore(day, end);
    });

    // Check blocked dates overlap
    const overlapsBlock = blockedDates.some(bd => {
      if (bd.apartment !== selectedApartmentId) return false;
      const start = parseISO(bd.start_date);
      const end = parseISO(bd.end_date);
      return !isBefore(day, start) && isBefore(day, end);
    });

    return overlapsBooking || overlapsBlock;
  };

  const isInvalidCheckOut = (day: Date) => {
    if (!checkInDate) return false;
    if (!isAfter(day, checkInDate)) return true;
    if (!selectedApartmentId) return false;

    // Check if there is any booking or block starting between checkInDate (inclusive) and day (exclusive)
    const hasBookingOverlap = bookings.some(b => {
      if (editingBookingId && b.booking_id === editingBookingId) return false;
      if (b.status !== 'confirmed') return false;
      if (b.apartment_details?.id !== selectedApartmentId && b.apartment !== selectedApartmentId) return false;
      const start = parseISO(b.check_in);
      return !isBefore(start, checkInDate) && isBefore(start, day);
    });

    const hasBlockOverlap = blockedDates.some(bd => {
      if (bd.apartment !== selectedApartmentId) return false;
      const start = parseISO(bd.start_date);
      return !isBefore(start, checkInDate) && isBefore(start, day);
    });

    return hasBookingOverlap || hasBlockOverlap;
  };

  const handleDayClick = (day: Date) => {
    if (isBefore(day, today)) return;
    if (isBlockedDay(day)) return;

    if (selecting === 'checkIn' || !checkIn) {
      onSelect(format(day, 'yyyy-MM-dd'), '');
      setSelecting('checkOut');
    } else {
      if (isInvalidCheckOut(day)) return;

      if (checkInDate && isAfter(day, checkInDate)) {
        onSelect(checkIn, format(day, 'yyyy-MM-dd'));
        setSelecting('checkIn');
      } else {
        onSelect(format(day, 'yyyy-MM-dd'), '');
        setSelecting('checkOut');
      }
    }
  };

  const isInRange = (day: Date) => {
    const end = checkOutDate || (selecting === 'checkOut' && hovered ? hovered : null);
    if (!checkInDate || !end) return false;
    if (!isAfter(end, checkInDate)) return false;
    return isAfter(day, checkInDate) && isBefore(day, end);
  };

  const nights =
    checkInDate && checkOutDate ? differenceInDays(checkOutDate, checkInDate) : 0;

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden">
      {/* Check-in / Check-out tabs */}
      <div className="grid grid-cols-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setSelecting('checkIn')}
          className={`py-2.5 px-4 text-left transition-colors ${
            selecting === 'checkIn'
              ? 'bg-emerald-50 border-b-2 border-emerald-600'
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Check-in</div>
          <div className={`text-sm font-bold mt-0.5 ${checkIn ? 'text-gray-900' : 'text-gray-400'}`}>
            {checkIn ? format(parseISO(checkIn), 'EEE, MMM d') : 'Select date'}
          </div>
        </button>
        <button
          type="button"
          onClick={() => checkIn && setSelecting('checkOut')}
          className={`py-2.5 px-4 text-left border-l border-gray-200 transition-colors ${
            selecting === 'checkOut'
              ? 'bg-emerald-50 border-b-2 border-emerald-600'
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Check-out</div>
          <div className={`text-sm font-bold mt-0.5 ${checkOut ? 'text-gray-900' : 'text-gray-400'}`}>
            {checkOut ? format(parseISO(checkOut), 'EEE, MMM d') : 'Select date'}
          </div>
        </button>
      </div>

      {/* Calendar */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setMonth(subMonths(month, 1))}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <span className="text-sm font-bold text-gray-900">{format(month, 'MMMM yyyy')}</span>
          <button
            type="button"
            onClick={() => setMonth(addMonths(month, 1))}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {WEEK_DAYS.map((d) => (
            <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map((day) => {
            const past = isBefore(day, today);
            const isBlocked = isBlockedDay(day);
            const invalidCO = selecting === 'checkOut' && isInvalidCheckOut(day);
            const isDisabled = past || isBlocked || invalidCO;

            const isCI = checkInDate ? isSameDay(day, checkInDate) : false;
            const isCO = checkOutDate ? isSameDay(day, checkOutDate) : false;
            const inRange = isInRange(day);
            const todayMark = isToday(day);
            const hasRange = !!(checkOutDate || (selecting === 'checkOut' && hovered && checkInDate));

            return (
              <div
                key={day.toISOString()}
                className={[
                  inRange ? 'bg-emerald-50' : '',
                  isCI && hasRange ? 'rounded-l-full' : '',
                  isCO ? 'rounded-r-full' : '',
                ].filter(Boolean).join(' ')}
              >
                <button
                  type="button"
                  onClick={() => handleDayClick(day)}
                  onMouseEnter={() => setHovered(day)}
                  onMouseLeave={() => setHovered(null)}
                  disabled={isDisabled}
                  title={
                    past
                      ? 'Past date'
                      : isBlocked
                        ? 'Date is already booked'
                        : invalidCO
                          ? 'Selecting this checkout date would overlap with an existing booking'
                          : undefined
                  }
                  className={[
                    'w-full aspect-square flex items-center justify-center text-sm rounded-full transition-colors',
                    past ? 'text-gray-300 cursor-not-allowed' : '',
                    !past && (isBlocked || invalidCO) ? 'bg-rose-50/70 text-rose-400 line-through cursor-not-allowed border border-rose-100' : '',
                    !isDisabled ? 'cursor-pointer' : '',
                    isCI || isCO
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 font-bold'
                      : '',
                    !isCI && !isCO && !isDisabled ? 'hover:bg-emerald-100 font-medium text-gray-800' : '',
                    todayMark && !isCI && !isCO ? 'ring-2 ring-emerald-400' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {format(day, 'd')}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-gray-400">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-50/70 border border-rose-200" />
          <span>Booked</span>
        </div>
        <div>
          {!checkIn && <span className="text-gray-500">Click a date to set check-in</span>}
          {checkIn && !checkOut && (
            <span className="text-gray-500">Now click a date to set check-out</span>
          )}
          {nights > 0 && (
            <span className="text-emerald-700 font-semibold">
              {nights} night{nights !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminBookingModal({
  isOpen,
  onClose,
  onSuccess,
  initialApartment,
  initialCheckIn,
  bookingToEdit,
  bookings = [],
  blockedDates = [],
}: AdminBookingModalProps) {
  const isEditMode = !!bookingToEdit;

  const { data: apartmentsData, isLoading: apartmentsLoading } = useGetApartmentsQuery(
    {},
    { skip: !isOpen }
  );
  const [createBooking, { isLoading: createLoading, error: createError, isSuccess: createSuccess, data: responseData, reset: resetCreate }] =
    useCreateBookingMutation();
  const [updateBooking, { isLoading: updateLoading, error: updateError, isSuccess: updateSuccess, reset: resetUpdate }] =
    useUpdateBookingMutation();

  const loading = isEditMode ? updateLoading : createLoading;
  const apiError = isEditMode ? updateError : createError;
  const success = isEditMode ? updateSuccess : createSuccess;

  const bookingResult = (responseData as any)?.booking;
  const errorMsg = (() => {
    if (!apiError) return null;
    if (!('data' in (apiError as any))) return 'Failed to create booking';
    const data = (apiError as any).data as Record<string, unknown> | null | undefined;
    if (!data) return 'Failed to create booking';
    if (typeof data.detail === 'string') return data.detail;
    if (typeof data.message === 'string') return data.message;
    // Field-level DRF validation errors: { field: ["msg", ...] }
    const msgs = Object.entries(data)
      .filter(([k]) => k !== 'non_field_errors')
      .flatMap(([, v]) => (Array.isArray(v) ? v : [v]))
      .map(String)
      .join(' ');
    if (msgs) return msgs;
    return 'Failed to create booking';
  })();

  const apartments = (apartmentsData?.results || []).slice().sort((a: any, b: any) => a.title.localeCompare(b.title));
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<any>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [idFileName, setIdFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Guest profile autocomplete
  const [guestSearch, setGuestSearch] = useState('');
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [guestSearchDebounced, setGuestSearchDebounced] = useState('');
  const guestSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const guestInputRef = useRef<HTMLInputElement>(null);
  const guestDropdownRef = useRef<HTMLDivElement>(null);

  const { data: guestProfilesData } = useSearchGuestProfilesQuery(guestSearchDebounced, {
    skip: !isOpen || guestSearchDebounced.length < 2,
  });
  const guestProfiles = guestProfilesData?.results || [];

  const emptyForm: BookingFormData = {
    apartment_id: '',
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    special_requests: '',
    address: '',
    id_type: '',
    id_document: null,
    purpose: '',
  };

  const [formData, setFormData] = useState<BookingFormData>(emptyForm);
  const [discountType, setDiscountType] = useState<'none' | 'fixed' | 'percentage'>('none');
  const [discountValue, setDiscountValue] = useState('');
  const [discountReason, setDiscountReason] = useState('');

  const modalScrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top and show success state when booking is created
  useEffect(() => {
    if (success) {
      modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [success]);

  // Pre-fill: calendar click (create mode) OR edit mode
  useEffect(() => {
    if (!isOpen) return;
    if (bookingToEdit) {
      // Edit mode — populate every field from the existing booking
      const apt = bookingToEdit.apartment_details;
      if (apt) {
        setSelectedApartment(apt);
        setSearchTerm(apt.title);
      }
      setGuestSearch(bookingToEdit.name);
      setFormData({
        apartment_id: bookingToEdit.apartment,
        name: bookingToEdit.name,
        email: bookingToEdit.email || '',
        phone: bookingToEdit.phone || '',
        checkIn: bookingToEdit.check_in,
        checkOut: bookingToEdit.check_out,
        guests: bookingToEdit.guests,
        special_requests: bookingToEdit.special_requests || '',
        address: bookingToEdit.address || '',
        id_type: bookingToEdit.id_type || '',
        id_document: null,
        purpose: bookingToEdit.purpose || '',
      });
      if ((bookingToEdit as any).discount_type && (bookingToEdit as any).discount_type !== 'none') {
        setDiscountType((bookingToEdit as any).discount_type);
        setDiscountValue((bookingToEdit as any).discount_value || '');
        setDiscountReason((bookingToEdit as any).discount_reason || '');
      }
    } else if (initialApartment) {
      setSelectedApartment(initialApartment);
      setSearchTerm(initialApartment.title);
      setFormData((prev) => ({
        ...prev,
        apartment_id: initialApartment.id,
        checkIn: initialCheckIn || '',
        checkOut: '',
      }));
    }
  }, [isOpen, bookingToEdit, initialApartment, initialCheckIn]);


  const handleCleanup = () => {
    setFormData(emptyForm);
    setSelectedApartment(null);
    setSearchTerm('');
    setGuestSearch('');
    setGuestSearchDebounced('');
    setShowGuestDropdown(false);
    setIdPreview(null);
    setIdFileName(null);
    setDiscountType('none');
    setDiscountValue('');
    setDiscountReason('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    resetCreate();
    resetUpdate();
    onClose();
  };


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setFormData((prev) => ({ ...prev, id_document: file }));
    setIdFileName(file.name);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setIdPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setIdPreview(null);
    }
  };

  const handleApartmentSelect = (apartment: any) => {
    setSelectedApartment(apartment);
    setFormData((prev) => ({ ...prev, apartment_id: apartment.id }));
    setSearchTerm(apartment.title);
    setShowDropdown(false);
  };

  const filteredApartments = apartments.filter(
    (a: any) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.apartment_id) { alert('Please select a unit'); return; }
    if (!formData.checkIn || !formData.checkOut) { alert('Please select check-in and check-out dates'); return; }

    if (isEditMode && bookingToEdit) {
      // Edit mode: send a plain JSON PATCH
      try {
        const payload: Record<string, any> = {
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone,
          check_in: formData.checkIn,
          check_out: formData.checkOut,
          guests: formData.guests,
          address: formData.address,
          id_type: formData.id_type,
          purpose: formData.purpose,
          special_requests: formData.special_requests,
        };
        if (discountType !== 'none' && discountValue) {
          payload.discount_type = discountType;
          payload.discount_value = discountValue;
          payload.discount_reason = discountReason;
        }
        await updateBooking({ id: bookingToEdit.booking_id, data: payload }).unwrap();
        onSuccess?.();
        handleCleanup();
      } catch (err) {
        console.error('Failed to update booking:', err);
      }
      return;
    }

    const fd = new FormData();
    fd.append('apartment_id', formData.apartment_id);
    fd.append('name', formData.name);
    fd.append('email', formData.email);
    fd.append('phone', formData.phone);
    fd.append('check_in', formData.checkIn);
    fd.append('check_out', formData.checkOut);
    fd.append('guests', String(formData.guests));
    fd.append('is_walk_in', 'true');
    fd.append('address', formData.address);
    fd.append('id_type', formData.id_type);
    fd.append('purpose', formData.purpose);
    if (formData.special_requests) fd.append('special_requests', formData.special_requests);
    if (formData.id_document) fd.append('id_document', formData.id_document);
    if (discountType !== 'none' && discountValue) {
      fd.append('discount_type', discountType);
      fd.append('discount_value', discountValue);
      if (discountReason) fd.append('discount_reason', discountReason);
    }

    try {
      await createBooking(fd).unwrap();
    } catch (err) {
      console.error('Failed to create walk-in booking:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              ref={modalScrollRef}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto border border-gray-200"
            >
              {/* ── SUCCESS STATE: replace form entirely after booking is created ── */}
              {!isEditMode && success && bookingResult ? (
                <>
                  {/* Success header */}
                  <div className="sticky top-0 bg-emerald-600 px-6 py-4 rounded-t-3xl flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-white shrink-0" />
                      <div>
                        <h2 className="text-lg font-bold text-white">Booking Created</h2>
                        <p className="text-sm text-emerald-100 mt-0.5">
                          {bookingResult.name} · {bookingResult.apartment_details?.title ?? '—'} · {bookingResult.check_in} → {bookingResult.check_out}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => { handleCleanup(); onSuccess?.(); }} className="p-2 hover:bg-emerald-700 rounded-full transition-colors">
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>

                  {/* Booking summary strip */}
                  <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <span className="text-emerald-700">
                      <span className="font-semibold">Ref:</span> {bookingResult.booking_id}
                    </span>
                    <span className="text-emerald-700">
                      <span className="font-semibold">Nights:</span> {bookingResult.nights}
                    </span>
                    <span className="text-emerald-700">
                      <span className="font-semibold">Total:</span> {bookingResult.currency}{parseFloat(bookingResult.total_amount).toLocaleString()}
                    </span>
                  </div>

                  {/* Payment ledger — full width, no extra chrome */}
                  <div className="p-5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Record Payment
                    </p>
                    <BookingPaymentLedger
                      booking={bookingResult}
                      onClose={() => { handleCleanup(); onSuccess?.(); }}
                      inline
                    />
                  </div>

                  {/* Done button */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                    <button
                      type="button"
                      onClick={() => { handleCleanup(); onSuccess?.(); }}
                      className="w-full py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Done — Close
                    </button>
                  </div>
                </>
              ) : (
                <>
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Booking' : 'Walk-in Booking'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {isEditMode ? `Editing booking for ${bookingToEdit?.name}` : 'Register a walk-in guest'}
                  </p>
                </div>
                <button onClick={handleCleanup} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Error */}
                {apiError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">Booking Error</p>
                      <p className="text-sm text-red-700 mt-0.5">{errorMsg}</p>
                    </div>
                  </div>
                )}

                {/* ── Unit selection ── */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Select Unit *</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Search for a unit..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    />
                    {showDropdown && (
                      <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                        {apartmentsLoading ? (
                          <div className="p-4 text-center text-sm text-gray-500">Loading units…</div>
                        ) : filteredApartments.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">No units found</div>
                        ) : (
                          filteredApartments.map((apt: any) => (
                            <button
                              key={apt.id}
                              type="button"
                              onClick={() => handleApartmentSelect(apt)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="text-sm font-semibold text-gray-900">{apt.title}</div>
                              <div className="text-xs text-gray-500">
                                {apt.location} · {apt.currency}{parseFloat(apt.price).toLocaleString()}/night
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {selectedApartment && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center">
                      <div>
                        <div className="text-sm font-semibold text-emerald-900">{selectedApartment.title}</div>
                        <div className="text-xs text-emerald-700">{selectedApartment.location}</div>
                      </div>
                      <div className="text-sm font-bold text-emerald-700">
                        {selectedApartment.currency}{parseFloat(selectedApartment.price).toLocaleString()}/night
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Calendar date picker ── */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Booking Dates *</label>
                  <CalendarPicker
                    checkIn={formData.checkIn}
                    checkOut={formData.checkOut}
                    onSelect={(ci, co) =>
                      setFormData((prev) => ({ ...prev, checkIn: ci, checkOut: co }))
                    }
                    selectedApartmentId={selectedApartment?.id}
                    bookings={bookings}
                    blockedDates={blockedDates}
                    editingBookingId={bookingToEdit?.booking_id}
                  />
                </div>

                {/* ── Guests ── */}
                <div className="border border-gray-300 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Guests *</p>
                      <p className="text-xs text-gray-500 mt-0.5">Maximum 10 guests</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, guests: Math.max(1, p.guests - 1) }))}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-emerald-400 transition-colors text-gray-700 font-bold"
                      >−</button>
                      <span className="w-6 text-center font-semibold text-gray-900">{formData.guests}</span>
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, guests: Math.min(10, p.guests + 1) }))}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-emerald-400 transition-colors text-gray-700 font-bold"
                      >+</button>
                    </div>
                  </div>
                </div>

                {/* ── Client Information ── */}
                <div className="border-t border-gray-200 pt-5">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">Client Information</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Guest autocomplete combobox */}
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-900 mb-1.5">Full Name *</label>
                      <div className="relative">
                        <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <input
                          ref={guestInputRef}
                          type="text"
                          name="name"
                          value={guestSearch || formData.name}
                          required
                          placeholder="Type to search saved customers or enter a new name"
                          autoComplete="off"
                          onChange={(e) => {
                            const val = e.target.value;
                            setGuestSearch(val);
                            setFormData((p) => ({ ...p, name: val }));
                            setShowGuestDropdown(true);
                            if (guestSearchTimer.current) clearTimeout(guestSearchTimer.current);
                            guestSearchTimer.current = setTimeout(() => setGuestSearchDebounced(val), 300);
                          }}
                          onFocus={() => { if (guestSearch.length >= 2) setShowGuestDropdown(true); }}
                          onBlur={() => setTimeout(() => setShowGuestDropdown(false), 150)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                      {showGuestDropdown && guestProfiles.length > 0 && (
                        <div
                          ref={guestDropdownRef}
                          className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto"
                        >
                          {guestProfiles.map((g) => (
                            <button
                              key={g.id}
                              type="button"
                              onMouseDown={() => {
                                setGuestSearch(g.name);
                                setFormData((p) => ({
                                  ...p,
                                  name: g.name,
                                  email: g.email || '',
                                  phone: g.phone || '',
                                  address: g.address || '',
                                  id_type: g.id_type || '',
                                }));
                                setShowGuestDropdown(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                            >
                              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-emerald-700">{g.name.charAt(0).toUpperCase()}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{g.name}</p>
                                <p className="text-xs text-gray-400 truncate">
                                  {[g.phone, g.email].filter(Boolean).join(' · ')}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {guestSearch.length >= 2 && guestProfiles.length === 0 && showGuestDropdown && (
                        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-400">
                          No saved customers found — a new profile will be created.
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email <span className="font-normal text-gray-400">(Optional)</span></label>
                        <input
                          type="email" name="email" value={formData.email} onChange={handleChange}
                          placeholder="client@email.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Phone *</label>
                        <input
                          type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                          placeholder="+234 800 000 0000"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                        <MapPin className="inline h-3.5 w-3.5 mr-1 text-emerald-600" />
                        Home Address *
                      </label>
                      <textarea
                        name="address" value={formData.address} onChange={handleChange} required
                        placeholder="Client's residential address" rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Means of Identification ── */}
                <div className="border-t border-gray-200 pt-5">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">Means of Identification</h3>
                  </div>

                  {/* ID Type */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Type of ID Document *</label>
                    <select
                      name="id_type"
                      value={formData.id_type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="">— Select ID type —</option>
                      {ID_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* ID Document upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Upload ID Document <span className="font-normal text-gray-400">(Optional)</span></label>
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        An ID document is required for verification. Please upload one when available.
                      </p>
                    </div>

                    {idPreview ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200">
                        <img src={idPreview} alt="ID document" className="w-full h-44 object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setIdPreview(null); setIdFileName(null);
                            setFormData((p) => ({ ...p, id_document: null }));
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow hover:bg-red-50 transition-colors"
                        >
                          <X className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    ) : idFileName ? (
                      <div className="flex items-center gap-3 p-4 border border-emerald-200 bg-emerald-50 rounded-xl">
                        <FileText className="h-8 w-8 text-emerald-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{idFileName}</p>
                          <p className="text-xs text-gray-500">Document ready to upload</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIdFileName(null);
                            setFormData((p) => ({ ...p, id_document: null }));
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="p-1 hover:bg-red-100 rounded-full transition-colors"
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors group">
                        <Upload className="h-7 w-7 text-gray-400 group-hover:text-emerald-500 mb-2 transition-colors" />
                        <span className="text-sm font-medium text-gray-600 group-hover:text-emerald-700">
                          Click to upload ID document
                        </span>
                        <span className="text-xs text-gray-400 mt-1">JPG, PNG, PDF · Max 10 MB</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* ── Purpose of Visit ── */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Purpose of Visit *</label>
                  <textarea
                    name="purpose" value={formData.purpose} onChange={handleChange} required
                    placeholder="e.g. Leisure, Business, Family visit, Vacation…" rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 resize-none"
                  />
                </div>

                {/* ── Special Requests ── */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Special Requests <span className="font-normal text-gray-400">(Optional)</span>
                  </label>
                  <textarea
                    name="special_requests" value={formData.special_requests} onChange={handleChange}
                    placeholder="Any special requirements or notes…" rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 resize-none"
                  />
                </div>

                {/* ── Discount ── */}
                {!success && (() => {
                  const aptPrice = selectedApartment ? parseFloat(selectedApartment.price) : 0;
                  const nights = formData.checkIn && formData.checkOut
                    ? Math.max(0, (new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / 86400000)
                    : 0;
                  const baseTotal = aptPrice * nights;
                  const dv = parseFloat(discountValue) || 0;
                  const discAmt = discountType === 'percentage' ? baseTotal * dv / 100 : discountType === 'fixed' ? Math.min(dv, baseTotal) : 0;
                  return (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-purple-600" />
                        <p className="text-sm font-semibold text-purple-800">Discount <span className="font-normal text-purple-400 text-xs">(Optional)</span></p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <select
                          value={discountType}
                          onChange={e => { setDiscountType(e.target.value as any); setDiscountValue(''); }}
                          className="px-3 py-2 border border-purple-300 rounded-xl text-sm bg-white text-gray-800 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                        >
                          <option value="none">No discount</option>
                          <option value="fixed">Fixed amount (₦)</option>
                          <option value="percentage">Percentage (%)</option>
                        </select>
                        {discountType !== 'none' && (
                          <>
                            <input
                              type="number" min="0"
                              max={discountType === 'percentage' ? '100' : undefined}
                              value={discountValue}
                              onChange={e => setDiscountValue(e.target.value)}
                              placeholder={discountType === 'percentage' ? '% e.g. 10' : '₦ e.g. 5000'}
                              className="w-32 px-3 py-2 border border-purple-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                            />
                            <input
                              type="text"
                              value={discountReason}
                              onChange={e => setDiscountReason(e.target.value)}
                              placeholder="Reason e.g. loyalty, corp rate…"
                              className="flex-1 min-w-0 px-3 py-2 border border-purple-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                            />
                          </>
                        )}
                      </div>
                      {baseTotal > 0 && discAmt > 0 && (
                        <div className="text-xs text-purple-700 bg-purple-100 rounded-lg px-3 py-2 flex justify-between">
                          <span>Price after discount ({selectedApartment?.currency})</span>
                          <span className="font-bold">{(baseTotal - discAmt).toLocaleString()} <span className="font-normal text-purple-400">saves {discAmt.toLocaleString()}</span></span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ── Actions ── */}
                <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 -mx-6 px-6 -mb-6 pb-6 mt-2">
                  <div className="flex gap-3">
                    <button
                      type="button" onClick={handleCleanup}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold text-gray-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit" disabled={loading || (!isEditMode && success)}
                      className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading
                        ? (isEditMode ? 'Saving…' : 'Creating…')
                        : (!isEditMode && success)
                          ? 'Booking Created!'
                          : isEditMode
                            ? 'Save Changes'
                            : 'Create Walk-in Booking'}
                    </button>
                  </div>
                </div>
              </form>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
