'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useCreateLocationInventoryMutation, useGetLocationsQuery, useGetInventoryItemsQuery } from '@/lib/store/api/inventoryApi';
import { toast } from 'sonner';

interface AddStockModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddStockModal({ isOpen, onClose }: AddStockModalProps) {
    const [createStock, { isLoading }] = useCreateLocationInventoryMutation();
    const { data: locations } = useGetLocationsQuery({});
    const { data: items } = useGetInventoryItemsQuery({});

    const [formData, setFormData] = useState({
        location_id: '',
        item_id: '',
        quantity: 1,
        min_threshold: 5
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.location_id || !formData.item_id) {
            toast.error('Please select location and item');
            return;
        }

        try {
            await createStock({
                location_id: formData.location_id,
                item_id: formData.item_id,
                quantity: formData.quantity,
                min_threshold: formData.min_threshold
            }).unwrap();

            toast.success('Stock added successfully');
            setFormData({ location_id: '', item_id: '', quantity: 1, min_threshold: 5 });
            onClose();
        } catch (error: any) {
            console.error("Failed to add stock", error);
            toast.error(error.data?.detail || 'Failed to add stock (Item might already exist at this location)');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold text-gray-900">Add New Stock</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
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
                                <option key={item.id} value={item.id}>{item.name} ({item.category})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Quantity</label>
                            <input
                                type="number"
                                min="0"
                                required
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Threshold</label>
                            <input
                                type="number"
                                min="0"
                                required
                                value={formData.min_threshold}
                                onChange={e => setFormData({ ...formData, min_threshold: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
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
                            Add Stock
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
