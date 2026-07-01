'use client';

import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/ui/button';
import { Plus, CalendarDays } from 'lucide-react';

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        description="Track conferences, meetups, and networking events."
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        }
      />
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <CalendarDays className="h-10 w-10 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No events yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add an event to track who you meet and plan follow-ups.
        </p>
        <Button className="mt-4">
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>
    </div>
  );
}
