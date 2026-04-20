'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import {
    useCreateInventoryMovementMutation,
    useGetLocationsQuery,
    useGetInventoryItemsQuery,
    useGetLocationInventoryQuery
} from '@/lib/store/api/inventoryApi';
import { useGetPropertiesQuery, useGetApartmentsQuery } from '@/lib/store/api/propertyApi';
import { toast } from 'sonner';

interface RecordMovementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RecordMovementModal({ isOpen, onClose }: RecordMovementModalProps) {
    const [createMovement, { isLoading }] = useCreateInventoryMovementMutation();
    const { data: locations } = useGetLocationsQuery({});
    const { data: items } = useGetInventoryItemsQuery({});
    const { data: propertiesData } = useGetPropertiesQuery({});
    const { data: apartmentsData } = useGetApartmentsQuery({});
    const { data: stock } = useGetLocationInventoryQuery({});

    const [formData, setFormData] = useState({
        location_id: '',
        item_id: '',
        property_id: '',
        apartment_id: '',
        movement_type: 'restock',
        quantity: 1,
        reason: '',
        performed_by: 'Admin' // Should be dynamic based on logged in user later
    });

    const movementTypes = [
        { value: 'restock', label: 'Restock (Add to Location)' },
        { value: 'assign', label: 'Assign to Property (Out)' },
        { value: 'return', label: 'Return from Property (In)' },
        { value: 'damaged', label: 'Report Damaged (Out)' },
        { value: 'disposed', label: 'Disposed/Written Off (Out)' },
        { value: 'client_request', label: 'Client Request (Out)' },
        { value: 'initial', label: 'Initial Stock Correction' },
    ];

    // Derive available quantity for selected location/item
    const availableStock = stock?.find(
        s => s.location === formData.location_id && s.item === formData.item_id
    )?.quantity || 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.location_id || !formData.item_id) {
            toast.error('Please select location and item');
            return;
        }

        try {
            await createMovement({
                location_id: formData.location_id,
                item_id: formData.item_id,
                property_id: formData.property_id || undefined,
                apartment_id: formData.apartment_id || undefined,
                movement_type: formData.movement_type,
                quantity: formData.quantity,
                reason: formData.reason,
                performed_by: formData.performed_by
            }).unwrap();

            toast.success('Inventory movement recorded successfully');
            setFormData({
                location_id: '',
                item_id: '',
                property_id: '',
                apartment_id: '',
                movement_type: 'restock',
                quantity: 1,
                reason: '',
                performed_by: 'Admin'
            });
            onClose();
        } catch (error: any) {
            console.error("Failed to record movement", error);
            toast.error(error.data?.detail || 'Failed to record movement: Check stock levels');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold text-gray-900">Record Inventory Movement</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                            <select
                                required
                                value={formData.movement_type}
                                onChange={e => setFormData({ ...formData, movement_type: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            >
                                {movementTypes.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Source Location</label>
                            <select
                                required
                                value={formData.location_id}
                                onChange={e => setFormData({ ...formData, location_id: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Select Location...</option>
                                {locations?.map((loc: any) => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                            <select
                                required
                                value={formData.item_id}
                                onChange={e => setFormData({ ...formData, item_id: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Select Item...</option>
                                {items?.map((item: any) => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Show available stock hint */}
                    {formData.location_id && formData.item_id && (
                        <div className="text-xs text-gray-500 flex justify-end">
                            Current Stock: <span className="font-semibold ml-1">{availableStock}</span>
                        </div>
                    )}

                    {/* Show Property Select if needed */}
                    {['assign', 'return', 'client_request'].includes(formData.movement_type) && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Building (Property)</label>
                                <select
                                    value={formData.property_id}
                                    onChange={e => setFormData({ ...formData, property_id: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">Select Property...</option>
                                    {propertiesData?.results?.map((prop: any) => (
                                        <option key={prop.id} value={prop.id}>{prop.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Unit (Apartment)</label>
                                <select
                                    value={formData.apartment_id}
                                    onChange={e => setFormData({ ...formData, apartment_id: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    disabled={!apartmentsData}
                                >
                                    <option value="">Select Apartment...</option>
                                    {apartmentsData?.results?.map((apt: any) => (
                                        <option key={apt.id} value={apt.id}>{apt.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Notes</label>
                        <textarea
                            required
                            value={formData.reason}
                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="Why is this movement happening?"
                            rows={2}
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Record Movement
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
