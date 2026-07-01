'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  DndContext,
  DragOverlay,
  useDroppable,
  useDraggable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePipeline, useUpdateDeal } from '@/lib/hooks/use-deals';
import { DealFormSheet } from '@/components/deals/deal-form-sheet';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { DEAL_STAGE_COLORS } from '@/lib/utils/constants';
import type { Deal, PipelineStage } from '@/lib/api/types';
import { Plus, Handshake, GripVertical, List } from 'lucide-react';

function DraggableDealCard({ deal, stageColor }: { deal: Deal; stageColor: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.deal_id,
    data: { deal },
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 cursor-grab text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <Link
            href={`/deals/${deal.deal_id}`}
            className="text-sm font-medium hover:underline line-clamp-1"
          >
            {deal.name}
          </Link>
          {deal.value != null && deal.value > 0 && (
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {formatCurrency(deal.value, deal.currency)}
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-2">
            {deal.expected_close_date && (
              <span
                className={`text-xs ${
                  deal.expected_close_date < Date.now()
                    ? 'text-destructive font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                {formatDate(deal.expected_close_date)}
              </span>
            )}
            {deal.owner_member_id && (
              <span
                className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium text-white"
                style={{ backgroundColor: stageColor }}
              >
                {deal.owner_member_id.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DealCardOverlay({ deal }: { deal: Deal }) {
  return (
    <div className="rounded-lg border bg-card p-3 shadow-lg w-64">
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 text-muted-foreground/50" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-1">{deal.name}</p>
          {deal.value != null && deal.value > 0 && (
            <p className="mt-0.5 text-sm font-semibold">
              {formatCurrency(deal.value, deal.currency)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PipelineColumn({
  stage,
  deals,
  onAddDeal,
}: {
  stage: PipelineStage;
  deals: Deal[];
  onAddDeal: (stage: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.name,
    data: { stage },
  });

  const stageColor =
    stage.color || DEAL_STAGE_COLORS[stage.name.toLowerCase().replace(/\s+/g, '_')] || '#6b7280';
  const totalValue = deals.reduce((sum, d) => sum + (d.value ?? 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full w-72 flex-shrink-0 flex-col rounded-lg border bg-muted/30 transition-colors ${
        isOver ? 'border-primary/50 bg-primary/5' : ''
      }`}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2.5">
        <span
          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: stageColor }}
        />
        <h3 className="text-sm font-medium truncate flex-1">{stage.name}</h3>
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {deals.length}
        </span>
      </div>

      {totalValue > 0 && (
        <div className="border-b px-3 py-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            {formatCurrency(totalValue)}
          </p>
        </div>
      )}

      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {deals.map((deal) => (
          <DraggableDealCard key={deal.deal_id} deal={deal} stageColor={stageColor} />
        ))}
      </div>

      <button
        onClick={() => onAddDeal(stage.name)}
        className="flex items-center gap-1.5 border-t px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Add deal
      </button>
    </div>
  );
}

export default function DealsPage() {
  const { data, isLoading } = usePipeline();
  const updateDeal = useUpdateDeal();
  const [formOpen, setFormOpen] = useState(false);
  const [defaultStage, setDefaultStage] = useState<string | undefined>();
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const stages = data?.stages ?? [];
  const pipeline = data?.pipeline ?? {};

  const totalPipelineValue = stages.reduce((total, stage) => {
    const stageDeals = pipeline[stage.name] ?? [];
    return total + stageDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  }, 0);

  const handleAddDeal = useCallback((stage?: string) => {
    setDefaultStage(stage);
    setFormOpen(true);
  }, []);

  function handleDragStart(event: DragStartEvent) {
    const deal = event.active.data.current?.deal as Deal | undefined;
    if (deal) setActiveDeal(deal);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;

    const deal = active.data.current?.deal as Deal | undefined;
    const targetStageName = over.id as string;

    if (deal && targetStageName && deal.stage !== targetStageName) {
      updateDeal.mutate({ deal_id: deal.deal_id, stage: targetStageName });
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Deals"
          description="Track your sales pipeline and deal progress."
        />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-72 flex-shrink-0 space-y-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Deals"
          description="Track your sales pipeline and deal progress."
          actions={
            <Button onClick={() => handleAddDeal()}>
              <Plus className="h-4 w-4" />
              Add Deal
            </Button>
          }
        />
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Handshake className="h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No pipeline stages yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up your pipeline stages in settings to start tracking deals.
          </p>
        </div>
        <DealFormSheet
          open={formOpen}
          onOpenChange={setFormOpen}
          defaultStage={defaultStage}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Deals"
        description="Track your sales pipeline and deal progress."
        actions={
          <div className="flex items-center gap-2">
            {totalPipelineValue > 0 && (
              <span className="text-sm font-medium text-muted-foreground">
                Pipeline: {formatCurrency(totalPipelineValue)}
              </span>
            )}
            <Button variant="outline" size="sm" render={<Link href="/deals/list" />}>
              <List className="h-4 w-4" />
              List View
            </Button>
            <Button onClick={() => handleAddDeal()}>
              <Plus className="h-4 w-4" />
              Add Deal
            </Button>
          </div>
        }
      />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages
            .sort((a, b) => a.order - b.order)
            .map((stage) => (
              <PipelineColumn
                key={stage.stage_id}
                stage={stage}
                deals={pipeline[stage.name] ?? []}
                onAddDeal={handleAddDeal}
              />
            ))}
        </div>

        <DragOverlay>
          {activeDeal ? <DealCardOverlay deal={activeDeal} /> : null}
        </DragOverlay>
      </DndContext>

      <DealFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultStage={defaultStage}
      />
    </div>
  );
}
