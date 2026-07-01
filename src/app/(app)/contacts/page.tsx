'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Users, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { ContactFormSheet } from '@/components/contacts/contact-form-sheet';
import { useContacts, useDeleteContact } from '@/lib/hooks/use-contacts';
import { CONTACT_SOURCES, CONTACT_STATUSES } from '@/lib/utils/constants';
import { formatDate, formatContactName, getInitials } from '@/lib/utils/format';
import type { Contact } from '@/lib/api/types';

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useContacts(debouncedSearch || undefined);
  const deleteContact = useDeleteContact();

  const contacts = useMemo(
    () => data?.pages.flatMap((page) => page.contacts) ?? [],
    [data],
  );

  const handleEdit = useCallback((contact: Contact) => {
    setEditingContact(contact);
    setSheetOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!contactToDelete) return;
    try {
      await deleteContact.mutateAsync(contactToDelete.contact_id);
      toast.success('Contact deleted');
    } catch {
      toast.error('Failed to delete contact');
    } finally {
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    }
  }, [contactToDelete, deleteContact]);

  const handleSheetChange = useCallback((open: boolean) => {
    setSheetOpen(open);
    if (!open) setEditingContact(null);
  }, []);

  function getStatusColor(status: string) {
    return CONTACT_STATUSES.find((s) => s.value === status)?.color ?? '#6b7280';
  }

  function getSourceLabel(source: string | null) {
    if (!source) return null;
    return CONTACT_SOURCES.find((s) => s.value === source)?.label ?? source;
  }

  function getStatusLabel(status: string) {
    return CONTACT_STATUSES.find((s) => s.value === status)?.label ?? status;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="Manage your contacts and relationships."
        actions={
          <Button onClick={() => { setEditingContact(null); setSheetOpen(true); }}>
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-60" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Users className="h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No contacts yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {debouncedSearch
              ? 'No contacts match your search.'
              : 'Add your first contact to start building relationships.'}
          </p>
          {!debouncedSearch && (
            <Button className="mt-4" onClick={() => { setEditingContact(null); setSheetOpen(true); }}>
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border">
          <div className="hidden md:grid md:grid-cols-[1fr_1fr_1fr_1fr_auto_auto_auto] gap-4 border-b px-4 py-2.5 text-xs font-medium text-muted-foreground">
            <span>Name</span>
            <span>Email</span>
            <span>Company</span>
            <span>Job Title</span>
            <span>Source</span>
            <span>Status</span>
            <span className="w-8" />
          </div>
          <div className="divide-y">
            {contacts.map((contact) => (
              <div
                key={contact.contact_id}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto_auto_auto] gap-2 md:gap-4 items-center px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar size="default">
                    {contact.avatar_url && (
                      <AvatarImage src={contact.avatar_url} alt={formatContactName(contact)} />
                    )}
                    <AvatarFallback>{getInitials(formatContactName(contact))}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <Link
                      href={`/contacts/${contact.contact_id}`}
                      className="font-medium text-sm hover:underline truncate block"
                    >
                      {formatContactName(contact)}
                    </Link>
                    <span className="text-xs text-muted-foreground md:hidden">
                      {contact.email}
                    </span>
                  </div>
                </div>

                <span className="hidden md:block text-sm text-muted-foreground truncate">
                  {contact.email ?? '—'}
                </span>

                <span className="hidden md:block text-sm truncate">
                  {contact.company_name ?? '—'}
                </span>

                <span className="hidden md:block text-sm text-muted-foreground truncate">
                  {contact.job_title ?? '—'}
                </span>

                <span className="hidden md:block">
                  {contact.source ? (
                    <Badge variant="secondary">{getSourceLabel(contact.source)}</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </span>

                <span className="hidden md:block">
                  <Badge
                    variant="outline"
                    className="border-transparent"
                    style={{
                      backgroundColor: `${getStatusColor(contact.status)}15`,
                      color: getStatusColor(contact.status),
                    }}
                  >
                    {getStatusLabel(contact.status)}
                  </Badge>
                </span>

                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-sm" />}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(contact)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                          setContactToDelete(contact);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center border-t p-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading...' : 'Load more'}
              </Button>
            </div>
          )}
        </div>
      )}

      <ContactFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetChange}
        contact={editingContact}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              {contactToDelete ? formatContactName(contactToDelete) : 'this contact'}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
