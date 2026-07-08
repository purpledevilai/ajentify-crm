'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { rpc, wsRpc } from '@/lib/api/rpc';
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
  return useQuery({
    queryKey: ['deal', dealId],
    queryFn: () =>
      rpc<{
        deal: Deal;
        tags: Array<{ tag_id: string; name: string; color: string | null }>;
      }>('get_deal', { deal_id: dealId }),
    enabled: !!dealId,
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
      rpc<{ deal: Deal }>('update_deal', params),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['deals', wsId] });
      qc.invalidateQueries({ queryKey: ['deal', vars.deal_id] });
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
      rpc<{ deleted: boolean }>('delete_deal', { deal_id: dealId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals', wsId] });
      qc.invalidateQueries({ queryKey: ['pipeline', wsId] });
      qc.invalidateQueries({ queryKey: ['dashboard', wsId] });
    },
  });
}
