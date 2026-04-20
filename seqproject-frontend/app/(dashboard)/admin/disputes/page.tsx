'use client';

import { useState } from 'react';
import { useGetDisputesQuery, type BookingDispute } from '@/lib/store/api/disputesApi';
import { DataTable } from '@/components/admin/DataTable';
import { AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';

export default function DisputesPage() {
    const [statusFilter, setStatusFilter] = useState<string>('');
    const { data: disputes, isLoading } = useGetDisputesQuery(
        statusFilter ? { status: statusFilter } : {}
    );

    const columns = [
        {
            header: 'Booking',
            accessor: 'booking_details' as const,
            render: (booking: any) => (
                <div>
                    <span className="font-mono text-xs text-gray-500">{booking.booking_id}</span>
                    <div className="font-medium">{booking.name}</div>
                </div>
            )
        },
        {
            header: 'Type',
            accessor: 'dispute_type_display' as const,
            render: (type: string) => <span className="font-medium">{type}</span>
        },
        {
            header: 'Status',
            accessor: 'status' as const,
            render: (status: string) => {
                let colorClass = 'bg-gray-100 text-gray-800';
                if (status === 'open') colorClass = 'bg-red-100 text-red-800';
                if (status === 'in_progress') colorClass = 'bg-yellow-100 text-yellow-800';
                if (status === 'resolved') colorClass = 'bg-green-100 text-green-800';
                if (status === 'closed') colorClass = 'bg-gray-100 text-gray-800';

                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${colorClass}`}>
                        {status.replace('_', ' ')}
                    </span>
                );
            }
        },
        {
            header: 'Description',
            accessor: 'description' as const,
            render: (desc: string) => <span className="truncate max-w-xs block" title={desc}>{desc}</span>
        },
        {
            header: 'Created',
            accessor: 'created_at' as const,
            render: (date: string) => new Date(date).toLocaleDateString()
        },
    ];

    if (isLoading) return <div className="text-center py-10">Loading disputes...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dispute Resolution</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and resolve booking disputes</p>
                </div>

                <div className="flex gap-2">
                    <select
                        className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Open Disputes</p>
                        <h3 className="text-2xl font-bold">
                            {disputes?.filter(d => d.status === 'open').length || 0}
                        </h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">In Progress</p>
                        <h3 className="text-2xl font-bold">
                            {disputes?.filter(d => d.status === 'in_progress').length || 0}
                        </h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Resolved</p>
                        <h3 className="text-2xl font-bold">
                            {disputes?.filter(d => d.status === 'resolved').length || 0}
                        </h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Disputes</p>
                        <h3 className="text-2xl font-bold">{disputes?.length || 0}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <DataTable
                    data={disputes || []}
                    columns={columns}
                    searchPlaceholder="Search disputes..."
                    actions={(row: BookingDispute) => (
                        <button className="text-sm text-primary hover:text-primary-dark font-medium underline">
                            View Details
                        </button>
                    )}
                />
            </div>
        </div>
    );
}
