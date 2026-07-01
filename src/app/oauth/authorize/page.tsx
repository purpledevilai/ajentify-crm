'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/providers/auth-provider';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Shield } from 'lucide-react';

const SCOPE_DESCRIPTIONS: Record<string, string> = {
  'crm:read': 'Read your contacts, deals, events, and other CRM data',
  'crm:write': 'Create and modify contacts, deals, and other CRM data',
};

interface AuthorizeResponse {
  redirect_uri: string;
  code: string;
}

export default function OAuthAuthorizePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <OAuthAuthorizeContent />
    </Suspense>
  );
}

function OAuthAuthorizeContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [authorizing, setAuthorizing] = useState(false);

  const clientId = searchParams.get('client_id') ?? '';
  const redirectUri = searchParams.get('redirect_uri') ?? '';
  const responseType = searchParams.get('response_type') ?? '';
  const codeChallenge = searchParams.get('code_challenge') ?? '';
  const codeChallengeMethod = searchParams.get('code_challenge_method') ?? '';
  const state = searchParams.get('state') ?? '';
  const scope = searchParams.get('scope') ?? '';

  const scopes = scope.split(/[\s,]+/).filter(Boolean);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentUrl = window.location.href;
      window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}`;
    }
  }, [isLoading, isAuthenticated]);

  async function handleAuthorize() {
    setAuthorizing(true);
    try {
      const res = await api.post<AuthorizeResponse>('/oauth/authorize', {
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: responseType,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod,
        state,
        scope,
      });
      window.location.href = res.redirect_uri;
    } catch {
      setAuthorizing(false);
    }
  }

  function handleDeny() {
    const url = new URL(redirectUri);
    url.searchParams.set('error', 'access_denied');
    if (state) url.searchParams.set('state', state);
    window.location.href = url.toString();
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-muted/50 to-background px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Ajentify</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customer Relationship Management
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Authorize Application</CardTitle>
          <CardDescription>
            An application is requesting access to your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-md border p-3">
            <p className="text-sm font-medium text-muted-foreground">
              Client ID
            </p>
            <p className="mt-0.5 text-sm font-mono break-all">{clientId}</p>
          </div>

          {scopes.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Requested permissions</p>
              <div className="space-y-2">
                {scopes.map((s) => (
                  <div
                    key={s}
                    className="flex items-start gap-3 rounded-md border p-3"
                  >
                    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm">
                      {SCOPE_DESCRIPTIONS[s] ?? s}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full"
            onClick={handleAuthorize}
            disabled={authorizing}
          >
            {authorizing ? 'Authorizing…' : 'Authorize'}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleDeny}
            disabled={authorizing}
          >
            Deny
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
