'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { rpc, wsRpc } from '@/lib/api/rpc';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import type { Company } from '@/lib/api/types';

export function useCompanies(search?: string) {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useInfiniteQuery({
    queryKey: ['companies', wsId, search],
    queryFn: async ({ pageParam }) => {
      return wsRpc<{ companies: Company[]; nextCursor?: string }>(
        'list_companies', wsId, { cursor: pageParam, limit: 50, ...(search ? { q: search } : {}) },
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
    enabled: !!wsId,
  });
}

export function useCompany(companyId: string | undefined) {
  return useQuery({
    queryKey: ['company', companyId],
    queryFn: () =>
      rpc<{
        company: Company;
        tags: Array<{ tag_id: string; name: string; color: string | null }>;
      }>('get_company', { company_id: companyId }),
    enabled: !!companyId,
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
      rpc<{ company: Company }>('update_company', params),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['companies', wsId] });
      qc.invalidateQueries({ queryKey: ['company', vars.company_id] });
    },
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (companyId: string) =>
      rpc<{ deleted: boolean }>('delete_company', { company_id: companyId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies', wsId] });
    },
  });
}
