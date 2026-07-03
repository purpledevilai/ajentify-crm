'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Link2,
  Pencil,
  Trash2,
  ExternalLink,
  ClipboardList,
  Activity,
  Building2,
  Handshake,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { ContactFormSheet } from '@/components/contacts/contact-form-sheet';
import { ActivityTimeline } from '@/components/shared/activity-timeline';
import { EntityTasks } from '@/components/shared/entity-tasks';
import { ActivityFormSheet } from '@/components/activities/activity-form-sheet';
import { TaskFormSheet } from '@/components/tasks/task-form-sheet';
import { useContact, useDeleteContact } from '@/lib/hooks/use-contacts';
import { CONTACT_STATUSES } from '@/lib/utils/constants';
import { formatContactName, getInitials, formatDate } from '@/lib/utils/format';

export default function ContactDetailPage() {
  const params = useParams<{ contactId: string }>();
  const router = useRouter();
  const contactId = params.contactId;

  const { data, isLoading } = useContact(contactId);
  const deleteContact = useDeleteContact();

  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activitySheetOpen, setActivitySheetOpen] = useState(false);
  const [taskSheetOpen, setTaskSheetOpen] = useState(false);

  const contact = data?.contact;
  const companies = data?.companies ?? [];
  const tags = data?.tags ?? [];
  const dealRelationships = data?.deal_relationships ?? [];

  const handleDelete = async () => {
    if (!contactId) return;
    try {
      await deleteContact.mutateAsync(contactId);
      toast.success('Contact deleted');
      router.push('/contacts');
    } catch {
      toast.error('Failed to delete contact');
    }
  };

  const statusConfig = contact
    ? CONTACT_STATUSES.find((s) => s.value === contact.status)
    : null;

  if (isLoading) {
    return <ContactDetailSkeleton />;
  }

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-lg font-semibold">Contact not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This contact may have been deleted.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/contacts')}>
          Back to Contacts
        </Button>
      </div>
    );
  }

  const fullName = formatContactName(contact);

  return (
    <div className="space-y-6">
      <PageHeader
        title={fullName}
        breadcrumbs={[
          { label: 'Contacts', href: '/contacts' },
          { label: fullName },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setEditSheetOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-1">
          {/* Contact header card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar size="lg" className="h-16 w-16">
                  {contact.avatar_url && (
                    <AvatarImage src={contact.avatar_url} alt={fullName} />
                  )}
                  <AvatarFallback className="text-lg">{getInitials(fullName)}</AvatarFallback>
                </Avatar>
                <h2 className="mt-3 text-lg font-semibold">{fullName}</h2>
                {(contact.job_title || contact.company_name) && (
                  <p className="text-sm text-muted-foreground">
                    {contact.job_title}
                    {contact.job_title && contact.company_name && ' @ '}
                    {contact.company_name}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2 flex-wrap justify-center">
                  {statusConfig && (
                    <Badge
                      variant="outline"
                      className="border-transparent"
                      style={{
                        backgroundColor: `${statusConfig.color}15`,
                        color: statusConfig.color,
                      }}
                    >
                      {statusConfig.label}
                    </Badge>
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

              <Separator className="my-4" />

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setActivitySheetOpen(true)}
                >
                  <Activity className="h-4 w-4" />
                  Log Activity
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setTaskSheetOpen(true)}
                >
                  <ClipboardList className="h-4 w-4" />
                  Create Task
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact details card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contact.email && (
                <DetailRow icon={Mail} label="Email">
                  <a href={`mailto:${contact.email}`} className="text-sm hover:underline text-primary">
                    {contact.email}
                  </a>
                </DetailRow>
              )}
              {contact.phone && (
                <DetailRow icon={Phone} label="Phone">
                  <a href={`tel:${contact.phone}`} className="text-sm hover:underline text-primary">
                    {contact.phone}
                  </a>
                </DetailRow>
              )}
              {contact.location && (
                <DetailRow icon={MapPin} label="Location">
                  <span className="text-sm">{contact.location}</span>
                </DetailRow>
              )}
              {contact.linkedin_url && (
                <DetailRow icon={Link2} label="LinkedIn">
                  <a
                    href={contact.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Profile
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </DetailRow>
              )}
              {contact.source && (
                <DetailRow icon={ExternalLink} label="Source">
                  <Badge variant="secondary">{contact.source}</Badge>
                </DetailRow>
              )}
              {contact.bio && (
                <>
                  <Separator />
                  <p className="text-sm text-muted-foreground">{contact.bio}</p>
                </>
              )}
              {!contact.email && !contact.phone && !contact.location && !contact.linkedin_url && !contact.bio && (
                <p className="text-sm text-muted-foreground text-center py-2">No details added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Companies */}
          {companies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {companies.map((org) => (
                    <Link
                      key={org.company_id}
                      href={`/companies/${org.company_id}`}
                      className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/50 transition-colors"
                    >
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{org.name}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deals */}
          {dealRelationships.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dealRelationships.map((deal) => (
                    <Link
                      key={deal.deal_id}
                      href={`/deals/${deal.deal_id}`}
                      className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/50 transition-colors"
                    >
                      <Handshake className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Deal</span>
                      {deal.role && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          {deal.role}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline entityType="contact" entityId={contactId} />
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <EntityTasks entityType="contact" entityId={contactId} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sheets & Dialogs */}
      <ContactFormSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        contact={contact}
      />

      <ActivityFormSheet
        open={activitySheetOpen}
        onOpenChange={setActivitySheetOpen}
        entityType="contact"
        entityId={contactId}
      />

      <TaskFormSheet
        open={taskSheetOpen}
        onOpenChange={setTaskSheetOpen}
        entityType="contact"
        entityId={contactId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {fullName}? This action cannot be undone.
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
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {children}
      </div>
    </div>
  );
}

function ContactDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="mt-3 h-5 w-32" />
                <Skeleton className="mt-2 h-4 w-40" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-20" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
