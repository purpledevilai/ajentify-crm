'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useCreateActivity } from '@/lib/hooks/use-activities';

const ACTIVITY_TYPE_OPTIONS = [
  { value: 'note', label: 'Note' },
  { value: 'email', label: 'Email' },
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
] as const;

const activityFormSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  title: z.string().optional(),
  content: z.string().optional(),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

interface ActivityFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
  entityId: string;
}

export function ActivityFormSheet({
  open,
  onOpenChange,
  entityType,
  entityId,
}: ActivityFormSheetProps) {
  const createActivity = useCreateActivity();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      type: 'note',
      title: '',
      content: '',
    },
  });

  async function onSubmit(data: ActivityFormValues) {
    try {
      await createActivity.mutateAsync({
        type: data.type,
        title: data.title || undefined,
        content: data.content || undefined,
        entity_type: entityType,
        entity_id: entityId,
      });
      toast.success('Activity logged');
      reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to log activity');
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Log Activity</SheetTitle>
          <SheetDescription>Record an activity for this record.</SheetDescription>
        </SheetHeader>
        <form id="activity-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-4 px-4">
          <div className="space-y-1.5">
            <Label>Type *</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="activity-title">Title</Label>
            <Input
              id="activity-title"
              placeholder="Brief summary..."
              {...register('title')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="activity-content">Content</Label>
            <Textarea
              id="activity-content"
              placeholder="Details about this activity..."
              rows={4}
              {...register('content')}
            />
          </div>
        </form>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
            Cancel
          </Button>
          <Button type="submit" form="activity-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Log Activity'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
