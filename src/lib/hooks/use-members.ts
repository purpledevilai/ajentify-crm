'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wsRpc } from '@/lib/api/rpc';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import type { Member } from '@/lib/api/types';

export type WorkspaceMember = Member & { role: string };

export function useWorkspaceMembers() {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useQuery({
    queryKey: ['workspace-members', wsId],
    queryFn: () => wsRpc<{ members: WorkspaceMember[] }>('list_workspace_members', wsId),
    enabled: !!wsId,
  });
}

export function useInviteMember() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (params: { email: string; role?: string }) =>
      wsRpc<{ success: boolean }>('invite_workspace_member', wsId, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-members', wsId] });
    },
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (memberId: string) =>
      wsRpc<{ deleted: boolean }>('remove_workspace_member', wsId, { member_id: memberId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-members', wsId] });
    },
  });
}
