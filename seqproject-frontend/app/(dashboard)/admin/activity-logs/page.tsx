'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    Search,
    RefreshCw,
    AlertCircle,
    User,
    Clock,
    Globe,
    FileText,
    Eye,
    Filter,
    Calendar,
} from 'lucide-react';
import {
    useGetActivityLogsQuery,
    ApiActivityLog,
} from '@/lib/store/api/adminApi';

const ACTION_COLORS: Record<string, string> = {
    create: 'bg-green-100 text-green-800',
    read: 'bg-blue-100 text-blue-800',
    update: 'bg-yellow-100 text-yellow-800',
    delete: 'bg-red-100 text-red-800',
    login: 'bg-purple-100 text-purple-800',
    logout: 'bg-gray-100 text-gray-800',
    export: 'bg-indigo-100 text-indigo-800',
    other: 'bg-gray-100 text-gray-600',
};

const METHOD_COLORS: Record<string, string> = {
    POST: 'text-green-600',
    GET: 'text-blue-600',
    PUT: 'text-yellow-600',
    PATCH: 'text-orange-600',
    DELETE: 'text-red-600',
};

export default function ActivityLogsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [filterResource, setFilterResource] = useState('');
    const [selectedLog, setSelectedLog] = useState<ApiActivityLog | null>(null);

    // RTK Query hooks
    const { data: logsData, isLoading, error, refetch } = useGetActivityLogsQuery({
        search: searchTerm || undefined,
        action: filterAction || undefined,
        resource_type: filterResource || undefined,
        page_size: 50,
    });

    const logs = logsData?.results || [];

    // Get unique resource types for filter
    const resourceTypes = [...new Set(logs.map(l => l.resource_type).filter(Boolean))];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Activity Logs</h1>
                    <p className="text-gray-600 mt-1">Monitor all user activity and system changes</p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Error loading activity logs. You may not have permission to view logs.</span>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total Entries</p>
                        <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{logsData?.count || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Creates</p>
                        <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{logs.filter(l => l.action === 'create').length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Updates</p>
                        <FileText className="h-5 w-5 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{logs.filter(l => l.action === 'update').length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Deletes</p>
                        <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{logs.filter(l => l.action === 'delete').length}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="">All Actions</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                </select>
                <select
                    value={filterResource}
                    onChange={(e) => setFilterResource(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="">All Resources</option>
                    {resourceTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            {/* Logs List */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading activity logs...</p>
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <Activity className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-xl text-gray-600 mb-2">No activity logs found</p>
                    <p className="text-gray-500">User actions will appear here automatically</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {logs.map((log, index) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`p-2 rounded-lg ${ACTION_COLORS[log.action] || ACTION_COLORS.other}`}>
                                        <Activity className="h-4 w-4" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${ACTION_COLORS[log.action] || ACTION_COLORS.other}`}>
                                                        {log.action.toUpperCase()}
                                                    </span>
                                                    <span className="ml-2">{log.resource_type}</span>
                                                    {log.resource_id && (
                                                        <span className="text-gray-500 text-sm ml-1">#{log.resource_id.slice(0, 8)}</span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">{log.description || 'No description'}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-sm text-gray-500">{getRelativeTime(log.created_at)}</p>
                                                <p className="text-xs text-gray-400">{formatDate(log.created_at)}</p>
                                            </div>
                                        </div>

                                        {/* Meta */}
                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {log.user_name || log.user_email || 'Anonymous'}
                                            </span>
                                            <span className={`flex items-center gap-1 font-mono ${METHOD_COLORS[log.method] || ''}`}>
                                                {log.method}
                                            </span>
                                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                                                <Globe className="h-3 w-3" />
                                                {log.endpoint}
                                            </span>
                                            {log.ip_address && (
                                                <span className="text-gray-400">{log.ip_address}</span>
                                            )}
                                        </div>

                                        {/* Expanded Details */}
                                        {selectedLog?.id === log.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="mt-4 p-4 bg-gray-50 rounded-lg text-sm"
                                            >
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-gray-500 mb-1">User Agent</p>
                                                        <p className="text-gray-700 text-xs font-mono break-all">{log.user_agent || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 mb-1">Status Code</p>
                                                        <p className="text-gray-700">{log.status_code || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                {log.details && Object.keys(log.details).length > 0 && (
                                                    <div className="mt-4">
                                                        <p className="text-gray-500 mb-1">Details</p>
                                                        <pre className="text-xs font-mono bg-gray-100 p-2 rounded overflow-x-auto">
                                                            {JSON.stringify(log.details, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Expand Icon */}
                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                        <Eye className="h-4 w-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
