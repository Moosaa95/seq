'use client';

import { useState } from 'react';
import {
    useGetLocationsQuery,
    useGetInventoryItemsQuery,
    useGetLocationInventoryQuery,
    useGetPropertyInventoryQuery,
    useGetApartmentInventoryQuery,
    useGetInventoryMovementsQuery,
    type Location,
    type InventoryItem,
    type LocationInventory,
    type PropertyInventory,
    type ApartmentInventory,
    type InventoryMovement
} from '@/lib/store/api/inventoryApi';
import { DataTable } from '@/components/admin/DataTable';
import { Plus, Eye, Edit, Trash, Box, Home, Truck } from 'lucide-react';

import AddLocationModal from '@/components/admin/inventory/AddLocationModal';
import AddItemModal from '@/components/admin/inventory/AddItemModal';

import AddStockModal from '@/components/admin/inventory/AddStockModal';
import RecordMovementModal from '@/components/admin/inventory/RecordMovementModal';

export default function InventoryPage() {
    const [activeTab, setActiveTab] = useState<'locations' | 'items' | 'stock' | 'property' | 'apartment' | 'movements'>('locations');
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    console.log(activeTab);
    return (
        <div className="space-y-6">
            <AddLocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
            <AddItemModal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} />
            <AddStockModal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} />
            <RecordMovementModal isOpen={isMovementModalOpen} onClose={() => setIsMovementModalOpen(false)} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage locations, items, stock levels, and audit trail</p>
                </div>

                {/* Action buttons based on active tab */}
                <div className="flex gap-2">
                    {activeTab === 'locations' && (
                        <button
                            onClick={() => setIsLocationModalOpen(true)}
                            className="bg-blue-600 hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Location
                        </button>
                    )}
                    {activeTab === 'items' && (
                        <button
                            onClick={() => setIsItemModalOpen(true)}
                            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            New Item
                        </button>
                    )}
                    {activeTab === 'stock' && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsMovementModalOpen(true)}
                                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                            >
                                <Truck className="w-4 h-4" />
                                Record Movement
                            </button>
                            <button
                                onClick={() => setIsStockModalOpen(true)}
                                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Init Stock
                            </button>
                        </div>
                    )}
                    {(activeTab === 'movements' || activeTab === 'property') && (
                        <button
                            onClick={() => setIsMovementModalOpen(true)}
                            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Record Movement
                        </button>
                    )}
                    {/* Add more buttons for other tabs later */}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {[
                        { id: 'locations', name: 'Locations', icon: <Home className="w-4 h-4" /> },
                        { id: 'items', name: 'Items', icon: <Box className="w-4 h-4" /> },
                        { id: 'stock', name: 'Stock Levels', icon: <Box className="w-4 h-4" /> },
                        { id: 'property', name: 'Building Inventory', icon: <Home className="w-4 h-4" /> },
                        { id: 'apartment', name: 'Apartment Inventory', icon: <Home className="w-4 h-4" /> },
                        { id: 'movements', name: 'Audit Trail', icon: <Truck className="w-4 h-4" /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                ${activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
              `}
                        >
                            {tab.icon}
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px]">
                {activeTab === 'locations' && <LocationsTab />}
                {activeTab === 'items' && <ItemsTab />}
                {activeTab === 'stock' && <StockTab />}
                {activeTab === 'property' && <PropertyInventoryTab />}
                {activeTab === 'apartment' && <ApartmentInventoryTab />}
                {activeTab === 'movements' && <MovementsTab />}
            </div>
        </div>
    );
}

// Tab Components (Placeholders for now, will implement one by one)

function LocationsTab() {
    const { data: locations, isLoading } = useGetLocationsQuery({});

    const columns = [
        {
            header: 'Name',
            accessorKey: 'name',
            cell: ({ getValue }: any) => <span className="font-medium text-gray-900">{getValue()}</span>
        },
        {
            header: 'Address',
            accessorKey: 'address',
            cell: ({ getValue }: any) => <span className="text-gray-600 block max-w-xs truncate" title={getValue() || ''}>{getValue() || '-'}</span>
        },
        {
            header: 'State',
            accessorKey: 'state_name',
            cell: ({ getValue }: any) => <span className="text-gray-700">{getValue() || '-'}</span>
        },
        {
            header: 'Country',
            accessorKey: 'country_name',
            cell: ({ getValue }: any) => <span className="text-gray-700">{getValue() || '-'}</span>
        },
        {
            header: 'Status',
            accessorKey: 'is_active',
            cell: ({ getValue }: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getValue() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {getValue() ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: 'Items',
            accessorKey: 'inventory_count',
            cell: ({ getValue }: any) => <span className="font-mono text-gray-900">{getValue() || 0}</span>
        },
    ];

    if (isLoading) return <div className="text-center py-10">Loading locations...</div>;

    return (
        <DataTable
            data={locations || []}
            columns={columns}
            searchPlaceholder="Search locations..."
            actions={(row: Location) => (
                <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded text-blue-600" title="Edit">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded text-red-600" title="Delete">
                        <Trash className="w-4 h-4" />
                    </button>
                </div>
            )}
        />
    );
}

function ItemsTab() {
    const { data: items, isLoading } = useGetInventoryItemsQuery({});

    const columns = [
        {
            header: 'Name',
            accessorKey: 'name',
            cell: ({ getValue }: any) => <span className="font-medium text-gray-900">{getValue()}</span>
        },
        {
            header: 'Category',
            accessorKey: 'category',
            cell: ({ getValue }: any) => <span className="text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs uppercase tracking-wide">{getValue()}</span>
        },
        {
            header: 'Unit',
            accessorKey: 'unit',
            cell: ({ getValue }: any) => <span className="text-gray-600 text-sm">{getValue()}</span>
        },
        {
            header: 'Status',
            accessorKey: 'is_active',
            cell: ({ getValue }: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getValue() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {getValue() ? 'Active' : 'Inactive'}
                </span>
            )
        },
    ];

    if (isLoading) return <div className="text-center py-10">Loading items...</div>;

    return (
        <DataTable
            data={items || []}
            columns={columns}
            searchPlaceholder="Search items..."
            actions={(row: InventoryItem) => (
                <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded text-blue-600" title="Edit">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded text-red-600" title="Delete">
                        <Trash className="w-4 h-4" />
                    </button>
                </div>
            )}
        />
    );
}

function StockTab() {
    const { data: stock, isLoading } = useGetLocationInventoryQuery({});

    const columns = [
        {
            header: 'Location',
            accessorKey: 'location_details',
            cell: ({ getValue }: any) => {
                const loc = getValue();
                return <span className="font-medium text-gray-900">{loc?.name || 'Unknown Location'}</span>;
            }
        },
        {
            header: 'Item',
            accessorKey: 'item_details',
            cell: ({ getValue }: any) => {
                const item = getValue();
                return (
                    <div>
                        <span className="block font-medium text-gray-900">{item?.name || 'Unknown Item'}</span>
                        <span className="text-xs text-gray-500">{item?.category}</span>
                    </div>
                );
            }
        },
        {
            header: 'Quantity',
            accessorKey: 'quantity',
            cell: ({ getValue, row }: any) => (
                <span className={`font-mono font-bold ${row.original.is_low_stock ? 'text-red-600' : 'text-green-600'}`}>
                    {getValue()}
                </span>
            )
        },
        {
            header: 'Threshold',
            accessorKey: 'min_threshold',
        },
        {
            header: 'Status',
            accessorKey: 'is_low_stock',
            cell: ({ getValue }: any) => (
                getValue() ?
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Low Stock</span> :
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">OK</span>
            )
        }
    ];

    if (isLoading) return <div className="text-center py-10">Loading stock data...</div>;

    return (
        <DataTable
            data={stock || []}
            columns={columns}
            searchPlaceholder="Search stock..."
            actions={(row: LocationInventory) => (
                <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded text-blue-600" title="Update Stock">
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
            )}
        />
    );
}

function PropertyInventoryTab() {
    const { data: propInv, isLoading } = useGetPropertyInventoryQuery({});

    const columns = [
        {
            header: 'Building (Property)',
            accessorKey: 'property_details',
            cell: ({ getValue }: any) => {
                const prop = getValue();
                return <span className="font-medium">{prop?.title || '-'}</span>;
            }
        },
        {
            header: 'Item',
            accessorKey: 'item_details',
            cell: ({ getValue }: any) => {
                const item = getValue();
                return <span>{item?.name || '-'}</span>;
            }
        },
        {
            header: 'Quantity',
            accessorKey: 'quantity',
        },
    ];

    if (isLoading) return <div className="text-center py-10">Loading building inventory...</div>;

    return (
        <DataTable
            data={propInv || []}
            columns={columns}
            searchPlaceholder="Search building inventory..."
            actions={(row: PropertyInventory) => (
                <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded text-blue-600" title="Edit">
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
            )}
        />
    );
}

function ApartmentInventoryTab() {
    const { data: aptInv, isLoading } = useGetApartmentInventoryQuery({});

    const columns = [
        {
            header: 'Apartment Unit',
            accessorKey: 'apartment_details',
            cell: ({ getValue }: any) => {
                const apt = getValue();
                return <span className="font-medium">{apt?.title || '-'}</span>;
            }
        },
        {
            header: 'Item',
            accessorKey: 'item_details',
            cell: ({ getValue }: any) => {
                const item = getValue();
                return <span>{item?.name || '-'}</span>;
            }
        },
        {
            header: 'Quantity',
            accessorKey: 'quantity',
        },
    ];

    if (isLoading) return <div className="text-center py-10">Loading apartment inventory...</div>;

    return (
        <DataTable
            data={aptInv || []}
            columns={columns}
            searchPlaceholder="Search apartment inventory..."
            actions={(row: ApartmentInventory) => (
                <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded text-blue-600" title="Edit">
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
            )}
        />
    );
}

function MovementsTab() {
    const { data: movements, isLoading } = useGetInventoryMovementsQuery({});

    const columns = [
        {
            header: 'Date',
            accessorKey: 'created_at',
            cell: ({ getValue }: any) => new Date(getValue()).toLocaleString()
        },
        {
            header: 'Type',
            accessorKey: 'movement_type_display',
            cell: ({ getValue }: any) => <span className="text-xs font-medium uppercase bg-gray-100 px-2 py-1 rounded">{getValue()}</span>
        },
        {
            header: 'Details',
            accessorKey: 'id',
            cell: ({ row }: any) => (
                <div className="text-sm">
                    <span className="font-medium">{row.original.item_details?.name}</span> at {row.original.location_details?.name}
                    {row.original.property_details && <span className="text-gray-500"> → {row.original.property_details.title}</span>}
                </div>
            )
        },
        {
            header: 'Quantity',
            accessorKey: 'quantity',
            cell: ({ getValue }: any) => {
                const qty = getValue();
                return (
                    <span className={`font-mono font-bold ${qty > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {qty > 0 ? `+${qty}` : qty}
                    </span>
                );
            }
        },
        {
            header: 'Reason',
            accessorKey: 'reason',
        },
        {
            header: 'User',
            accessorKey: 'performed_by',
        },
    ];

    if (isLoading) return <div className="text-center py-10">Loading audit trail...</div>;

    return (
        <DataTable
            data={movements || []}
            columns={columns}
            searchPlaceholder="Search movements..."
        />
    );
}

