'use client';

import { useEffect } from 'react';
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
import { useCreateEvent, useUpdateEvent } from '@/lib/hooks/use-events';
import type { CrmEvent } from '@/lib/api/types';

const EVENT_TYPES = [
  { value: 'conference', label: 'Conference' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'trade_show', label: 'Trade Show' },
  { value: 'networking', label: 'Networking' },
  { value: 'other', label: 'Other' },
] as const;

function epochToDatetimeLocal(epoch: number): string {
  const d = new Date(epoch);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToEpoch(value: string): number {
  return new Date(value).getTime();
}

const eventFormSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  type: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CrmEvent | null;
}

export function EventFormSheet({ open, onOpenChange, event }: EventFormSheetProps) {
  const isEditing = !!event;
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: '',
      start_date: '',
      end_date: '',
      type: '',
      location: '',
      website: '',
      description: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (event) {
      reset({
        name: event.name,
        start_date: epochToDatetimeLocal(event.start_date),
        end_date: event.end_date ? epochToDatetimeLocal(event.end_date) : '',
        type: event.type ?? '',
        location: event.location ?? '',
        website: event.website ?? '',
        description: event.description ?? '',
        notes: event.notes ?? '',
      });
    } else {
      reset({
        name: '',
        start_date: '',
        end_date: '',
        type: '',
        location: '',
        website: '',
        description: '',
        notes: '',
      });
    }
  }, [event, reset]);

  async function onSubmit(data: EventFormValues) {
    const payload: Record<string, unknown> = {
      name: data.name,
      start_date: data.start_date,
      end_date: data.end_date || null,
      type: data.type || null,
      location: data.location || null,
      website: data.website || null,
      description: data.description || null,
      notes: data.notes || null,
    };

    try {
      if (isEditing) {
        await updateEvent.mutateAsync({ event_id: event.event_id, ...payload });
        toast.success('Event updated successfully');
      } else {
        await createEvent.mutateAsync(payload as { name: string; start_date: number });
        toast.success('Event created successfully');
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(isEditing ? 'Failed to update event' : 'Failed to create event', {
        description: message,
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Event' : 'Create Event'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the event details below.'
              : 'Fill in the details to create a new event.'}
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          <form id="event-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Event name *</Label>
              <Input
                id="name"
                placeholder="Annual Tech Conference"
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start_date">Start date *</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  aria-invalid={!!errors.start_date}
                  {...register('start_date')}
                />
                {errors.start_date && (
                  <p className="text-xs text-destructive">{errors.start_date.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end_date">End date</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  {...register('end_date')}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Type</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="San Francisco, CA"
                {...register('location')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://example.com"
                aria-invalid={!!errors.website}
                {...register('website')}
              />
              {errors.website && (
                <p className="text-xs text-destructive">{errors.website.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What is this event about?"
                rows={3}
                {...register('description')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Internal notes..."
                rows={3}
                {...register('notes')}
              />
            </div>
          </form>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
            Cancel
          </Button>
          <Button type="submit" form="event-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Event'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
