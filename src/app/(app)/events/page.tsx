'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EventFormSheet } from '@/components/events/event-form-sheet';
import { useEvents } from '@/lib/hooks/use-events';
import { formatDate, formatFullDate } from '@/lib/utils/format';
import {
  Plus,
  CalendarDays,
  MapPin,
  Globe,
  Clock,
} from 'lucide-react';
import type { CrmEvent } from '@/lib/api/types';

type TimeFilter = 'all' | 'upcoming' | 'past';

const EVENT_TYPE_LABELS: Record<string, string> = {
  conference: 'Conference',
  meetup: 'Meetup',
  webinar: 'Webinar',
  trade_show: 'Trade Show',
  networking: 'Networking',
  other: 'Other',
};

function getEventStatus(event: CrmEvent): 'upcoming' | 'in_progress' | 'past' {
  const now = Date.now();
  if (event.end_date && event.end_date < now) return 'past';
  if (event.start_date > now) return 'upcoming';
  if (event.start_date <= now && (!event.end_date || event.end_date >= now)) return 'in_progress';
  return 'past';
}

const STATUS_STYLES: Record<string, { dot: string; label: string }> = {
  upcoming: { dot: 'bg-blue-500', label: 'Upcoming' },
  in_progress: { dot: 'bg-green-500', label: 'In Progress' },
  past: { dot: 'bg-gray-400', label: 'Past' },
};

function EventCardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const filters = useMemo(() => {
    if (timeFilter === 'upcoming') return { upcoming: true };
    if (timeFilter === 'past') return { past: true };
    return undefined;
  }, [timeFilter]);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useEvents(filters);

  const events = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.events ?? []) ?? [];
    return all.sort((a, b) => a.start_date - b.start_date);
  }, [data]);

  function handleCreate() {
    setSheetOpen(true);
  }

  const filterOptions: { value: TimeFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'past', label: 'Past' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        description="Track conferences, meetups, and networking events."
        actions={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        {filterOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={timeFilter === opt.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <CalendarDays className="h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No events yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add an event to track who you meet and plan follow-ups.
          </p>
          <Button className="mt-4" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const status = getEventStatus(event);
              const style = STATUS_STYLES[status];
              return (
                <Card
                  key={event.event_id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => router.push(`/events/${event.event_id}`)}
                >
                  <CardContent className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium leading-snug line-clamp-2">{event.name}</h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                        <span className="text-xs text-muted-foreground">{style.label}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {formatFullDate(event.start_date)}
                        {event.end_date && ` – ${formatFullDate(event.end_date)}`}
                      </span>
                    </div>

                    {event.type && (
                      <Badge variant="secondary">
                        {EVENT_TYPE_LABELS[event.type] ?? event.type}
                      </Badge>
                    )}

                    {event.location && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}

                    {event.website && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{event.website}</span>
                      </div>
                    )}

                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="text-xs text-muted-foreground/60">
                      Added {formatDate(event.created_at)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
        </>
      )}

      <EventFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
