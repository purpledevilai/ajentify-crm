'use client';

import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/ui/button';
import { Plus, Handshake } from 'lucide-react';

export default function DealsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Deals"
        description="Track your sales pipeline and deal progress."
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Add Deal
          </Button>
        }
      />
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <Handshake className="h-10 w-10 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No deals yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first deal to start tracking your pipeline.
        </p>
        <Button className="mt-4">
          <Plus className="h-4 w-4" />
          Add Deal
        </Button>
      </div>
    </div>
  );
}
