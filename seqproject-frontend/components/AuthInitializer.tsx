'use client';

import { useEffect } from 'react';
import { useVerifyQuery } from '@/lib/store/api/authApi';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
    // This query runs automatically on mount.
    // The logic to update Redux state is handled in onQueryStarted in authApi.ts
    const { isLoading } = useVerifyQuery();

    return <>{children}</>;
}
