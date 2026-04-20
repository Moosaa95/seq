'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Toaster } from '@/components/Toaster';

import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';

    return (
        <>
            {isLoginPage ? (
                // Don't protect or show admin UI on login page
                <>
                    {children}
                    <Toaster />
                </>
            ) : (
                // Protect all other admin pages
                <ProtectedRoute>
                    <div className="min-h-screen bg-gray-50">
                        {/* Sidebar */}
                        <AdminSidebar />

                        {/* Main content */}
                        <div className="lg:pl-64">
                            {/* Header */}
                            <AdminHeader />

                            {/* Page content */}
                            <main className="min-h-[calc(100vh-4rem)]">
                                {children}
                            </main>
                        </div>

                        {/* Toast notifications */}
                        <Toaster />
                    </div>
                </ProtectedRoute>
            )}
        </>
    );
}
