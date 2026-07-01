'use client';

import { PageHeader } from '@/components/layouts/page-header';
import { Activity } from 'lucide-react';

export default function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Activities"
        description="A timeline of everything happening across your workspace."
      />
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <Activity className="h-10 w-10 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No activity yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Activities will appear here as you log calls, notes, emails, and meetings.
        </p>
      </div>
    </div>
  );
}
