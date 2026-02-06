'use client';

import React from "react"

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isHydrated) return;

    // Redirect unauthenticated users to login (except on login page)
    if (!isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
    // Redirect authenticated users away from login page
    else if (isAuthenticated && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isHydrated, router, pathname]);

  // Show nothing while redirecting
  if (!isHydrated) {
    return <>{children}</>;
  }

  if (!isAuthenticated && pathname !== '/login') {
    return null;
  }

  if (isAuthenticated && pathname === '/login') {
    return null;
  }

  return <>{children}</>;
}
