/**
 * Base API Slice with Token Refresh
 * 
 * Uses mutex pattern to prevent race conditions during token refresh.
 * Handles CSRF token and HttpOnly cookie authentication.
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError
} from "@reduxjs/toolkit/query";
import { Mutex } from "async-mutex";
import { setAuth, logout } from "../slices/authSlice";

// Get CSRF token from cookie
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    credentials: 'include', // Include cookies in requests
    prepareHeaders: (headers) => {
        // Add CSRF token for non-GET requests
        const csrftoken = getCookie('csrftoken');
        if (csrftoken) {
            headers.set('X-CSRFToken', csrftoken);
        }
        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    // Wait for any ongoing refresh to complete
    await mutex.waitForUnlock();

    let result = await baseQuery(args, api, extraOptions);

    // If we get a 401, try to refresh the token
    if (result.error && result.error.status === 401) {
        if (!mutex.isLocked()) {
            const release = await mutex.acquire();

            try {
                // Try to refresh the token
                const refreshResult = await baseQuery(
                    {
                        url: '/account/jwt/refresh/',
                        method: 'POST',
                    },
                    api,
                    extraOptions
                );

                if (refreshResult.data) {
                    // Refresh successful, update auth state
                    api.dispatch(setAuth());

                    // Retry the original request
                    result = await baseQuery(args, api, extraOptions);
                } else {
                    // Refresh failed, logout user
                    api.dispatch(logout());
                }
            } finally {
                release();
            }
        } else {
            // Another refresh is in progress, wait and retry
            await mutex.waitForUnlock();
            result = await baseQuery(args, api, extraOptions);
        }
    }

    return result;
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: [
        'User',
        'Auth',
        'Booking',
        'Payment',
        'Property',
        'ContactInquiry',
        'PropertyInquiry',
        'ExternalCalendar',
        'Location',
        'InventoryItem',
        'LocationInventory',
        'PropertyInventory',
        'ApartmentInventory',
        'InventoryMovement',
        'Dispute',
        'Role',
        'ActivityLog',
        'Apartment',
    ],
    endpoints: () => ({}),
});

export default apiSlice;
