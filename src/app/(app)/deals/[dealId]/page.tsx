'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDeal, useUpdateDeal, useDeleteDeal } from '@/lib/hooks/use-deals';
import { usePipelineStages } from '@/lib/hooks/use-pipeline';
import { DealFormSheet } from '@/components/deals/deal-form-sheet';
import { ActivityTimeline } from '@/components/shared/activity-timeline';
import { EntityTasks } from '@/components/shared/entity-tasks';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils/format';
import { DEAL_STAGE_COLORS } from '@/lib/utils/constants';
import {
  Pencil,
  Trash2,
  ArrowRight,
  Calendar,
  DollarSign,
  StickyNote,
  Users,
  Building2,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.dealId as string;

  const { data, isLoading } = useDeal(dealId);
  const { data: stagesData } = usePipelineStages();
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();
  const [formOpen, setFormOpen] = useState(false);

  const deal = data?.deal;
  const contacts = data?.contacts ?? [];
  const organizations = data?.organizations ?? [];
  const tags = data?.tags ?? [];
  const stages = stagesData?.stages?.sort((a, b) => a.order - b.order) ?? [];

  const currentStageIndex = stages.findIndex((s) => s.name === deal?.stage);
  const currentStage = stages[currentStageIndex];
  const nextStage = stages[currentStageIndex + 1];

  const stageColor =
    currentStage?.color ||
    DEAL_STAGE_COLORS[deal?.stage?.toLowerCase().replace(/\s+/g, '_') ?? ''] ||
    '#6b7280';

  async function handleMoveToNextStage() {
    if (!deal || !nextStage) return;
    try {
      await updateDeal.mutateAsync({ deal_id: deal.deal_id, stage: nextStage.name });
      toast.success(`Deal moved to ${nextStage.name}`);
    } catch {
      toast.error('Failed to update deal stage');
    }
  }

  async function handleDelete() {
    if (!deal) return;
    try {
      await deleteDeal.mutateAsync(deal.deal_id);
      toast.success('Deal deleted');
      router.push('/deals');
    } catch {
      toast.error('Failed to delete deal');
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-60 w-full rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-60 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-lg font-semibold">Deal not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The deal you are looking for does not exist.
        </p>
        <Button className="mt-4" render={<Link href="/deals" />}>
          Back to Deals
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={deal.name}
        breadcrumbs={[
          { label: 'Deals', href: '/deals' },
          { label: deal.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
                <Trash2 className="h-4 w-4" />
                Delete
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Deal</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &ldquo;{deal.name}&rdquo;? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deal Header Card */}
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                className="text-sm px-3 py-1"
                style={{ backgroundColor: stageColor, color: '#fff', borderColor: stageColor }}
              >
                {deal.stage}
              </Badge>
              {deal.value != null && deal.value > 0 && (
                <span className="text-xl font-bold">
                  {formatCurrency(deal.value, deal.currency)}
                </span>
              )}
            </div>

            {/* Stage Progression */}
            {stages.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center gap-1">
                  {stages.map((stage, idx) => {
                    const isActive = idx === currentStageIndex;
                    const isPast = idx < currentStageIndex;
                    const color =
                      stage.color ||
                      DEAL_STAGE_COLORS[stage.name.toLowerCase().replace(/\s+/g, '_')] ||
                      '#6b7280';

                    return (
                      <div key={stage.stage_id} className="flex items-center gap-1 flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={`h-2 w-full rounded-full transition-colors ${
                              isActive || isPast ? '' : 'bg-muted'
                            }`}
                            style={
                              isActive || isPast
                                ? { backgroundColor: color }
                                : undefined
                            }
                          />
                          <span
                            className={`mt-1 text-[10px] truncate max-w-full ${
                              isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {stage.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {nextStage && (
              <div className="mt-4">
                <Button size="sm" onClick={handleMoveToNextStage}>
                  <ArrowRight className="h-4 w-4" />
                  Move to {nextStage.name}
                </Button>
              </div>
            )}
          </Card>

          {/* Deal Details Card */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-3">Deal Details</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Value</p>
                  <p className="text-sm font-medium">
                    {deal.value != null && deal.value > 0
                      ? formatCurrency(deal.value, deal.currency)
                      : 'Not set'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Expected Close</p>
                  <p className={`text-sm font-medium ${deal.expected_close_date && deal.expected_close_date < Date.now() ? 'text-destructive' : ''}`}>
                    {deal.expected_close_date
                      ? formatDate(deal.expected_close_date)
                      : 'Not set'}
                  </p>
                </div>
              </div>
              {deal.actual_close_date && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Actual Close</p>
                    <p className="text-sm font-medium">
                      {formatDate(deal.actual_close_date)}
                    </p>
                  </div>
                </div>
              )}
              {deal.loss_reason && (
                <div className="flex items-start gap-2 sm:col-span-2">
                  <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Loss Reason</p>
                    <p className="text-sm text-destructive">{deal.loss_reason}</p>
                  </div>
                </div>
              )}
            </div>
            {deal.notes && (
              <>
                <Separator className="my-4" />
                <div className="flex items-start gap-2">
                  <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm whitespace-pre-wrap">{deal.notes}</p>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Key People */}
          {contacts.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Key People</h3>
              </div>
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.contact_id}
                    className="flex items-center gap-3 rounded-lg border p-2.5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {getInitials(
                        `${contact.first_name} ${contact.last_name ?? ''}`
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/contacts/${contact.contact_id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {contact.first_name} {contact.last_name ?? ''}
                      </Link>
                      {contact.role && (
                        <p className="text-xs text-muted-foreground">{contact.role}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Organizations */}
          {organizations.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Organizations</h3>
              </div>
              <div className="space-y-2">
                {organizations.map((org) => (
                  <div
                    key={org.organization_id}
                    className="flex items-center gap-3 rounded-lg border p-2.5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                      {getInitials(org.name)}
                    </span>
                    <Link
                      href={`/organizations/${org.organization_id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {org.name}
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge
                    key={tag.tag_id}
                    variant="secondary"
                    style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
                    className="border"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-3">Activity</h3>
            <ActivityTimeline entityType="deal" entityId={dealId} />
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-3">Tasks</h3>
            <EntityTasks entityType="deal" entityId={dealId} />
          </Card>
        </div>
      </div>

      <DealFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        deal={deal}
      />
    </div>
  );
}
