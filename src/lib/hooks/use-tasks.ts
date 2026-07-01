'use client';

import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { wsRpc } from '@/lib/api/rpc';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import type { Task } from '@/lib/api/types';

export function useTasks(filters?: {
  status?: string;
  priority?: string;
  member_id?: string;
  entity_type?: string;
  entity_id?: string;
  overdue?: boolean;
}) {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useInfiniteQuery({
    queryKey: ['tasks', wsId, filters],
    queryFn: async ({ pageParam }) => {
      return wsRpc<{ tasks: Task[]; nextCursor?: string }>(
        'list_tasks', wsId, { cursor: pageParam, limit: 100, ...filters },
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
    enabled: !!wsId,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (params: { title: string } & Record<string, unknown>) =>
      wsRpc<{ task: Task }>('create_task', wsId, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', wsId] });
      qc.invalidateQueries({ queryKey: ['dashboard', wsId] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (params: { task_id: string } & Record<string, unknown>) =>
      wsRpc<{ task: Task }>('update_task', wsId, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', wsId] });
      qc.invalidateQueries({ queryKey: ['dashboard', wsId] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (taskId: string) =>
      wsRpc<{ deleted: boolean }>('delete_task', wsId, { task_id: taskId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', wsId] });
      qc.invalidateQueries({ queryKey: ['dashboard', wsId] });
    },
  });
}
