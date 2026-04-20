import { apiSlice } from './apiSlice';

export interface ContactInquiryData {
    name: string;
    email: string;
    phone: string;
    subject: 'property' | 'management' | 'construction' | 'consultancy' | 'airbnb' | 'other';
    message: string;
}

export interface PropertyInquiryData {
    apartment_id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
}

export interface InquiryResponse {
    success: boolean;
    message: string;
    inquiry_id: number;
}

export const inquiryApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        submitContactInquiry: builder.mutation<InquiryResponse, ContactInquiryData>({
            query: (data) => ({
                url: '/contact-inquiries/',
                method: 'POST',
                body: data,
            }),
        }),
        submitPropertyInquiry: builder.mutation<InquiryResponse, PropertyInquiryData>({
            query: (data) => ({
                url: '/property-inquiries/',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const {
    useSubmitContactInquiryMutation,
    useSubmitPropertyInquiryMutation,
} = inquiryApi;
