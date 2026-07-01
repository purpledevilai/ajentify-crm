'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/lib/providers/auth-provider';
import * as authApi from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>}>
      <GoogleCallbackContent />
    </Suspense>
  );
}

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    async function handleCallback() {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const savedState = sessionStorage.getItem('google_oauth_state');
      const codeVerifier = sessionStorage.getItem('google_code_verifier');

      sessionStorage.removeItem('google_oauth_state');
      sessionStorage.removeItem('google_code_verifier');

      if (!code || !codeVerifier || state !== savedState) {
        toast.error('OAuth verification failed. Please try again.');
        router.push('/login');
        return;
      }

      try {
        const res = await authApi.googleOAuth({
          code,
          code_verifier: codeVerifier,
          redirect_uri: `${window.location.origin}/auth/google/callback`,
        });
        setAuth(res.access_token, res.member);
        router.push('/dashboard');
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(err.message);
        } else {
          toast.error('Google sign-in failed. Please try again.');
        }
        router.push('/login');
      }
    }

    handleCallback();
  }, [router, searchParams, setAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Completing sign-in...</p>
      </div>
    </div>
  );
}
