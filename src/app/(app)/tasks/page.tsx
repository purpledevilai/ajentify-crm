'use client';

import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare } from 'lucide-react';

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Manage your to-dos and follow-ups."
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        }
      />
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <CheckSquare className="h-10 w-10 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No tasks yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a task to keep track of what needs to be done.
        </p>
        <Button className="mt-4">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>
    </div>
  );
}
