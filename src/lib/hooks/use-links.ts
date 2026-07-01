'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wsRpc } from '@/lib/api/rpc';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import type { Relationship } from '@/lib/api/types';

type LinkParams = {
  method: string;
  params: Record<string, string>;
  metadata?: Record<string, unknown>;
  invalidate: string[][];
};

export function useAddLink() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: ({ method, params, metadata }: LinkParams) =>
      wsRpc<{ relationship: Relationship }>(method, wsId, { ...params, metadata }),
    onSuccess: (_data, vars) => {
      for (const key of vars.invalidate) {
        qc.invalidateQueries({ queryKey: key });
      }
    },
  });
}

export function useRemoveLink() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: ({ method, params }: LinkParams) =>
      wsRpc<{ deleted: boolean }>(method, wsId, params),
    onSuccess: (_data, vars) => {
      for (const key of vars.invalidate) {
        qc.invalidateQueries({ queryKey: key });
      }
    },
  });
}
