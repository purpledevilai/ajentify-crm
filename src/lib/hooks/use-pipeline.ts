'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rpc, wsRpc } from '@/lib/api/rpc';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import type { PipelineStage } from '@/lib/api/types';

export function usePipelineStages() {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useQuery({
    queryKey: ['pipeline-stages', wsId],
    queryFn: () => wsRpc<{ stages: PipelineStage[] }>('list_pipeline_stages', wsId),
    enabled: !!wsId,
  });
}

export function useCreatePipelineStage() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (params: { name: string; color?: string; is_closed?: boolean; is_won?: boolean }) =>
      wsRpc<{ stage: PipelineStage }>('create_pipeline_stage', wsId, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipeline-stages', wsId] });
      qc.invalidateQueries({ queryKey: ['pipeline', wsId] });
    },
  });
}

export function useUpdatePipelineStage() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (params: { stage_id: string; name?: string; color?: string; is_closed?: boolean; is_won?: boolean }) =>
      rpc<{ stage: PipelineStage }>('update_pipeline_stage', params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipeline-stages', wsId] });
      qc.invalidateQueries({ queryKey: ['pipeline', wsId] });
    },
  });
}

export function useDeletePipelineStage() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (stageId: string) =>
      rpc<{ deleted: boolean }>('delete_pipeline_stage', { stage_id: stageId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipeline-stages', wsId] });
      qc.invalidateQueries({ queryKey: ['pipeline', wsId] });
    },
  });
}

export function useReorderPipelineStages() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (stageIds: string[]) =>
      wsRpc<{ stages: PipelineStage[] }>('reorder_pipeline_stages', wsId, { stage_ids: stageIds }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipeline-stages', wsId] });
      qc.invalidateQueries({ queryKey: ['pipeline', wsId] });
    },
  });
}
