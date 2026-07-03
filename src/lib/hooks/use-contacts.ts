'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { wsRpc } from '@/lib/api/rpc';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import type { Contact } from '@/lib/api/types';

export function useContacts(search?: string) {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useInfiniteQuery({
    queryKey: ['contacts', wsId, search],
    queryFn: async ({ pageParam }) => {
      const res = await wsRpc<{ contacts: Contact[]; nextCursor?: string }>(
        search ? 'list_contacts' : 'list_contacts',
        wsId,
        { ...(search ? { q: search } : {}), cursor: pageParam, limit: 50 },
      );
      return res;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
    enabled: !!wsId,
  });
}

export function useContact(contactId: string | undefined) {
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useQuery({
    queryKey: ['contact', wsId, contactId],
    queryFn: () =>
      wsRpc<{
        contact: Contact;
        tags: Array<{ tag_id: string; name: string; color: string | null }>;
      }>('get_contact', wsId, { contact_id: contactId }),
    enabled: !!wsId && !!contactId,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (params: Omit<Partial<Contact>, 'contact_id' | 'workspace_id' | 'created_at' | 'updated_at'> & { first_name: string }) =>
      wsRpc<{ contact: Contact }>('create_contact', wsId, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts', wsId] });
      qc.invalidateQueries({ queryKey: ['dashboard', wsId] });
    },
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (params: { contact_id: string } & Record<string, unknown>) =>
      wsRpc<{ contact: Contact }>('update_contact', wsId, params),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['contacts', wsId] });
      qc.invalidateQueries({ queryKey: ['contact', wsId, vars.contact_id] });
    },
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.workspace_id ?? '';

  return useMutation({
    mutationFn: (contactId: string) =>
      wsRpc<{ deleted: boolean }>('delete_contact', wsId, { contact_id: contactId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts', wsId] });
      qc.invalidateQueries({ queryKey: ['dashboard', wsId] });
    },
  });
}
