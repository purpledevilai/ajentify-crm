'use client';

import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/ui/button';
import { Plus, Building2 } from 'lucide-react';

export default function OrganizationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizations"
        description="Manage companies and groups your contacts belong to."
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Add Organization
          </Button>
        }
      />
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <Building2 className="h-10 w-10 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No organizations yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add an organization to start tracking company relationships.
        </p>
        <Button className="mt-4">
          <Plus className="h-4 w-4" />
          Add Organization
        </Button>
      </div>
    </div>
  );
}
