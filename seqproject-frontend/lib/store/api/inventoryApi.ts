import { apiSlice } from './apiSlice';
import { ApiProperty, ApiApartment } from './propertyApi';

// Types
export interface Location {
    id: number;
    name: string;
    address: string | null;
    state_name: string | null;
    country_name: string | null;
    is_active: boolean;
    inventory_count: number;
    created_at: string;
    updated_at: string;
}

export interface InventoryItem {
    id: number;
    name: string;
    description: string | null;
    category: string;
    unit: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface LocationInventory {
    id: string;
    location: string;
    location_details: Location;
    item: string;
    item_details: InventoryItem;
    quantity: number;
    min_threshold: number;
    is_low_stock: boolean;
    created_at: string;
    updated_at: string;
}

export interface PropertyInventory {
    id: string;
    property: string;
    property_details: ApiProperty;
    item: string;
    item_details: InventoryItem;
    quantity: number;
    created_at: string;
    updated_at: string;
}

export interface ApartmentInventory {
    id: string;
    apartment: string;
    apartment_details: ApiApartment;
    item: string;
    item_details: InventoryItem;
    quantity: number;
    created_at: string;
    updated_at: string;
}

export interface InventoryMovement {
    id: string;
    location: string;
    location_details: Location;
    item: string;
    item_details: InventoryItem;
    property: string | null;
    property_details: ApiProperty | null;
    apartment: string | null;
    apartment_details: ApiApartment | null;
    booking_ref: string | null;
    movement_type: string;
    movement_type_display: string;
    quantity: number;
    reason: string;
    performed_by: string;
    created_at: string;
}

// Create inputs
export interface CreateLocationInput {
    name: string;
    address?: string;
    state?: string;
    country?: string;
    is_active?: boolean;
}

export interface CreateInventoryItemInput {
    name: string;
    description?: string;
    category: string;
    unit?: string;
    is_active?: boolean;
}

export interface CreateLocationInventoryInput {
    location_id: string;
    item_id: string;
    quantity: number;
    min_threshold?: number;
}

export interface CreatePropertyInventoryInput {
    property_id: string;
    item_id: string;
    quantity: number;
}

export interface CreateApartmentInventoryInput {
    apartment_id: string;
    item_id: string;
    quantity: number;
}

export interface CreateInventoryMovementInput {
    location_id: string;
    item_id: string;
    property_id?: string;
    apartment_id?: string;
    booking_ref?: string;
    movement_type: string;
    quantity: number;
    reason: string;
    performed_by: string;
}

export const inventoryApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Locations
        getLocations: builder.query<Location[], { is_active?: boolean }>({
            query: (params) => ({
                url: '/locations/',
                params,
            }),
            transformResponse: (response: any) => {
                if (response && response.results && Array.isArray(response.results)) return response.results;
                return Array.isArray(response) ? response : [];
            },
            providesTags: ['Location'],
        }),
        getLocation: builder.query<Location, number>({
            query: (id) => `/locations/${id}/`,
            providesTags: ['Location'],
        }),
        createLocation: builder.mutation<Location, CreateLocationInput>({
            query: (body) => ({
                url: '/locations/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Location'],
        }),
        updateLocation: builder.mutation<Location, { id: number; data: Partial<CreateLocationInput> }>({
            query: ({ id, data }) => ({
                url: `/locations/${id}/`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Location'],
        }),
        deleteLocation: builder.mutation<void, number>({
            query: (id) => ({
                url: `/locations/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Location'],
        }),

        // Inventory Items
        getInventoryItems: builder.query<InventoryItem[], { category?: string; is_active?: boolean }>({
            query: (params) => ({
                url: '/inventory-items/',
                params,
            }),
            transformResponse: (response: any) => {
                if (response && response.results && Array.isArray(response.results)) return response.results;
                return Array.isArray(response) ? response : [];
            },
            providesTags: ['InventoryItem'],
        }),
        getInventoryItem: builder.query<InventoryItem, number>({
            query: (id) => `/inventory-items/${id}/`,
            providesTags: ['InventoryItem'],
        }),
        createInventoryItem: builder.mutation<InventoryItem, CreateInventoryItemInput>({
            query: (body) => ({
                url: '/inventory-items/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['InventoryItem'],
        }),
        updateInventoryItem: builder.mutation<InventoryItem, { id: number; data: Partial<CreateInventoryItemInput> }>({
            query: ({ id, data }) => ({
                url: `/inventory-items/${id}/`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['InventoryItem'],
        }),
        deleteInventoryItem: builder.mutation<void, number>({
            query: (id) => ({
                url: `/inventory-items/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['InventoryItem'],
        }),

        // Location Inventory (Stock)
        getLocationInventory: builder.query<LocationInventory[], { location_id?: number; item_id?: number; low_stock?: boolean } | void>({
            query: (params) => ({
                url: '/location-inventory/',
                params: params || undefined,
            }),
            transformResponse: (response: any) => {
                if (response && response.results && Array.isArray(response.results)) return response.results;
                return Array.isArray(response) ? response : [];
            },
            providesTags: ['LocationInventory'],
        }),
        createLocationInventory: builder.mutation<LocationInventory, CreateLocationInventoryInput>({
            query: (body) => ({
                url: '/location-inventory/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['LocationInventory'],
        }),
        updateLocationInventory: builder.mutation<LocationInventory, { id: number; data: Partial<CreateLocationInventoryInput> }>({
            query: ({ id, data }) => ({
                url: `/location-inventory/${id}/`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['LocationInventory'],
        }),
        deleteLocationInventory: builder.mutation<void, number>({
            query: (id) => ({
                url: `/location-inventory/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['LocationInventory'],
        }),

        // Property Inventory
        getPropertyInventory: builder.query<PropertyInventory[], { property_id?: number; item_id?: number }>({
            query: (params) => ({
                url: '/property-inventory/',
                params,
            }),
            transformResponse: (response: any) => {
                if (response && response.results && Array.isArray(response.results)) return response.results;
                return Array.isArray(response) ? response : [];
            },
            providesTags: ['PropertyInventory'],
        }),
        createPropertyInventory: builder.mutation<PropertyInventory, CreatePropertyInventoryInput>({
            query: (body) => ({
                url: '/property-inventory/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['PropertyInventory'],
        }),
        updatePropertyInventory: builder.mutation<PropertyInventory, { id: number; data: Partial<CreatePropertyInventoryInput> }>({
            query: ({ id, data }) => ({
                url: `/property-inventory/${id}/`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['PropertyInventory'],
        }),
        deletePropertyInventory: builder.mutation<void, number>({
            query: (id) => ({
                url: `/property-inventory/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['PropertyInventory'],
        }),

        // Apartment Inventory
        getApartmentInventory: builder.query<ApartmentInventory[], { apartment_id?: number; item_id?: number }>({
            query: (params) => ({
                url: '/apartment-inventory/',
                params,
            }),
            transformResponse: (response: any) => {
                if (response && response.results && Array.isArray(response.results)) return response.results;
                return Array.isArray(response) ? response : [];
            },
            providesTags: ['ApartmentInventory'],
        }),
        createApartmentInventory: builder.mutation<ApartmentInventory, CreateApartmentInventoryInput>({
            query: (body) => ({
                url: '/apartment-inventory/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['ApartmentInventory'],
        }),
        updateApartmentInventory: builder.mutation<ApartmentInventory, { id: number; data: Partial<CreateApartmentInventoryInput> }>({
            query: ({ id, data }) => ({
                url: `/apartment-inventory/${id}/`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['ApartmentInventory'],
        }),
        deleteApartmentInventory: builder.mutation<void, number>({
            query: (id) => ({
                url: `/apartment-inventory/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ApartmentInventory'],
        }),

        // Inventory Movements (Audit Trail)
        getInventoryMovements: builder.query<InventoryMovement[], { location_id?: number; item_id?: number; property_id?: number; apartment_id?: number; movement_type?: string }>({
            query: (params) => ({
                url: '/inventory-movements/',
                params,
            }),
            transformResponse: (response: any) => {
                if (response && response.results && Array.isArray(response.results)) return response.results;
                return Array.isArray(response) ? response : [];
            },
            providesTags: ['InventoryMovement'],
        }),
        createInventoryMovement: builder.mutation<InventoryMovement, CreateInventoryMovementInput>({
            query: (body) => ({
                url: '/inventory-movements/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['InventoryMovement', 'LocationInventory'],
        }),
    }),
});

export const {
    // Locations
    useGetLocationsQuery,
    useGetLocationQuery,
    useCreateLocationMutation,
    useUpdateLocationMutation,
    useDeleteLocationMutation,
    // Inventory Items
    useGetInventoryItemsQuery,
    useGetInventoryItemQuery,
    useCreateInventoryItemMutation,
    useUpdateInventoryItemMutation,
    useDeleteInventoryItemMutation,
    // Location Inventory
    useGetLocationInventoryQuery,
    useCreateLocationInventoryMutation,
    useUpdateLocationInventoryMutation,
    useDeleteLocationInventoryMutation,
    // Property Inventory
    useGetPropertyInventoryQuery,
    useCreatePropertyInventoryMutation,
    useUpdatePropertyInventoryMutation,
    useDeletePropertyInventoryMutation,
    // Apartment Inventory
    useGetApartmentInventoryQuery,
    useCreateApartmentInventoryMutation,
    useUpdateApartmentInventoryMutation,
    useDeleteApartmentInventoryMutation,
    // Inventory Movements
    useGetInventoryMovementsQuery,
    useCreateInventoryMovementMutation,
} = inventoryApi;
