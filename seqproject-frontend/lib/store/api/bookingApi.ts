import { apiSlice } from './apiSlice';
import { ApiApartment } from './propertyApi';

export interface BookingData {
    apartment_id: string;
    name: string;
    email: string;
    phone: string;
    check_in: string;
    check_out: string;
    guests: number;
    special_requests?: string;
}

export interface BookingResponse {
    success: boolean;
    message: string;
    booking: {
        booking_id: string;
        apartment: string;
        apartment_details: ApiApartment;
        name: string;
        email: string;
        phone: string;
        check_in: string;
        check_out: string;
        guests: number;
        nights: number;
        total_amount: string;
        currency: string;
        status: string;
        payment_status: string;
        special_requests?: string;
        checked_in_at?: string;
        checked_out_at?: string;
        occupancy_status?: string;
        created_at: string;
        updated_at: string;
    };
}

export const bookingApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createBooking: builder.mutation<BookingResponse, BookingData>({
            query: (bookingData) => ({
                url: '/bookings/',
                method: 'POST',
                body: bookingData,
            }),
            invalidatesTags: ['Booking'],
        }),
        getBooking: builder.query<BookingResponse['booking'], string>({
            query: (bookingId) => `/bookings/${bookingId}/`,
            providesTags: (result, error, id) => [{ type: 'Booking', id }],
        }),
        cancelBooking: builder.mutation<{ success: boolean; message: string; booking: { booking_id: string; status: string } }, string>({
            query: (bookingId) => ({
                url: `/bookings/${bookingId}/cancel/`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Booking', id }],
        }),
        checkIn: builder.mutation<{ success: boolean; message: string; booking: BookingResponse['booking'] }, string>({
            query: (bookingId) => ({
                url: `/bookings/${bookingId}/check_in/`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Booking', id }],
        }),
        checkOut: builder.mutation<{ success: boolean; message: string; booking: BookingResponse['booking'] }, string>({
            query: (bookingId) => ({
                url: `/bookings/${bookingId}/check_out/`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Booking', id }],
        }),
    }),
});

export const {
    useCreateBookingMutation,
    useGetBookingQuery,
    useCancelBookingMutation,
    useCheckInMutation,
    useCheckOutMutation,
} = bookingApi;
