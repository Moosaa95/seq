import { apiSlice } from './apiSlice';
import { ApiPaginatedResponse } from './propertyApi';

export interface Agent {
    id: number;
    name: string;
    phone: string;
    mobile: string;
    email: string;
    skype?: string;
}

export const agentApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAgents: builder.query<ApiPaginatedResponse<Agent>, void>({
            query: () => '/agents/',
        }),
        getAgent: builder.query<Agent, number>({
            query: (id) => `/agents/${id}/`,
        }),
    }),
});

export const {
    useGetAgentsQuery,
    useGetAgentQuery,
} = agentApi;
