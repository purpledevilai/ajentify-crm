'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { wsRpc } from '@/lib/api/rpc';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import type { Organization } from '@/lib/api/types';

export function useOrganizations() {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useInfiniteQuery({
    queryKey: ['organizations', wsId],
    queryFn: async ({ pageParam }) => {
      return wsRpc<{ organizations: Organization[]; nextCursor?: string }>(
        'list_organizations', wsId, { cursor: pageParam, limit: 50 },
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
    enabled: !!wsId,
  });
}

export function useOrganization(orgId: string | undefined) {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useQuery({
    queryKey: ['organization', wsId, orgId],
    queryFn: () =>
      wsRpc<{
        organization: Organization;
        contacts: Array<{ contact_id: string; first_name: string; last_name: string | null; email: string | null; job_title: string | null; [k: string]: unknown }>;
        tags: Array<{ tag_id: string; name: string; color: string | null }>;
      }>('get_organization', wsId, { organization_id: orgId }),
    enabled: !!wsId && !!orgId,
  });
}

export function useCreateOrganization() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (params: { name: string } & Record<string, unknown>) =>
      wsRpc<{ organization: Organization }>('create_organization', wsId, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizations', wsId] });
    },
  });
}

export function useUpdateOrganization() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (params: { organization_id: string } & Record<string, unknown>) =>
      wsRpc<{ organization: Organization }>('update_organization', wsId, params),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['organizations', wsId] });
      qc.invalidateQueries({ queryKey: ['organization', wsId, vars.organization_id] });
    },
  });
}

export function useDeleteOrganization() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (orgId: string) =>
      wsRpc<{ deleted: boolean }>('delete_organization', wsId, { organization_id: orgId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizations', wsId] });
    },
  });
}
