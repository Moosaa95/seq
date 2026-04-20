import { apiSlice } from './apiSlice';
import { ApiPaginatedResponse } from './propertyApi';

export type CalendarSource = 'airbnb' | 'booking_com' | 'vrbo' | 'other';

export interface ExternalCalendar {
    id: string;
    apartment: string;
    apartment_id?: string;
    source: CalendarSource;
    source_display: string;
    ical_url: string;
    is_active: boolean;
    last_synced: string | null;
    sync_errors: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateExternalCalendarData {
    apartment_id: string;
    source: CalendarSource;
    ical_url: string;
    is_active?: boolean;
}

export const calendarApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getExternalCalendars: builder.query<ApiPaginatedResponse<ExternalCalendar>, string>({
            query: (apartmentId) => `/external-calendars/?apartment=${apartmentId}`,
            providesTags: ['ExternalCalendar'],
        }),
        createExternalCalendar: builder.mutation<ExternalCalendar, CreateExternalCalendarData>({
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
        syncExternalCalendar: builder.mutation<{
            success: boolean;
            created: number;
            updated: number;
            total_events: number;
            errors: string[];
        }, string>({
            query: (id) => ({
                url: `/external-calendars/${id}/sync/`,
                method: 'POST',
            }),
            invalidatesTags: ['ExternalCalendar'],
        }),
    }),
});

export const {
    useGetExternalCalendarsQuery,
    useCreateExternalCalendarMutation,
    useDeleteExternalCalendarMutation,
    useSyncExternalCalendarMutation,
} = calendarApi;
