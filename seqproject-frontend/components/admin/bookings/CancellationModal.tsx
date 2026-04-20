'use client';

import { useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { useUpdateBookingMutation } from '@/lib/store/api/adminApi';
import { toast } from 'sonner';

interface CancellationModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: string;
    onSuccess: () => void;
}

export default function CancellationModal({ isOpen, onClose, bookingId, onSuccess }: CancellationModalProps) {
    const [updateBooking, { isLoading }] = useUpdateBookingMutation();
    const [reason, setReason] = useState('');

    const handleConfirm = async () => {
        if (!reason.trim()) {
            toast.error("Please provide a reason for cancellation");
            return;
        }

        try {
            await updateBooking({
                id: bookingId,
                data: {
                    status: 'cancelled',
                    cancellation_reason: reason
                }
            }).unwrap();

            toast.success('Booking cancelled successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Failed to cancel booking", error);
            toast.error('Failed to cancel booking');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-red-100">
                <div className="flex items-center justify-between p-4 border-b border-red-100 bg-red-50 rounded-t-xl">
                    <div className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-5 w-5" />
                        <h2 className="text-lg font-bold">Cancel Booking?</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-red-100 rounded-full text-red-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <p className="text-gray-600 text-sm">
                        Are you sure you want to cancel this booking? This action cannot be undone.
                        Please provide a reason for the record.
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Cancellation</label>
                        <textarea
                            required
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 min-h-[100px]"
                            placeholder="e.g. Client requested cancellation, Payment failed..."
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            Keep Booking
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Confirm Cancellation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
