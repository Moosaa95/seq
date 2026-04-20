'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Filter,
  Mail,
  Phone,
  User,
  CheckCircle,
  XCircle,
  RefreshCw,
  Building2,
  Calendar
} from 'lucide-react';
import {
  useGetContactInquiriesQuery,
  useGetPropertyInquiriesQuery,
  useUpdateContactInquiryMutation,
  useUpdatePropertyInquiryMutation
} from '@/lib/store/api/adminApi';

export default function InquiriesPage() {
  const {
    data: contactData,
    isLoading: contactLoading,
    error: contactError,
    refetch: refetchContacts
  } = useGetContactInquiriesQuery({ page_size: 100 });

  const {
    data: propertyData,
    isLoading: propertyLoading,
    error: propertyError,
    refetch: refetchProperties
  } = useGetPropertyInquiriesQuery({ page_size: 100 });

  const contactInquiries = contactData?.results || [];
  const propertyInquiries = propertyData?.results || [];

  const [updateContactInquiry] = useUpdateContactInquiryMutation();
  const [updatePropertyInquiry] = useUpdatePropertyInquiryMutation();

  const [activeTab, setActiveTab] = useState<'contact' | 'property'>('contact');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleRefresh = () => {
    refetchContacts();
    refetchProperties();
  };

  const handleMarkAsRead = async (id: string, type: 'contact' | 'property') => {
    try {
      if (type === 'contact') {
        await updateContactInquiry({ inquiryId: id, data: { is_read: true } }).unwrap();
      } else {
        await updatePropertyInquiry({ inquiryId: id, data: { is_read: true } }).unwrap();
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAsResponded = async (id: string, type: 'contact' | 'property') => {
    try {
      if (type === 'contact') {
        await updateContactInquiry({ inquiryId: id, data: { responded: true } }).unwrap();
      } else {
        await updatePropertyInquiry({ inquiryId: id, data: { responded: true } }).unwrap();
      }
    } catch (error) {
      console.error('Failed to mark as responded:', error);
    }
  };

  const filteredContactInquiries = contactInquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'unread' && !inquiry.is_read) ||
      (statusFilter === 'read' && inquiry.is_read) ||
      (statusFilter === 'responded' && inquiry.responded) ||
      (statusFilter === 'pending' && !inquiry.responded);

    return matchesSearch && matchesStatus;
  });

  const filteredPropertyInquiries = propertyInquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.apartment_details.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'unread' && !inquiry.is_read) ||
      (statusFilter === 'read' && inquiry.is_read) ||
      (statusFilter === 'responded' && inquiry.responded) ||
      (statusFilter === 'pending' && !inquiry.responded);

    return matchesSearch && matchesStatus;
  });

  const loading = activeTab === 'contact' ? contactLoading : propertyLoading;
  const error = activeTab === 'contact' ? contactError : propertyError;

  const contactStats = {
    total: contactInquiries.length,
    unread: contactInquiries.filter((i) => !i.is_read).length,
    responded: contactInquiries.filter((i) => i.responded).length,
  };

  const propertyStats = {
    total: propertyInquiries.length,
    unread: propertyInquiries.filter((i) => !i.is_read).length,
    responded: propertyInquiries.filter((i) => i.responded).length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-gray-600 mt-1">Manage contact and property inquiries</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error loading inquiries</p>
          <p className="text-sm">
            {error && 'status' in error
              ? `Status: ${(error as any).status}`
              : (error as any)?.message || 'An unknown error occurred'}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('contact')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'contact'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Contact Inquiries ({contactStats.total})
          </button>
          <button
            onClick={() => setActiveTab('property')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'property'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Property Inquiries ({propertyStats.total})
          </button>
        </nav>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total</p>
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {activeTab === 'contact' ? contactStats.total : propertyStats.total}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Unread</p>
            <Mail className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {activeTab === 'contact' ? contactStats.unread : propertyStats.unread}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Responded</p>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {activeTab === 'contact' ? contactStats.responded : propertyStats.responded}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="responded">Responded</option>
            <option value="pending">Pending Response</option>
          </select>
        </div>
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading inquiries...</p>
        </div>
      ) : activeTab === 'contact' ? (
        filteredContactInquiries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 mb-2">No contact inquiries found</p>
            <p className="text-gray-500">Contact inquiries will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContactInquiries.map((inquiry, index) => (
              <motion.div
                key={inquiry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${!inquiry.is_read ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100'
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{inquiry.subject}</h3>
                      {!inquiry.is_read && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                          New
                        </span>
                      )}
                      {inquiry.responded && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Responded
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{inquiry.name}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{inquiry.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{inquiry.phone}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{inquiry.message}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(inquiry.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  {!inquiry.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(inquiry.id, 'contact')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                  {!inquiry.responded && (
                    <button
                      onClick={() => handleMarkAsResponded(inquiry.id, 'contact')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Mark as Responded
                    </button>
                  )}
                  <a
                    href={`mailto:${inquiry.email}?subject=Re: ${inquiry.subject}`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <Mail className="h-4 w-4" />
                    Reply via Email
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : filteredPropertyInquiries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-xl text-gray-600 mb-2">No property inquiries found</p>
          <p className="text-gray-500">Property inquiries will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPropertyInquiries.map((inquiry, index) => (
            <motion.div
              key={inquiry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${!inquiry.is_read ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100'
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-bold text-gray-900">{inquiry.apartment_details.title}</h3>
                    {!inquiry.is_read && (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                        New
                      </span>
                    )}
                    {inquiry.responded && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Responded
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{inquiry.apartment_details.location}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{inquiry.name}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">{inquiry.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">{inquiry.phone}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{inquiry.message}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(inquiry.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                {!inquiry.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(inquiry.id, 'property')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Mark as Read
                  </button>
                )}
                {!inquiry.responded && (
                  <button
                    onClick={() => handleMarkAsResponded(inquiry.id, 'property')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Mark as Responded
                  </button>
                )}
                <a
                  href={`mailto:${inquiry.email}?subject=Re: Property Inquiry - ${inquiry.apartment_details.title}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                >
                  <Mail className="h-4 w-4" />
                  Reply via Email
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
