import { apiSlice } from './apiSlice';

// Types
export interface BookingDispute {
    id: number;
    booking: string;
    booking_ref?: string;
    booking_details: {
        booking_id: string;
        apartment_details: {
            id: number;
            title: string;
            location: string;
        };
        name: string;
        email: string;
        phone: string;
        check_in: string;
        check_out: string;
    };
    dispute_type: string;
    dispute_type_display: string;
    status: string;
    status_display: string;
    description: string;
    resolution: string | null;
    resolved_at: string | null;
    resolved_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateDisputeInput {
    booking_ref: string;
    dispute_type: 'no_show' | 'cancellation' | 'early_checkout' | 'damage' | 'refund' | 'other';
    description: string;
}

export interface UpdateDisputeInput {
    status?: 'open' | 'in_progress' | 'resolved' | 'closed';
    resolution?: string;
    resolved_by?: string;
}

export interface ResolveDisputeInput {
    resolution: string;
    resolved_by: string;
}

export const disputesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDisputes: builder.query<BookingDispute[], { dispute_type?: string; status?: string; booking_id?: string }>({
            query: (params) => ({
                url: '/disputes/',
                params,
            }),
            transformResponse: (response: any) => {
                if (response && response.results && Array.isArray(response.results)) {
                    return response.results;
                }
                if (Array.isArray(response)) {
                    return response;
                }
                return [];
            },
            providesTags: ['Dispute'],
        }),
        getDispute: builder.query<BookingDispute, number>({
            query: (id) => `/disputes/${id}/`,
            providesTags: ['Dispute'],
        }),
        createDispute: builder.mutation<BookingDispute, CreateDisputeInput>({
            query: (body) => ({
                url: '/disputes/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Dispute'],
        }),
        updateDispute: builder.mutation<BookingDispute, { id: number; data: UpdateDisputeInput }>({
            query: ({ id, data }) => ({
                url: `/disputes/${id}/`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Dispute'],
        }),
        resolveDispute: builder.mutation<{ success: boolean; message: string; dispute: BookingDispute }, { id: number; data: ResolveDisputeInput }>({
            query: ({ id, data }) => ({
                url: `/disputes/${id}/resolve/`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Dispute'],
        }),
        deleteDispute: builder.mutation<void, number>({
            query: (id) => ({
                url: `/disputes/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Dispute'],
        }),
    }),
});

export const {
    useGetDisputesQuery,
    useGetDisputeQuery,
    useCreateDisputeMutation,
    useUpdateDisputeMutation,
    useResolveDisputeMutation,
    useDeleteDisputeMutation,
} = disputesApi;
