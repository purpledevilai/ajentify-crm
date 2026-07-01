'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { wsRpc } from '@/lib/api/rpc';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import type { CrmEvent, Contact, Organization, Member } from '@/lib/api/types';

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
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useQuery({
    queryKey: ['event', wsId, eventId],
    queryFn: () =>
      wsRpc<{
        event: CrmEvent;
        contacts: Contact[];
        members: Member[];
        organizations: Organization[];
        tags: Array<{ tag_id: string; name: string; color: string | null }>;
      }>('get_event', wsId, { event_id: eventId }),
    enabled: !!wsId && !!eventId,
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
      wsRpc<{ event: CrmEvent }>('update_event', wsId, params),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['events', wsId] });
      qc.invalidateQueries({ queryKey: ['event', wsId, vars.event_id] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (eventId: string) =>
      wsRpc<{ deleted: boolean }>('delete_event', wsId, { event_id: eventId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events', wsId] });
      qc.invalidateQueries({ queryKey: ['dashboard', wsId] });
    },
  });
}
