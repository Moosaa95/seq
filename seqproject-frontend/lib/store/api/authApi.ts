/**
 * Auth API Endpoints
 * 
 * RTK Query endpoints for authentication operations.
 */

import { apiSlice } from './apiSlice';
import { User, setUser, logout } from '../slices/authSlice';

interface LoginRequest {
    email: string;
    password: string;
}

interface SignupRequest {
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
}

interface AuthResponse {
    success: boolean;
    message: string;
    user: User;
}

interface VerifyResponse {
    authenticated: boolean;
    user: User;
}

export const authApi = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        // Login - POST /api/auth/jwt/create/
        login: builder.mutation<AuthResponse, LoginRequest>({
            query: (credentials) => ({
                url: '/account/jwt/create/',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUser(data.user));
                } catch {
                    // Login failed, don't update state
                }
            },
        }),

        // Signup - POST /api/auth/jwt/signup/
        signup: builder.mutation<AuthResponse, SignupRequest>({
            query: (userData) => ({
                url: '/account/jwt/signup/',
                method: 'POST',
                body: userData,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUser(data.user));
                } catch {
                    // Signup failed
                }
            },
        }),

        // Logout - POST /api/auth/logout/
        logout: builder.mutation<{ success: boolean; message: string }, void>({
            query: () => ({
                url: '/account/logout/',
                method: 'POST',
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(logout());
                } catch {
                    // Logout anyway on client side
                    dispatch(logout());
                }
            },
        }),

        // Verify/Get current user - GET /api/auth/jwt/verify/
        verify: builder.query<VerifyResponse, void>({
            query: () => '/account/jwt/verify/',
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data.authenticated) {
                        dispatch(setUser(data.user));
                    } else {
                        dispatch(logout());
                    }
                } catch {
                    dispatch(logout());
                }
            },
        }),

        // Get current user - GET /api/auth/me/
        getMe: builder.query<User, void>({
            query: () => '/account/me/',
            providesTags: ['User'],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUser(data));
                } catch {
                    // User not authenticated
                }
            },
        }),

        // Refresh token - POST /api/auth/jwt/refresh/
        refresh: builder.mutation<{ success: boolean }, void>({
            query: () => ({
                url: '/account/jwt/refresh/',
                method: 'POST',
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useSignupMutation,
    useLogoutMutation,
    useVerifyQuery,
    useGetMeQuery,
    useRefreshMutation,
} = authApi;
