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
import { Shield, ExternalLink } from 'lucide-react';

const SCOPE_DESCRIPTIONS: Record<string, string> = {
  'crm:read': 'Read your contacts, deals, events, and other CRM data',
  'crm:write': 'Create and modify contacts, deals, and other CRM data',
};

interface AuthorizeResponse {
  redirect_uri: string;
  code: string;
}

interface ClientMetadata {
  client_id: string;
  client_name?: string;
  logo_uri?: string;
  client_uri?: string;
  policy_uri?: string;
  tos_uri?: string;
}

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
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
  const [clientMeta, setClientMeta] = useState<ClientMetadata | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);

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

  useEffect(() => {
    if (!clientId || !isHttpsUrl(clientId)) return;
    setMetaLoading(true);
    fetch(clientId, { headers: { accept: 'application/json' } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.client_id === clientId) {
          setClientMeta(data as ClientMetadata);
        }
      })
      .catch(() => {})
      .finally(() => setMetaLoading(false));
  }, [clientId]);

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

  const displayName = clientMeta?.client_name ?? null;
  const logoUri = clientMeta?.logo_uri ?? null;
  const clientUri = clientMeta?.client_uri ?? null;

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
            {displayName
              ? `"${displayName}" is requesting access to your account`
              : 'An application is requesting access to your account'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-md border p-3">
            {metaLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm text-muted-foreground">Loading client info...</span>
              </div>
            ) : displayName ? (
              <div className="flex items-center gap-3">
                {logoUri && (
                  <img
                    src={logoUri}
                    alt={displayName}
                    className="h-10 w-10 shrink-0 rounded-md object-contain"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{displayName}</p>
                  {clientUri ? (
                    <a
                      href={clientUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                    >
                      {new URL(clientUri).hostname}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="truncate text-xs text-muted-foreground">{clientId}</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">
                  Client ID
                </p>
                <p className="mt-0.5 text-sm font-mono break-all">{clientId}</p>
              </>
            )}
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
            disabled={authorizing || metaLoading}
          >
            {authorizing ? 'Authorizing...' : 'Authorize'}
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
