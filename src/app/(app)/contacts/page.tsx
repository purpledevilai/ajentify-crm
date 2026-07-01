'use client';

import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="Manage your contacts and relationships."
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        }
      />
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <Users className="h-10 w-10 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No contacts yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first contact to start building relationships.
        </p>
        <Button className="mt-4">
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>
    </div>
  );
}
