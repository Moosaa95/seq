'use client';

import { useState, useEffect } from 'react';
import {
    Calendar,
    RefreshCw,
    Trash2,
    Plus,
    Copy,
    Check,
    AlertCircle,
    ExternalLink,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useGetExternalCalendarsQuery, useCreateExternalCalendarMutation, useDeleteExternalCalendarMutation, useSyncExternalCalendarMutation, ExternalCalendar, CalendarSource } from '@/lib/store/api/calendarApi';

interface CalendarSyncCardProps {
    propertyId: string;
    propertyTitle: string;
}

const SOURCE_OPTIONS: { value: CalendarSource; label: string; icon: string }[] = [
    { value: 'airbnb', label: 'Airbnb', icon: '🏠' },
    { value: 'booking_com', label: 'Booking.com', icon: '🅱️' },
    { value: 'vrbo', label: 'VRBO', icon: '🏡' },
    { value: 'other', label: 'Other', icon: '📅' },
];

const getSourceIcon = (source: CalendarSource) => {
    const option = SOURCE_OPTIONS.find((o) => o.value === source);
    return option?.icon || '📅';
};

export default function CalendarSyncCard({ propertyId, propertyTitle }: CalendarSyncCardProps) {
    const { data, isLoading } = useGetExternalCalendarsQuery(propertyId);
    const [createCalendar, { isLoading: isCreating }] = useCreateExternalCalendarMutation();
    const [deleteCalendar] = useDeleteExternalCalendarMutation();
    const [syncCalendar, { isLoading: isSyncing }] = useSyncExternalCalendarMutation();

    const calendars = data?.results || [];

    const [showAddForm, setShowAddForm] = useState(false);
    const [newSource, setNewSource] = useState<CalendarSource>('airbnb');
    const [newIcalUrl, setNewIcalUrl] = useState('');
    const [syncingId, setSyncingId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Export URL for this property
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const exportUrl = `${API_BASE_URL}/apartments/${propertyId}/ical/`;

    const handleCopyExportUrl = async () => {
        try {
            await navigator.clipboard.writeText(exportUrl);
            setCopied(true);
            toast.success('Export URL copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy URL');
        }
    };

    const handleAddCalendar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newIcalUrl.trim()) {
            toast.error('Please enter an iCal URL');
            return;
        }

        try {
            await createCalendar({
                apartment_id: propertyId,
                source: newSource,
                ical_url: newIcalUrl,
                is_active: true,
            }).unwrap();

            toast.success('Calendar added successfully');
            setShowAddForm(false);
            setNewIcalUrl('');
        } catch (error: any) {
            console.error('Error adding calendar:', error);
            toast.error(error?.data?.detail || 'Failed to add calendar');
        }
    };

    const handleSync = async (id: string) => {
        try {
            setSyncingId(id);
            const result = await syncCalendar(id).unwrap();
            const total = result.created + result.updated;
            if (result.errors && result.errors.length > 0) {
                toast.warning(`Synced ${total} dates with some errors`);
                console.warn('Sync errors:', result.errors);
            } else {
                toast.success(`Synced: ${result.created} new, ${result.updated} updated`);
            }
        } catch (error: any) {
            console.error('Error syncing calendar:', error);
            toast.error(error?.data?.detail || 'Failed to sync calendar');
        } finally {
            setSyncingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this calendar link?')) {
            return;
        }

        try {
            await deleteCalendar(id).unwrap();
            toast.success('Calendar removed');
        } catch (error: any) {
            console.error('Error deleting calendar:', error);
            toast.error(error?.data?.detail || 'Failed to remove calendar');
        }
    };

    const formatLastSynced = (date: string | null) => {
        if (!date) return 'Never';
        const d = new Date(date);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                Calendar Sync
            </h2>

            {/* Export URL Section */}
            <div className="mb-5">
                <p className="text-sm text-gray-600 mb-2">Export this calendar to Airbnb/Booking.com:</p>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={exportUrl}
                        readOnly
                        className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-600 truncate"
                    />
                    <button
                        onClick={handleCopyExportUrl}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Copy URL"
                    >
                        {copied ? (
                            <Check className="h-4 w-4 text-green-600" />
                        ) : (
                            <Copy className="h-4 w-4 text-gray-600" />
                        )}
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4" />

            {/* Connected Calendars */}
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Connected Calendars</p>
                {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    </div>
                ) : calendars.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">No calendars connected yet</p>
                ) : (
                    <div className="space-y-3">
                        {calendars.map((cal) => (
                            <div
                                key={cal.id}
                                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{getSourceIcon(cal.source)}</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {cal.source_display}
                                        </span>
                                        {cal.sync_errors && (
                                            <span title={cal.sync_errors}>
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate mt-1" title={cal.ical_url}>
                                        {cal.ical_url}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Last synced: {formatLastSynced(cal.last_synced)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                    <button
                                        onClick={() => handleSync(cal.id)}
                                        disabled={syncingId === cal.id}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                                        title="Sync now"
                                    >
                                        {syncingId === cal.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <RefreshCw className="h-4 w-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cal.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remove"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Calendar Form */}
            {showAddForm ? (
                <form onSubmit={handleAddCalendar} className="space-y-3 p-3 bg-emerald-50 rounded-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Source
                        </label>
                        <select
                            value={newSource}
                            onChange={(e) => setNewSource(e.target.value as CalendarSource)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            {SOURCE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.icon} {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            iCal URL
                        </label>
                        <input
                            type="url"
                            value={newIcalUrl}
                            onChange={(e) => setNewIcalUrl(e.target.value)}
                            placeholder="https://www.airbnb.com/calendar/ical/..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium transition-colors"
                        >
                            {isCreating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    Add
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add iCal Link
                </button>
            )}
        </div>
    );
}
