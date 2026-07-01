'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layouts/page-header';
import { OrgFormSheet } from '@/components/organizations/org-form-sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useOrganizations, useDeleteOrganization } from '@/lib/hooks/use-organizations';
import { formatDate, getInitials } from '@/lib/utils/format';
import { ORGANIZATION_SIZES } from '@/lib/utils/constants';
import type { Organization } from '@/lib/api/types';
import {
  Plus,
  Building2,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

function getSizeLabel(value: string | null): string | null {
  if (!value) return null;
  const found = ORGANIZATION_SIZES.find((s) => s.value === value);
  return found ? found.label : value;
}

export default function OrganizationsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editOrg, setEditOrg] = useState<Organization | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Organization | null>(null);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useOrganizations();
  const deleteOrg = useDeleteOrganization();

  const organizations = useMemo(
    () => data?.pages.flatMap((p) => p.organizations ?? []) ?? [],
    [data],
  );

  function handleEdit(org: Organization) {
    setEditOrg(org);
    setSheetOpen(true);
  }

  function handleCreate() {
    setEditOrg(undefined);
    setSheetOpen(true);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteOrg.mutate(deleteTarget.organization_id, {
      onSuccess: () => {
        toast.success('Organization deleted');
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to delete organization');
      },
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Organizations"
          description="Manage companies and groups your contacts belong to."
        />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizations"
        description="Manage companies and groups your contacts belong to."
        actions={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Add Organization
          </Button>
        }
      />

      {organizations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Building2 className="h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No organizations yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add an organization to start tracking company relationships.
          </p>
          <Button className="mt-4" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Add Organization
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Organization</th>
                  <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Industry</th>
                  <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">Location</th>
                  <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Size</th>
                  <th className="hidden px-4 py-3 text-left font-medium xl:table-cell">Website</th>
                  <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Created</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.organization_id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/organizations/${org.organization_id}`}
                        className="flex items-center gap-3 hover:underline"
                      >
                        <Avatar size="sm">
                          {org.logo_url && <AvatarImage src={org.logo_url} alt={org.name} />}
                          <AvatarFallback>{getInitials(org.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{org.name}</span>
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {org.industry || '—'}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {org.location || '—'}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {org.size ? (
                        <Badge variant="secondary">{getSizeLabel(org.size)}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 xl:table-cell">
                      {org.website ? (
                        <a
                          href={org.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span className="max-w-[120px] truncate">
                            {org.website.replace(/^https?:\/\//, '')}
                          </span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {formatDate(org.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(org)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteTarget(org)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      )}

      <OrgFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        organization={editOrg}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteOrg.isPending}
            >
              {deleteOrg.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
