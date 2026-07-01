'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeals, useDeleteDeal } from '@/lib/hooks/use-deals';
import { DealFormSheet } from '@/components/deals/deal-form-sheet';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { DEAL_STAGE_COLORS } from '@/lib/utils/constants';
import type { Deal } from '@/lib/api/types';
import { Plus, MoreHorizontal, Pencil, Trash2, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';

export default function DealsListPage() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useDeals();
  const deleteDeal = useDeleteDeal();
  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const deals = data?.pages.flatMap((page) => page.deals) ?? [];

  function handleEdit(deal: Deal) {
    setEditingDeal(deal);
    setFormOpen(true);
  }

  async function handleDelete(dealId: string) {
    try {
      await deleteDeal.mutateAsync(dealId);
      toast.success('Deal deleted successfully');
    } catch {
      toast.error('Failed to delete deal');
    }
  }

  function getStageColor(stage: string) {
    return DEAL_STAGE_COLORS[stage.toLowerCase().replace(/\s+/g, '_')] || '#6b7280';
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deals"
        description="View all your deals in a table format."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" render={<Link href="/deals" />}>
              <LayoutGrid className="h-4 w-4" />
              Board View
            </Button>
            <Button onClick={() => { setEditingDeal(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4" />
              Add Deal
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <h3 className="text-lg font-semibold">No deals yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first deal to get started.
          </p>
          <Button className="mt-4" onClick={() => { setEditingDeal(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" />
            Add Deal
          </Button>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Expected Close</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal.deal_id}>
                  <TableCell>
                    <Link
                      href={`/deals/${deal.deal_id}`}
                      className="font-medium hover:underline"
                    >
                      {deal.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="border"
                      style={{
                        borderColor: getStageColor(deal.stage),
                        color: getStageColor(deal.stage),
                      }}
                    >
                      {deal.stage}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {deal.value != null && deal.value > 0
                      ? formatCurrency(deal.value, deal.currency)
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {deal.expected_close_date ? (
                      <span
                        className={
                          deal.expected_close_date < Date.now()
                            ? 'text-destructive'
                            : ''
                        }
                      >
                        {formatDate(deal.expected_close_date)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(deal.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(deal)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(deal.deal_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}

      <DealFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        deal={editingDeal}
      />
    </div>
  );
}
