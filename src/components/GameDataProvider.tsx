'use client';

import { useEffect, ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { useGameStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

export function GameDataProvider({ children }: { children: ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const { initialize, reset, loading: dataLoading, initialized } = useGameStore();

    useEffect(() => {
        if (user && !initialized) {
            initialize(user.id);
        } else if (!user && initialized) {
            reset();
        }
    }, [user, initialized, initialize, reset]);

    // Show loading only when we have a user but data isn't loaded yet
    if (authLoading || (user && dataLoading)) {
        return (
            <div className="flex-1 flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                    <p className="text-muted-foreground">Loading your adventure...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
