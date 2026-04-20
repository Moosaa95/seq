'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Search,
    Plus,
    Edit,
    Trash2,
    RefreshCw,
    X,
    Users,
    Check,
    AlertCircle,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import {
    useGetRolesQuery,
    useGetPermissionsQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
    ApiUserRole,
} from '@/lib/store/api/adminApi';
import { toast } from 'sonner';

interface RoleFormData {
    name: string;
    description: string;
    permissions: string[];
    is_superuser_role: boolean;
    is_default: boolean;
}

export default function RolesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<ApiUserRole | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [formData, setFormData] = useState<RoleFormData>({
        name: '',
        description: '',
        permissions: [],
        is_superuser_role: false,
        is_default: false,
    });

    // RTK Query hooks
    const { data: rolesData, isLoading, error, refetch } = useGetRolesQuery({ search: searchTerm || undefined });
    const { data: permissionsData } = useGetPermissionsQuery();
    const [createRole, { isLoading: creating }] = useCreateRoleMutation();
    const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();
    const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();

    const roles = rolesData?.results || [];
    const permissionGroups = permissionsData?.data?.groups || {};

    const handleOpenModal = (role?: ApiUserRole) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                name: role.name,
                description: role.description,
                permissions: role.permissions,
                is_superuser_role: role.is_superuser_role,
                is_default: role.is_default,
            });
            // Expand all groups that have selected permissions
            const groups = Object.keys(permissionGroups).filter(group =>
                permissionGroups[group].some(p => role.permissions.includes(p))
            );
            setExpandedGroups(groups);
        } else {
            setEditingRole(null);
            setFormData({
                name: '',
                description: '',
                permissions: [],
                is_superuser_role: false,
                is_default: false,
            });
            setExpandedGroups([]);
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRole) {
                await updateRole({ id: editingRole.id, data: formData }).unwrap();
                toast.success('Role updated successfully!');
            } else {
                await createRole(formData).unwrap();
                toast.success('Role created successfully!');
            }
            setShowModal(false);
        } catch (err: any) {
            console.error('Error saving role:', err);
            toast.error(err?.data?.detail || err?.data?.message || 'Failed to save role');
        }
    };

    const handleDelete = async (roleId: string) => {
        if (window.confirm('Are you sure you want to delete this role?')) {
            try {
                await deleteRole(roleId).unwrap();
                toast.success('Role deleted successfully');
            } catch (err: any) {
                console.error('Error deleting role:', err);
                toast.error(err?.data?.detail || err?.data?.message || 'Failed to delete role');
            }
        }
    };

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev =>
            prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
        );
    };

    const togglePermission = (permission: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission],
        }));
    };

    const toggleGroupPermissions = (group: string) => {
        const groupPerms = permissionGroups[group] || [];
        const allSelected = groupPerms.every(p => formData.permissions.includes(p));

        setFormData(prev => ({
            ...prev,
            permissions: allSelected
                ? prev.permissions.filter(p => !groupPerms.includes(p))
                : [...new Set([...prev.permissions, ...groupPerms])],
        }));
    };

    const formatPermissionLabel = (permission: string) => {
        const action = permission.split(':')[1] || permission;
        return action.charAt(0).toUpperCase() + action.slice(1);
    };

    const formatGroupLabel = (group: string) => {
        return group.charAt(0).toUpperCase() + group.slice(1);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Role Management</h1>
                    <p className="text-gray-600 mt-1">Manage roles and their permissions</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => refetch()}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add Role
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Error loading roles</span>
                </div>
            )}

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search roles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Roles Grid */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading roles...</p>
                </div>
            ) : roles.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-xl text-gray-600 mb-2">No roles found</p>
                    <p className="text-gray-500">Create your first role to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map((role, index) => (
                        <motion.div
                            key={role.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${role.is_superuser_role ? 'bg-red-100' : 'bg-purple-100'}`}>
                                        <Shield className={`h-5 w-5 ${role.is_superuser_role ? 'text-red-600' : 'text-purple-600'}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{role.name}</h3>
                                        {role.is_superuser_role && (
                                            <span className="text-xs text-red-600 font-medium">Superuser</span>
                                        )}
                                        {role.is_default && !role.is_superuser_role && (
                                            <span className="text-xs text-emerald-600 font-medium">Default</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleOpenModal(role)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(role.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{role.description || 'No description'}</p>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1 text-gray-500">
                                    <Users className="h-4 w-4" />
                                    <span>{role.user_count || 0} users</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-500">
                                    <Check className="h-4 w-4" />
                                    <span>{role.is_superuser_role ? 'All' : (role.permissions?.length || 0)} permissions</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 border-b">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {editingRole ? 'Edit Role' : 'Create New Role'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                                <div className="p-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                            placeholder="e.g., Property Manager"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                            rows={2}
                                            placeholder="Describe what this role can do..."
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_superuser_role}
                                                onChange={(e) => setFormData({ ...formData, is_superuser_role: e.target.checked })}
                                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span className="text-sm text-gray-700">Superuser Role (All Permissions)</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_default}
                                                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span className="text-sm text-gray-700">Default Role</span>
                                        </label>
                                    </div>

                                    {/* Permissions */}
                                    {!formData.is_superuser_role && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                                            <div className="border border-gray-200 rounded-lg divide-y">
                                                {Object.entries(permissionGroups).map(([group, perms]) => (
                                                    <div key={group}>
                                                        <div
                                                            onClick={() => toggleGroup(group)}
                                                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {expandedGroups.includes(group) ? (
                                                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                                                ) : (
                                                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                                                )}
                                                                <span className="font-medium text-gray-900">{formatGroupLabel(group)}</span>
                                                                <span className="text-xs text-gray-500">
                                                                    ({(perms as string[]).filter(p => formData.permissions.includes(p)).length}/{(perms as string[]).length})
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleGroupPermissions(group);
                                                                }}
                                                                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                                                            >
                                                                Toggle All
                                                            </button>
                                                        </div>

                                                        {expandedGroups.includes(group) && (
                                                            <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                                                                {(perms as string[]).map((permission) => (
                                                                    <label
                                                                        key={permission}
                                                                        className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer p-2 hover:bg-gray-50 rounded"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={formData.permissions.includes(permission)}
                                                                            onChange={() => togglePermission(permission)}
                                                                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                                        />
                                                                        {formatPermissionLabel(permission)}
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 p-4 border-t bg-gray-50">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating || updating}
                                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        {creating || updating ? 'Saving...' : 'Save Role'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
