'use client';

import { useState, useDeferredValue } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { wsRpc } from '@/lib/api/rpc';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import { useQuery } from '@tanstack/react-query';

export type EntitySearchType = 'contact' | 'company' | 'deal' | 'event';

const RPC_CONFIG: Record<EntitySearchType, { method: string; key: string; supportsSearch: boolean }> = {
  contact: { method: 'list_contacts', key: 'contacts', supportsSearch: true },
  company: { method: 'list_companies', key: 'companies', supportsSearch: true },
  deal: { method: 'list_deals', key: 'deals', supportsSearch: false },
  event: { method: 'list_events', key: 'events', supportsSearch: false },
};

function getDisplayName(entityType: EntitySearchType, entity: Record<string, unknown>): string {
  switch (entityType) {
    case 'contact': {
      const first = entity.first_name as string;
      const last = entity.last_name as string | null;
      return last ? `${first} ${last}` : first;
    }
    case 'company':
      return entity.name as string;
    case 'deal':
      return entity.name as string;
    case 'event':
      return entity.name as string;
    default:
      return String(entity.name ?? entity.title ?? '');
  }
}

function getSubtitle(entityType: EntitySearchType, entity: Record<string, unknown>): string | null {
  switch (entityType) {
    case 'contact':
      return (entity.job_title as string | null) || (entity.email as string | null);
    case 'company':
      return (entity.industry as string | null);
    case 'deal':
      return (entity.stage as string | null);
    case 'event':
      return (entity.type as string | null);
    default:
      return null;
  }
}

function getEntityId(entityType: EntitySearchType, entity: Record<string, unknown>): string {
  switch (entityType) {
    case 'contact': return entity.contact_id as string;
    case 'company': return entity.company_id as string;
    case 'deal': return entity.deal_id as string;
    case 'event': return entity.event_id as string;
    default: return '';
  }
}

interface EntitySearchPopoverProps {
  entityType: EntitySearchType;
  excludeIds: string[];
  onSelect: (entityId: string, entity: Record<string, unknown>) => void;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function EntitySearchPopover({
  entityType,
  excludeIds,
  onSelect,
  side = 'bottom',
}: EntitySearchPopoverProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';
  const config = RPC_CONFIG[entityType];

  const { data, isLoading } = useQuery({
    queryKey: ['entity-search', wsId, entityType, deferredSearch],
    queryFn: () =>
      wsRpc<Record<string, unknown[]>>(config.method, wsId, {
        limit: 50,
        ...(config.supportsSearch && deferredSearch ? { q: deferredSearch } : {}),
      }),
    enabled: !!wsId && open,
  });

  const items = ((data?.[config.key] as Record<string, unknown>[]) ?? []).filter(
    (item) => !excludeIds.includes(getEntityId(entityType, item)),
  );

  const filteredItems = !config.supportsSearch && deferredSearch
    ? items.filter((item) =>
        getDisplayName(entityType, item).toLowerCase().includes(deferredSearch.toLowerCase()),
      )
    : items;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground" />
        }
      >
        <Plus className="h-3.5 w-3.5" />
        Add
      </PopoverTrigger>
      <PopoverContent side={side} align="start" className="w-64 p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Search ${entityType}s...`}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Searching...' : 'No results found.'}
            </CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item) => {
                const id = getEntityId(entityType, item);
                const name = getDisplayName(entityType, item);
                const subtitle = getSubtitle(entityType, item);
                return (
                  <CommandItem
                    key={id}
                    value={id}
                    onSelect={() => {
                      onSelect(id, item);
                      setOpen(false);
                      setSearch('');
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{name}</p>
                      {subtitle && (
                        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
