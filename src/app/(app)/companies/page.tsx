'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layouts/page-header';
import { CompanyFormSheet } from '@/components/companies/company-form-sheet';
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
import { useCompanies, useDeleteCompany } from '@/lib/hooks/use-companies';
import { formatDate, getInitials } from '@/lib/utils/format';
import { COMPANY_SIZES } from '@/lib/utils/constants';
import type { Company } from '@/lib/api/types';
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
  const found = COMPANY_SIZES.find((s) => s.value === value);
  return found ? found.label : value;
}

export default function CompaniesPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCompanies();
  const deleteCompany = useDeleteCompany();

  const companies = useMemo(
    () => data?.pages.flatMap((p) => p.companies ?? []) ?? [],
    [data],
  );

  function handleEdit(company: Company) {
    setEditCompany(company);
    setSheetOpen(true);
  }

  function handleCreate() {
    setEditCompany(undefined);
    setSheetOpen(true);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteCompany.mutate(deleteTarget.company_id, {
      onSuccess: () => {
        toast.success('Company deleted');
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to delete company');
      },
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Companies"
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
        title="Companies"
        description="Manage companies and groups your contacts belong to."
        actions={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Add Company
          </Button>
        }
      />

      {companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Building2 className="h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No companies yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a company to start tracking company relationships.
          </p>
          <Button className="mt-4" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Add Company
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Company</th>
                  <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Industry</th>
                  <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">Location</th>
                  <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Size</th>
                  <th className="hidden px-4 py-3 text-left font-medium xl:table-cell">Website</th>
                  <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Created</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.company_id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/companies/${company.company_id}`}
                        className="flex items-center gap-3 hover:underline"
                      >
                        <Avatar size="sm">
                          {company.logo_url && <AvatarImage src={company.logo_url} alt={company.name} />}
                          <AvatarFallback>{getInitials(company.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{company.name}</span>
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {company.industry || '—'}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {company.location || '—'}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {company.size ? (
                        <Badge variant="secondary">{getSizeLabel(company.size)}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 xl:table-cell">
                      {company.website ? (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span className="max-w-[120px] truncate">
                            {company.website.replace(/^https?:\/\//, '')}
                          </span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {formatDate(company.created_at)}
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
                          <DropdownMenuItem onClick={() => handleEdit(company)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteTarget(company)}
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

      <CompanyFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        company={editCompany}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
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
              disabled={deleteCompany.isPending}
            >
              {deleteCompany.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
