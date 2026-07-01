'use client';

import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { wsRpc } from '@/lib/api/rpc';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import type { Activity } from '@/lib/api/types';

export function useActivities(filters?: {
  entity_type?: string;
  entity_id?: string;
  type?: string;
  member_id?: string;
}) {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useInfiniteQuery({
    queryKey: ['activities', wsId, filters],
    queryFn: async ({ pageParam }) => {
      return wsRpc<{ activities: Activity[]; nextCursor?: string }>(
        'list_activities', wsId, { cursor: pageParam, limit: 30, ...filters },
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
    enabled: !!wsId,
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (params: {
      type: string;
      entity_type: string;
      entity_id: string;
      title?: string;
      content?: string;
      metadata?: Record<string, unknown>;
    }) => wsRpc<{ activity: Activity }>('create_activity', wsId, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities', wsId] });
      qc.invalidateQueries({ queryKey: ['dashboard', wsId] });
    },
  });
}

export function useDeleteActivity() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (activityId: string) =>
      wsRpc<{ deleted: boolean }>('delete_activity', wsId, { activity_id: activityId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities', wsId] });
    },
  });
}
