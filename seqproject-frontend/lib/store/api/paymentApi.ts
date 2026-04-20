import { apiSlice } from './apiSlice';

export interface PaymentInitData {
    booking_id: string;
    metadata?: Record<string, any>;
}

export interface PaymentInitResponse {
    success: boolean;
    payment_id: string;
    authorization_url: string;
    access_code: string;
    reference: string;
    message?: string;
}

export interface PaymentVerifyData {
    reference: string;
    trxref?: string;
}

export interface PaymentVerifyResponse {
    success: boolean;
    message: string;
    payment_id: string;
    booking_id: string;
    amount: number;
    currency: string;
    status: string;
}

export interface PaystackConfigResponse {
    public_key: string;
    callback_url: string;
}

export const paymentApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPaystackConfig: builder.query<PaystackConfigResponse, void>({
            query: () => '/payments/config/',
            keepUnusedDataFor: 3600,
        }),
        initializePayment: builder.mutation<PaymentInitResponse, PaymentInitData>({
            query: (data) => ({
                url: '/payments/initialize/',
                method: 'POST',
                body: data,
            }),
        }),
        verifyPayment: builder.query<PaymentVerifyResponse, string>({
            query: (reference) => ({
                url: '/payments/verify/',
                method: 'POST',
                body: { reference },
            }),
        }),
    }),
});

export const {
    useGetPaystackConfigQuery,
    useInitializePaymentMutation,
    useVerifyPaymentQuery,
    useLazyVerifyPaymentQuery,
} = paymentApi;
