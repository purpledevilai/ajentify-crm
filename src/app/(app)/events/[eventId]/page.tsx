'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
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
import { EventFormSheet } from '@/components/events/event-form-sheet';
import { ActivityTimeline } from '@/components/shared/activity-timeline';
import { useEvent, useDeleteEvent } from '@/lib/hooks/use-events';
import { formatFullDate } from '@/lib/utils/format';
import {
  Pencil,
  Trash2,
  MapPin,
  Globe,
  Clock,
  CalendarDays,
  Building2,
  UserCircle,
} from 'lucide-react';
import { RelatedEntitiesCard } from '@/components/shared/related-entities-card';

const EVENT_TYPE_LABELS: Record<string, string> = {
  conference: 'Conference',
  meetup: 'Meetup',
  webinar: 'Webinar',
  trade_show: 'Trade Show',
  networking: 'Networking',
  other: 'Other',
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const { data, isLoading } = useEvent(eventId);
  const deleteEvent = useDeleteEvent();
  const [sheetOpen, setSheetOpen] = useState(false);

  async function handleDelete() {
    try {
      await deleteEvent.mutateAsync(eventId);
      toast.success('Event deleted');
      router.push('/events');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error('Failed to delete event', { description: message });
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <CalendarDays className="h-10 w-10 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Event not found</h3>
        <Link href="/events">
          <Button variant="outline" className="mt-4">Back to Events</Button>
        </Link>
      </div>
    );
  }

  const { event, tags } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={event.name}
        breadcrumbs={[
          { label: 'Events', href: '/events' },
          { label: event.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setSheetOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="destructive" size="icon" />
                }
              >
                <Trash2 className="h-4 w-4" />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Event</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;{event.name}&quot;? This action cannot be undone.
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
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {event.type && (
                  <Badge variant="secondary">
                    {EVENT_TYPE_LABELS[event.type] ?? event.type}
                  </Badge>
                )}
                {tags.map((tag) => (
                  <Badge
                    key={tag.tag_id}
                    variant="outline"
                    style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatFullDate(event.start_date)}
                  {event.end_date && ` – ${formatFullDate(event.end_date)}`}
                </span>
              </div>

              {event.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
              )}

              {event.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={event.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {event.website}
                  </a>
                </div>
              )}

              {event.description && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                  </div>
                </>
              )}

              {event.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-1">Notes</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <RelatedEntitiesCard
            title="Companies"
            icon={Building2}
            entityType="event"
            entityId={eventId}
            relatedType="company"
          />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <RelatedEntitiesCard
            title="Contacts Met"
            icon={UserCircle}
            entityType="event"
            entityId={eventId}
            relatedType="contact"
          />

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline entityType="event" entityId={eventId} />
            </CardContent>
          </Card>
        </div>
      </div>

      <EventFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        event={event}
      />
    </div>
  );
}
