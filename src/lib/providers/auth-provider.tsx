'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { setAccessToken } from '@/lib/api/client';
import * as authApi from '@/lib/api/auth';
import type { Member, Workspace } from '@/lib/api/types';

interface AuthContextValue {
  member: Member | null;
  workspaces: Workspace[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuth: (accessToken: string, member: Member, workspaces?: Workspace[]) => void;
  refreshWorkspaces: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_ROUTES = ['/login', '/create-account', '/verify-email', '/reset-password', '/set-new-password'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname?.startsWith(route));
  const isOAuthRoute = pathname?.startsWith('/oauth/');

  const logout = useCallback(async () => {
    await authApi.logout();
    setMember(null);
    setWorkspaces([]);
    queryClient.clear();
    router.push('/login');
  }, [router, queryClient]);

  const setAuth = useCallback((accessToken: string, member: Member, ws?: Workspace[]) => {
    setAccessToken(accessToken);
    setMember(member);
    if (ws) setWorkspaces(ws);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setAccessToken(res.access_token);
    setMember(res.member);
    const meRes = await authApi.getMe();
    setWorkspaces(meRes.workspaces);
  }, []);

  const refreshWorkspaces = useCallback(async () => {
    const meRes = await authApi.getMe();
    setWorkspaces(meRes.workspaces);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const refreshRes = await authApi.refreshToken();
        if (cancelled) return;

        if (refreshRes) {
          const meRes = await authApi.getMe();
          if (cancelled) return;
          setMember(meRes.member);
          setWorkspaces(meRes.workspaces);
        } else if (!isAuthRoute && !isOAuthRoute) {
          router.push('/login');
        }
      } catch {
        if (!cancelled && !isAuthRoute && !isOAuthRoute) {
          router.push('/login');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider
      value={{
        member,
        workspaces,
        isAuthenticated: !!member,
        isLoading,
        login,
        logout,
        setAuth,
        refreshWorkspaces,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
