'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rpc } from '@/lib/api/rpc';

export interface HydratedRelationship {
  relationship_id: string;
  type: string;
  metadata: Record<string, unknown> | null;
  related_entity_type: string;
  related_entity_id: string;
  related_entity: Record<string, unknown>;
  created_at: number;
}

const ID_FIELD: Record<string, string> = {
  contact: 'contact_id',
  company: 'company_id',
  deal: 'deal_id',
  event: 'event_id',
  task: 'task_id',
  tag: 'tag_id',
  activity: 'activity_id',
};

export function useRelationships(
  entityType: string,
  entityId: string | undefined,
  relatedType?: string,
) {
  const idField = ID_FIELD[entityType];

  return useQuery({
    queryKey: ['relationships', entityType, entityId, relatedType],
    queryFn: () =>
      rpc<{ relationships: HydratedRelationship[] }>(`list_${entityType}_relationships`, {
        [idField]: entityId,
        ...(relatedType ? { related_type: relatedType } : {}),
      }),
    enabled: !!entityId,
    select: (data) => data.relationships,
  });
}

export function useCreateRelationship(entityType: string, entityId: string) {
  const qc = useQueryClient();
  const idField = ID_FIELD[entityType];

  return useMutation({
    mutationFn: (params: {
      related_entity_type: string;
      related_entity_id: string;
      metadata?: Record<string, unknown>;
    }) => rpc<{ relationship: unknown }>(`create_${entityType}_relationship`, {
      [idField]: entityId,
      ...params,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['relationships'] });
    },
  });
}

export function useDeleteRelationship(entityType: string, entityId: string) {
  const qc = useQueryClient();
  const idField = ID_FIELD[entityType];

  return useMutation({
    mutationFn: (relationshipId: string) =>
      rpc<{ deleted: boolean }>(`delete_${entityType}_relationship`, {
        [idField]: entityId,
        relationship_id: relationshipId,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['relationships'] });
    },
  });
}
