/**
 * Admin API - RTK Query (extends base apiSlice)
 * 
 * Admin endpoints injected into the base apiSlice for proper cache management
 * and token refresh handling.
 */

import { apiSlice } from './apiSlice';
import { ApiApartment, ApiProperty } from './propertyApi';

// Types
// Types are imported from propertyApi.ts

export interface ApiBooking {
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
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    payment_status: string;
    special_requests?: string;
    created_at: string;
    updated_at: string;
}

export interface ApiPayment {
    id: string;
    booking: string;
    booking_details: ApiBooking;
    amount: string;
    currency: string;
    payment_method: string;
    transaction_reference: string;
    gateway_response: any;
    status: string;
    paid_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface ApiContactInquiry {
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    is_read: boolean;
    responded: boolean;
    created_at: string;
    updated_at: string;
}

export interface ApiPropertyInquiry {
    id: string;
    apartment: string;
    apartment_details: ApiApartment;
    name: string;
    email: string;
    phone: string;
    message: string;
    is_read: boolean;
    responded: boolean;
    created_at: string;
    updated_at: string;
}

// User Management Types
export interface ApiUserRole {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    is_superuser_role: boolean;
    is_default: boolean;
    user_count?: number;
    available_permissions?: Record<string, string[]>;
    created_at: string;
    updated_at: string;
}

export interface ApiUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    date_joined: string;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    role: string | null;
    role_name?: string;
    role_details?: ApiUserRole;
    permissions?: string[];
}

export interface ApiActivityLog {
    id: string;
    user: string | null;
    user_email: string;
    user_name: string;
    action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'other';
    resource_type: string;
    resource_id: string;
    description: string;
    details: Record<string, any>;
    ip_address: string | null;
    user_agent: string;
    endpoint: string;
    method: string;
    status_code: number | null;
    created_at: string;
}

export interface ApiPermissions {
    permissions: string[];
    groups: Record<string, string[]>;
}

export interface ApiPaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// Query parameters types
interface BookingsQueryParams {
    status?: string;
    payment_status?: string;
    apartment_id?: string;
    email?: string;
    page?: number;
    page_size?: number;
}

interface PaymentsQueryParams {
    status?: string;
    booking_id?: string;
    page?: number;
    page_size?: number;
}

interface InquiriesQueryParams {
    is_read?: boolean;
    responded?: boolean;
    page?: number;
    page_size?: number;
    apartment_id?: string;
}

interface UsersQueryParams {
    search?: string;
    is_active?: boolean;
    is_staff?: boolean;
    is_superuser?: boolean;
    role?: string;
    page?: number;
    page_size?: number;
}

interface RolesQueryParams {
    search?: string;
    page?: number;
    page_size?: number;
}

interface ActivityLogsQueryParams {
    user?: string;
    action?: string;
    resource_type?: string;
    method?: string;
    search?: string;
    page?: number;
    page_size?: number;
}

// Helper to build query string
const buildQueryString = (params: Record<string, any> = {}): string => {
    const filtered = Object.entries(params).filter(([_, v]) => v !== undefined);
    if (filtered.length === 0) return '';
    return '?' + new URLSearchParams(
        filtered.map(([k, v]) => [k, String(v)])
    ).toString();
};

// Inject admin endpoints into apiSlice
export const adminApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Bookings
        getBookings: builder.query<ApiPaginatedResponse<ApiBooking>, BookingsQueryParams | void>({
            query: (params) => `/bookings/${buildQueryString(params || {})}`,
            providesTags: (result) =>
                result
                    ? [
                        ...result.results.map(({ booking_id }) => ({ type: 'Booking' as const, id: booking_id })),
                        { type: 'Booking', id: 'LIST' },
                    ]
                    : [{ type: 'Booking', id: 'LIST' }],
        }),

        getBooking: builder.query<ApiBooking, string>({
            query: (bookingId) => `/bookings/${bookingId}/`,
            providesTags: (result, error, id) => [{ type: 'Booking', id }],
        }),

        createBooking: builder.mutation<ApiBooking, Partial<ApiBooking> & { apartment_id: string }>({
            query: (body) => ({
                url: '/bookings/',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Booking', id: 'LIST' }],
        }),

        updateBookingStatus: builder.mutation<
            ApiBooking,
            { bookingId: string; status: 'pending' | 'confirmed' | 'cancelled' | 'completed' }
        >({
            query: ({ bookingId, status }) => ({
                url: `/bookings/${bookingId}/`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: (result, error, { bookingId }) => [
                { type: 'Booking', id: bookingId },
                { type: 'Booking', id: 'LIST' },
            ],
        }),

        updateBooking: builder.mutation<ApiBooking, { id: string; data: Partial<ApiBooking> & { cancellation_reason?: string } }>({
            query: ({ id, data }) => ({
                url: `/bookings/${id}/`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Booking', id },
                { type: 'Booking', id: 'LIST' },
            ],
        }),

        cancelBooking: builder.mutation<{ success: boolean; message: string; booking: ApiBooking }, string>({
            query: (bookingId) => ({
                url: `/bookings/${bookingId}/cancel/`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, bookingId) => [
                { type: 'Booking', id: bookingId },
                { type: 'Booking', id: 'LIST' },
            ],
        }),

        // Payments
        getPayments: builder.query<ApiPaginatedResponse<ApiPayment>, PaymentsQueryParams | void>({
            query: (params) => `/payments/${buildQueryString(params || {})}`,
            providesTags: (result) =>
                result
                    ? [
                        ...result.results.map(({ id }) => ({ type: 'Payment' as const, id })),
                        { type: 'Payment', id: 'LIST' },
                    ]
                    : [{ type: 'Payment', id: 'LIST' }],
        }),

        getPayment: builder.query<ApiPayment, string>({
            query: (paymentId) => `/payments/${paymentId}/`,
            providesTags: (result, error, id) => [{ type: 'Payment', id }],
        }),

        // Contact Inquiries
        getContactInquiries: builder.query<ApiPaginatedResponse<ApiContactInquiry>, InquiriesQueryParams | void>({
            query: (params) => `/contact-inquiries/${buildQueryString(params || {})}`,
            providesTags: (result) =>
                result
                    ? [
                        ...result.results.map(({ id }) => ({ type: 'ContactInquiry' as const, id })),
                        { type: 'ContactInquiry', id: 'LIST' },
                    ]
                    : [{ type: 'ContactInquiry', id: 'LIST' }],
        }),

        updateContactInquiry: builder.mutation<
            ApiContactInquiry,
            { inquiryId: string; data: { is_read?: boolean; responded?: boolean } }
        >({
            query: ({ inquiryId, data }) => ({
                url: `/contact-inquiries/${inquiryId}/`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (result, error, { inquiryId }) => [
                { type: 'ContactInquiry', id: inquiryId },
                { type: 'ContactInquiry', id: 'LIST' },
            ],
        }),

        // Property Inquiries
        getPropertyInquiries: builder.query<ApiPaginatedResponse<ApiPropertyInquiry>, InquiriesQueryParams | void>({
            query: (params) => `/property-inquiries/${buildQueryString(params || {})}`,
            providesTags: (result) =>
                result
                    ? [
                        ...result.results.map(({ id }) => ({ type: 'PropertyInquiry' as const, id })),
                        { type: 'PropertyInquiry', id: 'LIST' },
                    ]
                    : [{ type: 'PropertyInquiry', id: 'LIST' }],
        }),

        updatePropertyInquiry: builder.mutation<
            ApiPropertyInquiry,
            { inquiryId: string; data: { is_read?: boolean; responded?: boolean } }
        >({
            query: ({ inquiryId, data }) => ({
                url: `/property-inquiries/${inquiryId}/`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (result, error, { inquiryId }) => [
                { type: 'PropertyInquiry', id: inquiryId },
                { type: 'PropertyInquiry', id: 'LIST' },
            ],
        }),

        // External Calendars
        getExternalCalendars: builder.query<ApiPaginatedResponse<any>, { apartment?: string } | void>({
            query: (params) => `/external-calendars/${buildQueryString(params || {})}`,
            providesTags: ['ExternalCalendar'],
        }),

        createExternalCalendar: builder.mutation<any, { apartment: string; source: string; ical_url: string }>({
            query: (data) => ({
                url: '/external-calendars/',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['ExternalCalendar'],
        }),

        deleteExternalCalendar: builder.mutation<void, string>({
            query: (id) => ({
                url: `/external-calendars/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ExternalCalendar'],
        }),

        syncExternalCalendar: builder.mutation<any, string>({
            query: (id) => ({
                url: `/external-calendars/${id}/sync/`,
                method: 'POST',
            }),
            invalidatesTags: ['ExternalCalendar'],
        }),

        // ============================================================================
        // User Management Endpoints
        // ============================================================================

        // Users
        getUsers: builder.query<ApiPaginatedResponse<ApiUser>, UsersQueryParams | void>({
            query: (params) => `/account/users/${buildQueryString(params || {})}`,
            providesTags: (result) =>
                result
                    ? [
                        ...result.results.map(({ id }) => ({ type: 'User' as const, id })),
                        { type: 'User', id: 'LIST' },
                    ]
                    : [{ type: 'User', id: 'LIST' }],
        }),

        getUser: builder.query<ApiUser, string>({
            query: (userId) => `/account/users/${userId}/`,
            providesTags: (result, error, id) => [{ type: 'User', id }],
        }),

        createUser: builder.mutation<ApiUser, Partial<ApiUser> & { password?: string }>({
            query: (data) => ({
                url: '/account/users/',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'User', id: 'LIST' }],
        }),

        updateUser: builder.mutation<ApiUser, { id: string; data: Partial<ApiUser> & { password?: string } }>({
            query: ({ id, data }) => ({
                url: `/account/users/${id}/`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'User', id },
                { type: 'User', id: 'LIST' },
            ],
        }),

        deleteUser: builder.mutation<{ success: boolean; message: string }, string>({
            query: (userId) => ({
                url: `/account/users/${userId}/`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, userId) => [
                { type: 'User', id: userId },
                { type: 'User', id: 'LIST' },
            ],
        }),

        // Roles
        getRoles: builder.query<ApiPaginatedResponse<ApiUserRole>, RolesQueryParams | void>({
            query: (params) => `/account/roles/${buildQueryString(params || {})}`,
            providesTags: (result) =>
                result
                    ? [
                        ...result.results.map(({ id }) => ({ type: 'Role' as const, id })),
                        { type: 'Role', id: 'LIST' },
                    ]
                    : [{ type: 'Role', id: 'LIST' }],
        }),

        getRole: builder.query<ApiUserRole, string>({
            query: (roleId) => `/account/roles/${roleId}/`,
            providesTags: (result, error, id) => [{ type: 'Role', id }],
        }),

        createRole: builder.mutation<ApiUserRole, Partial<ApiUserRole>>({
            query: (data) => ({
                url: '/account/roles/',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'Role', id: 'LIST' }],
        }),

        updateRole: builder.mutation<ApiUserRole, { id: string; data: Partial<ApiUserRole> }>({
            query: ({ id, data }) => ({
                url: `/account/roles/${id}/`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Role', id },
                { type: 'Role', id: 'LIST' },
            ],
        }),

        deleteRole: builder.mutation<void, string>({
            query: (roleId) => ({
                url: `/account/roles/${roleId}/`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, roleId) => [
                { type: 'Role', id: roleId },
                { type: 'Role', id: 'LIST' },
            ],
        }),

        // Activity Logs (read-only)
        getActivityLogs: builder.query<ApiPaginatedResponse<ApiActivityLog>, ActivityLogsQueryParams | void>({
            query: (params) => `/account/activity-logs/${buildQueryString(params || {})}`,
            providesTags: ['ActivityLog'],
        }),

        getActivityLog: builder.query<ApiActivityLog, string>({
            query: (logId) => `/account/activity-logs/${logId}/`,
            providesTags: (result, error, id) => [{ type: 'ActivityLog' as const, id }],
        }),

        // Permissions List
        getPermissions: builder.query<{ success: boolean; data: ApiPermissions }, void>({
            query: () => '/account/permissions/',
        }),
    }),
});

// Export hooks
export const {
    useGetBookingsQuery,
    useGetBookingQuery,
    useCreateBookingMutation,
    useUpdateBookingStatusMutation,
    useUpdateBookingMutation,
    useCancelBookingMutation,
    useGetPaymentsQuery,
    useGetPaymentQuery,
    useGetContactInquiriesQuery,
    useUpdateContactInquiryMutation,
    useGetPropertyInquiriesQuery,
    useUpdatePropertyInquiryMutation,
    useGetExternalCalendarsQuery,
    useCreateExternalCalendarMutation,
    useDeleteExternalCalendarMutation,
    useSyncExternalCalendarMutation,
    // User Management
    useGetUsersQuery,
    useGetUserQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    // Roles
    useGetRolesQuery,
    useGetRoleQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
    // Activity Logs
    useGetActivityLogsQuery,
    useGetActivityLogQuery,
    // Permissions
    useGetPermissionsQuery,
} = adminApi;

