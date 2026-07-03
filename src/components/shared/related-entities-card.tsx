'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  EntitySearchPopover,
  type EntitySearchType,
} from '@/components/shared/entity-search-popover';
import {
  useRelationships,
  useCreateRelationship,
  useDeleteRelationship,
  type HydratedRelationship,
} from '@/lib/hooks/use-relationships';
import { getInitials } from '@/lib/utils/format';

function getEntityDisplayName(type: string, entity: Record<string, unknown>): string {
  if (type === 'contact') {
    const first = entity.first_name as string;
    const last = entity.last_name as string | null;
    return last ? `${first} ${last}` : first;
  }
  return (entity.name ?? entity.title ?? '') as string;
}

function getEntitySubtitle(type: string, entity: Record<string, unknown>): string | null {
  switch (type) {
    case 'contact':
      return (entity.job_title as string | null) || (entity.email as string | null);
    case 'company':
      return (entity.industry as string | null) || (entity.location as string | null);
    case 'deal':
      return (entity.stage as string | null);
    case 'event':
      return (entity.type as string | null);
    default:
      return null;
  }
}

function getEntityHref(type: string, entity: Record<string, unknown>): string {
  switch (type) {
    case 'contact': return `/contacts/${entity.contact_id}`;
    case 'company': return `/companies/${entity.company_id}`;
    case 'deal': return `/deals/${entity.deal_id}`;
    case 'event': return `/events/${entity.event_id}`;
    default: return '#';
  }
}

function getEntityAvatar(type: string, entity: Record<string, unknown>) {
  const name = getEntityDisplayName(type, entity);
  const url = (entity.avatar_url ?? entity.logo_url ?? null) as string | null;
  return { name, url };
}

function UnlinkButton({
  name,
  relationshipId,
  onConfirm,
}: {
  name: string;
  relationshipId: string;
  onConfirm: (id: string) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
      <PopoverTrigger
        render={
          <button className="rounded p-0.5 opacity-0 transition-opacity group-hover/row:opacity-100 hover:bg-muted focus-visible:opacity-100" />
        }
      >
        <X className="h-3.5 w-3.5 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent side="left" className="w-auto max-w-56">
        <p className="text-sm">Unlink <strong>{name}</strong>?</p>
        <div className="mt-2 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7"
            onClick={() => setConfirmOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-7"
            onClick={() => {
              onConfirm(relationshipId);
              setConfirmOpen(false);
            }}
          >
            Unlink
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface RelatedEntitiesCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  entityType: string;
  entityId: string;
  relatedType: EntitySearchType;
  emptyMessage?: string;
}

export function RelatedEntitiesCard({
  title,
  icon: Icon,
  entityType,
  entityId,
  relatedType,
  emptyMessage,
}: RelatedEntitiesCardProps) {
  const { data: relationships = [], isLoading } = useRelationships(entityType, entityId, relatedType);
  const createRel = useCreateRelationship();
  const deleteRel = useDeleteRelationship();

  const excludeIds = relationships.map((r) => r.related_entity_id);

  function handleAdd(_id: string, entity: Record<string, unknown>) {
    const idKey = `${relatedType}_id`;
    const relatedId = entity[idKey] as string;
    createRel.mutate(
      {
        entity_type_a: entityType,
        entity_id_a: entityId,
        entity_type_b: relatedType,
        entity_id_b: relatedId,
      },
      {
        onSuccess: () => {
          const name = getEntityDisplayName(relatedType, entity);
          toast.success(`Linked ${name}`);
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to create relationship');
        },
      },
    );
  }

  function handleRemove(relationshipId: string) {
    deleteRel.mutate(relationshipId, {
      onSuccess: () => toast.success('Unlinked'),
      onError: (err) => toast.error(err.message || 'Failed to unlink'),
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Icon className="h-4 w-4" />
            {title}
            {relationships.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 justify-center px-1.5 text-[10px]">
                {relationships.length}
              </Badge>
            )}
          </CardTitle>
          <EntitySearchPopover
            entityType={relatedType}
            excludeIds={excludeIds}
            onSelect={handleAdd}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : relationships.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">
            {emptyMessage ?? `No ${relatedType}s linked yet.`}
          </p>
        ) : (
          <div className="space-y-1">
            {relationships.map((rel: HydratedRelationship) => {
              const entity = rel.related_entity as Record<string, unknown>;
              const avatar = getEntityAvatar(rel.related_entity_type, entity);
              const name = getEntityDisplayName(rel.related_entity_type, entity);
              const subtitle = getEntitySubtitle(rel.related_entity_type, entity);
              const href = getEntityHref(rel.related_entity_type, entity);
              const role = (rel.metadata as Record<string, unknown>)?.role as string | undefined;

              return (
                <div
                  key={rel.relationship_id}
                  className="group/row flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                >
                  <Link href={href} className="flex flex-1 items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8 shrink-0">
                      {avatar.url && <AvatarImage src={avatar.url} alt={avatar.name} />}
                      <AvatarFallback className="text-xs">
                        {getInitials(avatar.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{name}</p>
                      {subtitle && (
                        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
                      )}
                    </div>
                    {role && (
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {role}
                      </Badge>
                    )}
                  </Link>
                  <UnlinkButton
                    name={name}
                    relationshipId={rel.relationship_id}
                    onConfirm={handleRemove}
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
