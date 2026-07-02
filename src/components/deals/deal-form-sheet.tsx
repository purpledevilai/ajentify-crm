'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateDeal, useUpdateDeal } from '@/lib/hooks/use-deals';
import { usePipelineStages } from '@/lib/hooks/use-pipeline';
import type { Deal } from '@/lib/api/types';

const dealSchema = z.object({
  name: z.string().min(1, 'Deal name is required'),
  stage: z.string().min(1, 'Stage is required'),
  value: z.string().optional(),
  currency: z.string(),
  expected_close_date: z.string().optional(),
  notes: z.string().optional(),
});

type DealFormValues = z.infer<typeof dealSchema>;

interface DealFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal | null;
  defaultStage?: string;
}

export function DealFormSheet({
  open,
  onOpenChange,
  deal,
  defaultStage,
}: DealFormSheetProps) {
  const isEditing = !!deal;
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();
  const { data: stagesData } = usePipelineStages();
  const stages = stagesData?.stages ?? [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      name: '',
      stage: defaultStage ?? '',
      value: '',
      currency: 'USD',
      expected_close_date: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (deal) {
        reset({
          name: deal.name,
          stage: deal.stage,
          value: deal.value != null ? String(deal.value) : '',
          currency: deal.currency ?? 'USD',
          expected_close_date: deal.expected_close_date
            ? new Date(deal.expected_close_date).toISOString().split('T')[0]
            : '',
          notes: deal.notes ?? '',
        });
      } else {
        reset({
          name: '',
          stage: defaultStage ?? '',
          value: '',
          currency: 'USD',
          expected_close_date: '',
          notes: '',
        });
      }
    }
  }, [open, deal, defaultStage, reset]);

  async function onSubmit(data: DealFormValues) {
    const params: Record<string, unknown> = {
      name: data.name,
      stage: data.stage,
      currency: data.currency,
    };
    const numValue = data.value ? parseFloat(data.value) : 0;
    if (numValue > 0) params.value = numValue;
    if (data.expected_close_date) {
      params.expected_close_date = data.expected_close_date;
    }
    if (data.notes) params.notes = data.notes;

    try {
      if (isEditing) {
        await updateDeal.mutateAsync({ deal_id: deal.deal_id, ...params });
        toast.success('Deal updated successfully');
      } else {
        await createDeal.mutateAsync(params as { name: string; stage: string });
        toast.success('Deal created successfully');
      }
      onOpenChange(false);
    } catch {
      toast.error(isEditing ? 'Failed to update deal' : 'Failed to create deal');
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Deal' : 'New Deal'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the deal details below.'
              : 'Fill in the details to create a new deal.'}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4">
        <form id="deal-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pb-4">
          <div className="space-y-1.5">
            <Label htmlFor="deal-name">Name *</Label>
            <Input
              id="deal-name"
              placeholder="Enter deal name"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deal-stage">Stage *</Label>
            <Controller
              control={control}
              name="stage"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((s) => (
                      <SelectItem key={s.stage_id} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.stage && (
              <p className="text-xs text-destructive">{errors.stage.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="deal-value">Value</Label>
              <Input
                id="deal-value"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                {...register('value')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deal-currency">Currency</Label>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="USD" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deal-close-date">Expected Close Date</Label>
            <Input
              id="deal-close-date"
              type="date"
              {...register('expected_close_date')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deal-notes">Notes</Label>
            <Textarea
              id="deal-notes"
              placeholder="Add any additional notes..."
              rows={3}
              {...register('notes')}
            />
          </div>

        </form>
        </div>

        <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="deal-form" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                  ? 'Update Deal'
                  : 'Create Deal'}
            </Button>
          </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
