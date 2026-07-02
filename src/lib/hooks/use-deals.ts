'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { wsRpc } from '@/lib/api/rpc';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import type { Deal, PipelineStage } from '@/lib/api/types';

export function useDeals(filters?: { stage?: string; owner_member_id?: string }) {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useInfiniteQuery({
    queryKey: ['deals', wsId, filters],
    queryFn: async ({ pageParam }) => {
      return wsRpc<{ deals: Deal[]; nextCursor?: string }>(
        'list_deals', wsId, { cursor: pageParam, limit: 50, ...filters },
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
    enabled: !!wsId,
  });
}

export function usePipeline() {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useQuery({
    queryKey: ['pipeline', wsId],
    queryFn: () =>
      wsRpc<{ stages: PipelineStage[]; pipeline: Record<string, Deal[]> }>('get_pipeline', wsId),
    enabled: !!wsId,
  });
}

export function useDeal(dealId: string | undefined) {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useQuery({
    queryKey: ['deal', wsId, dealId],
    queryFn: () =>
      wsRpc<{
        deal: Deal;
        contacts: Array<{ contact_id: string; first_name: string; last_name: string | null; role: string | null; [k: string]: unknown }>;
        companies: Array<{ company_id: string; name: string; [k: string]: unknown }>;
        tags: Array<{ tag_id: string; name: string; color: string | null }>;
      }>('get_deal', wsId, { deal_id: dealId }),
    enabled: !!wsId && !!dealId,
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (params: { name: string; stage: string } & Record<string, unknown>) =>
      wsRpc<{ deal: Deal }>('create_deal', wsId, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals', wsId] });
      qc.invalidateQueries({ queryKey: ['pipeline', wsId] });
      qc.invalidateQueries({ queryKey: ['dashboard', wsId] });
    },
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (params: { deal_id: string } & Record<string, unknown>) =>
      wsRpc<{ deal: Deal }>('update_deal', wsId, params),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['deals', wsId] });
      qc.invalidateQueries({ queryKey: ['deal', wsId, vars.deal_id] });
      qc.invalidateQueries({ queryKey: ['pipeline', wsId] });
      qc.invalidateQueries({ queryKey: ['dashboard', wsId] });
    },
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (dealId: string) =>
      wsRpc<{ deleted: boolean }>('delete_deal', wsId, { deal_id: dealId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals', wsId] });
      qc.invalidateQueries({ queryKey: ['pipeline', wsId] });
      qc.invalidateQueries({ queryKey: ['dashboard', wsId] });
    },
  });
}
