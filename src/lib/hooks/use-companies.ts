'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { wsRpc } from '@/lib/api/rpc';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import type { Company } from '@/lib/api/types';

export function useCompanies() {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useInfiniteQuery({
    queryKey: ['companies', wsId],
    queryFn: async ({ pageParam }) => {
      return wsRpc<{ companies: Company[]; nextCursor?: string }>(
        'list_companies', wsId, { cursor: pageParam, limit: 50 },
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
    enabled: !!wsId,
  });
}

export function useCompany(companyId: string | undefined) {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useQuery({
    queryKey: ['company', wsId, companyId],
    queryFn: () =>
      wsRpc<{
        company: Company;
        contacts: Array<{ contact_id: string; first_name: string; last_name: string | null; email: string | null; job_title: string | null; [k: string]: unknown }>;
        tags: Array<{ tag_id: string; name: string; color: string | null }>;
      }>('get_company', wsId, { company_id: companyId }),
    enabled: !!wsId && !!companyId,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (params: { name: string } & Record<string, unknown>) =>
      wsRpc<{ company: Company }>('create_company', wsId, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies', wsId] });
    },
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (params: { company_id: string } & Record<string, unknown>) =>
      wsRpc<{ company: Company }>('update_company', wsId, params),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['companies', wsId] });
      qc.invalidateQueries({ queryKey: ['company', wsId, vars.company_id] });
    },
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (companyId: string) =>
      wsRpc<{ deleted: boolean }>('delete_company', wsId, { company_id: companyId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies', wsId] });
    },
  });
}
