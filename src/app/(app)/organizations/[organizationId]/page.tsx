'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layouts/page-header';
import { OrgFormSheet } from '@/components/organizations/org-form-sheet';
import { ActivityTimeline } from '@/components/shared/activity-timeline';
import { EntityTasks } from '@/components/shared/entity-tasks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useOrganization, useDeleteOrganization } from '@/lib/hooks/use-organizations';
import { formatDate, getInitials } from '@/lib/utils/format';
import { ORGANIZATION_SIZES } from '@/lib/utils/constants';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Pencil,
  Trash2,
  Users,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

function getSizeLabel(value: string | null): string | null {
  if (!value) return null;
  const found = ORGANIZATION_SIZES.find((s) => s.value === value);
  return found ? found.label : value;
}

export default function OrganizationDetailPage() {
  const params = useParams<{ organizationId: string }>();
  const router = useRouter();
  const orgId = params.organizationId;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading } = useOrganization(orgId);
  const deleteOrg = useDeleteOrganization();

  const organization = data?.organization;
  const contacts = data?.contacts ?? [];
  const tags = data?.tags ?? [];

  function handleDelete() {
    if (!orgId) return;
    deleteOrg.mutate(orgId, {
      onSuccess: () => {
        toast.success('Organization deleted');
        router.push('/organizations');
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to delete organization');
      },
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Building2 className="h-10 w-10 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Organization not found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          This organization may have been deleted.
        </p>
        <Button className="mt-4" variant="outline" onClick={() => router.push('/organizations')}>
          Back to Organizations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={organization.name}
        breadcrumbs={[
          { label: 'Organizations', href: '/organizations' },
          { label: organization.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Org Header Card */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <Avatar size="lg">
                {organization.logo_url && (
                  <AvatarImage src={organization.logo_url} alt={organization.name} />
                )}
                <AvatarFallback className="text-lg">
                  {getInitials(organization.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <h2 className="text-xl font-semibold">{organization.name}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  {organization.industry && (
                    <Badge variant="secondary">{organization.industry}</Badge>
                  )}
                  {organization.size && (
                    <Badge variant="outline">{getSizeLabel(organization.size)}</Badge>
                  )}
                  {tags.map((tag) => (
                    <Badge
                      key={tag.tag_id}
                      variant="secondary"
                      style={tag.color ? { backgroundColor: `${tag.color}20`, color: tag.color } : undefined}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Details Card */}
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Details</h3>
            <div className="space-y-3">
              {organization.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${organization.email}`} className="hover:underline">
                    {organization.email}
                  </a>
                </div>
              )}
              {organization.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{organization.phone}</span>
                </div>
              )}
              {organization.website && (
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    {organization.website.replace(/^https?:\/\//, '')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {organization.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{organization.location}</span>
                </div>
              )}

              {!organization.email && !organization.phone && !organization.website && !organization.location && (
                <p className="text-sm text-muted-foreground">No contact details added yet.</p>
              )}

              {organization.description && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-muted-foreground">Description</h4>
                    <p className="text-sm whitespace-pre-wrap">{organization.description}</p>
                  </div>
                </>
              )}

              {organization.notes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-muted-foreground">Notes</h4>
                    <p className="text-sm whitespace-pre-wrap">{organization.notes}</p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* People Section */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                People ({contacts.length})
              </h3>
            </div>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No contacts associated with this organization.
              </p>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <Link
                    key={contact.contact_id}
                    href={`/contacts/${contact.contact_id}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                  >
                    <Avatar size="sm">
                      <AvatarFallback>
                        {getInitials(
                          `${contact.first_name} ${contact.last_name ?? ''}`.trim(),
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {contact.first_name} {contact.last_name ?? ''}
                      </p>
                      {contact.job_title && (
                        <p className="text-xs text-muted-foreground truncate">
                          {contact.job_title}
                        </p>
                      )}
                    </div>
                    {contact.email && (
                      <span className="hidden text-xs text-muted-foreground sm:inline truncate max-w-[160px]">
                        {contact.email}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <ActivityTimeline entityType="organization" entityId={orgId} />
          <EntityTasks entityType="organization" entityId={orgId} />
        </div>
      </div>

      <OrgFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        organization={organization}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{organization.name}&rdquo;? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteOrg.isPending}
            >
              {deleteOrg.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
