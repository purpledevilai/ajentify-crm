'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wsRpc } from '@/lib/api/rpc';
import { useWorkspace } from '@/lib/providers/workspace-provider';

export interface HydratedRelationship {
  relationship_id: string;
  type: string;
  metadata: Record<string, unknown> | null;
  related_entity_type: string;
  related_entity_id: string;
  related_entity: Record<string, unknown>;
  created_at: number;
}

export function useRelationships(
  entityType: string,
  entityId: string | undefined,
  relatedType?: string,
) {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useQuery({
    queryKey: ['relationships', wsId, entityType, entityId, relatedType],
    queryFn: () =>
      wsRpc<{ relationships: HydratedRelationship[] }>('list_relationships', wsId, {
        entity_type: entityType,
        entity_id: entityId,
        ...(relatedType ? { related_type: relatedType } : {}),
      }),
    enabled: !!wsId && !!entityId,
    select: (data) => data.relationships,
  });
}

export function useCreateRelationship() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (params: {
      entity_type_a: string;
      entity_id_a: string;
      entity_type_b: string;
      entity_id_b: string;
      metadata?: Record<string, unknown>;
    }) => wsRpc<{ relationship: unknown }>('create_relationship', wsId, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['relationships', wsId] });
    },
  });
}

export function useDeleteRelationship() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (relationshipId: string) =>
      wsRpc<{ deleted: boolean }>('delete_relationship', wsId, {
        relationship_id: relationshipId,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['relationships', wsId] });
    },
  });
}
