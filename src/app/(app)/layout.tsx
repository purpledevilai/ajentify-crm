'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/providers/auth-provider';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import { AppSidebar } from '@/components/layouts/app-sidebar';
import { MobileNav } from '@/components/layouts/mobile-nav';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const { workspaces } = useWorkspace();
  const pathname = usePathname();
  const router = useRouter();

  const isOnboarding = pathname === '/onboarding';
  const isCreateWorkspace = pathname === '/create-workspace';
  const isFullscreenPage = isOnboarding || isCreateWorkspace;
  const needsOnboarding = !isLoading && isAuthenticated && workspaces.length === 0 && !isOnboarding;

  useEffect(() => {
    if (needsOnboarding) {
      router.replace('/onboarding');
    }
  }, [needsOnboarding, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="hidden md:block w-64 border-r bg-sidebar">
          <div className="p-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (isFullscreenPage) {
    return <>{children}</>;
  }

  if (needsOnboarding) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
