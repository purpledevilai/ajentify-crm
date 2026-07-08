'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { rpc, wsRpc } from '@/lib/api/rpc';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import type { CrmEvent } from '@/lib/api/types';

export function useEvents(filters?: { type?: string; upcoming?: boolean; past?: boolean }) {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useInfiniteQuery({
    queryKey: ['events', wsId, filters],
    queryFn: async ({ pageParam }) => {
      return wsRpc<{ events: CrmEvent[]; nextCursor?: string }>(
        'list_events', wsId, { cursor: pageParam, limit: 50, ...filters },
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
    enabled: !!wsId,
  });
}

export function useEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () =>
      rpc<{
        event: CrmEvent;
        tags: Array<{ tag_id: string; name: string; color: string | null }>;
      }>('get_event', { event_id: eventId }),
    enabled: !!eventId,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (params: { name: string; start_date: number } & Record<string, unknown>) =>
      wsRpc<{ event: CrmEvent }>('create_event', wsId, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events', wsId] });
      qc.invalidateQueries({ queryKey: ['dashboard', wsId] });
    },
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (params: { event_id: string } & Record<string, unknown>) =>
      rpc<{ event: CrmEvent }>('update_event', params),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['events', wsId] });
      qc.invalidateQueries({ queryKey: ['event', vars.event_id] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (eventId: string) =>
      rpc<{ deleted: boolean }>('delete_event', { event_id: eventId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events', wsId] });
      qc.invalidateQueries({ queryKey: ['dashboard', wsId] });
    },
  });
}
