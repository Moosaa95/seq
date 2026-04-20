'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  CreditCard,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
  Box,
  AlertCircle,
  Shield,
  Activity,
  UserCog,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  divider?: boolean;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Properties', href: '/admin/properties', icon: Building2 },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar, badge: '12' },
  { name: 'Transactions', href: '/admin/transactions', icon: CreditCard },
  { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Inventory', href: '/admin/inventory', icon: Box },
  { name: 'Disputes', href: '/admin/disputes', icon: AlertCircle },
  // User Management Section
  { name: 'User Management', href: '/admin/users', icon: UserCog, divider: true },
  { name: 'Roles', href: '/admin/roles', icon: Shield },
  { name: 'Activity Logs', href: '/admin/activity-logs', icon: Activity },
  { name: 'Settings', href: '/admin/settings', icon: Settings, divider: true },
];

export default function AdminSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6 text-gray-600" />
        ) : (
          <Menu className="h-6 w-6 text-gray-600" />
        )}
      </button>

      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
              <p className="text-xs text-gray-500 mt-0.5">Sequoia Projects</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <div key={item.name}>
                  {item.divider && (
                    <div className="border-t border-gray-200 my-3" />
                  )}
                  <Link
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`
                      flex items-center justify-between px-4 py-3 rounded-lg
                      transition-all duration-200 group
                      ${active
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={`h-5 w-5 ${active ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'
                          }`}
                      />
                      <span className={`font-medium ${active ? 'text-emerald-900' : ''}`}>
                        {item.name}
                      </span>
                    </div>
                    {item.badge && (
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {active && <ChevronRight className="h-4 w-4 text-emerald-600" />}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Home className="h-5 w-5 text-gray-400" />
              <span className="font-medium">Back to Site</span>
            </Link>
            <button
              onClick={() => {
                // TODO: Implement logout
                alert('Logout functionality coming soon!');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
