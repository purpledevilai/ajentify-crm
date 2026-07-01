'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wsRpc } from '@/lib/api/rpc';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import type { Tag } from '@/lib/api/types';

export function useTags() {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useQuery({
    queryKey: ['tags', wsId],
    queryFn: () => wsRpc<{ tags: Tag[] }>('list_tags', wsId),
    enabled: !!wsId,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (params: { name: string; color?: string }) =>
      wsRpc<{ tag: Tag }>('create_tag', wsId, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tags', wsId] });
    },
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (params: { tag_id: string; name?: string; color?: string }) =>
      wsRpc<{ tag: Tag }>('update_tag', wsId, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tags', wsId] });
    },
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (tagId: string) =>
      wsRpc<{ deleted: boolean }>('delete_tag', wsId, { tag_id: tagId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tags', wsId] });
    },
  });
}
