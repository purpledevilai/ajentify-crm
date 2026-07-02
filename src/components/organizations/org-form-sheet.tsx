'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateOrganization, useUpdateOrganization } from '@/lib/hooks/use-organizations';
import { ORGANIZATION_SIZES } from '@/lib/utils/constants';
import type { Organization } from '@/lib/api/types';

const orgFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  phone: z.string().optional(),
  website: z.string().url('Invalid URL').or(z.literal('')).optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  size: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type OrgFormValues = z.infer<typeof orgFormSchema>;

interface OrgFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization?: Organization;
}

export function OrgFormSheet({ open, onOpenChange, organization }: OrgFormSheetProps) {
  const isEditing = !!organization;
  const createOrg = useCreateOrganization();
  const updateOrg = useUpdateOrganization();

  const form = useForm<OrgFormValues>({
    resolver: zodResolver(orgFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      website: '',
      industry: '',
      location: '',
      size: '',
      description: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: organization?.name ?? '',
        email: organization?.email ?? '',
        phone: organization?.phone ?? '',
        website: organization?.website ?? '',
        industry: organization?.industry ?? '',
        location: organization?.location ?? '',
        size: organization?.size ?? '',
        description: organization?.description ?? '',
        notes: organization?.notes ?? '',
      });
    }
  }, [open, organization, form]);

  const isPending = createOrg.isPending || updateOrg.isPending;

  function onSubmit(values: OrgFormValues) {
    const payload = {
      ...values,
      email: values.email || null,
      phone: values.phone || null,
      website: values.website || null,
      industry: values.industry || null,
      location: values.location || null,
      size: values.size || null,
      description: values.description || null,
      notes: values.notes || null,
    };

    if (isEditing) {
      updateOrg.mutate(
        { organization_id: organization.organization_id, ...payload },
        {
          onSuccess: () => {
            toast.success('Organization updated');
            onOpenChange(false);
          },
          onError: (err) => {
            toast.error(err.message || 'Failed to update organization');
          },
        },
      );
    } else {
      createOrg.mutate(
        payload,
        {
          onSuccess: () => {
            toast.success('Organization created');
            onOpenChange(false);
          },
          onError: (err) => {
            toast.error(err.message || 'Failed to create organization');
          },
        },
      );
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Organization' : 'New Organization'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the organization details below.'
              : 'Fill in the details to create a new organization.'}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          <form
            id="org-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pb-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Company name"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@company.com"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 000-0000"
                {...form.register('phone')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://company.com"
                {...form.register('website')}
              />
              {form.formState.errors.website && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.website.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                placeholder="e.g. Technology, Healthcare"
                {...form.register('industry')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, Country"
                {...form.register('location')}
              />
            </div>

            <div className="space-y-2">
              <Label>Size</Label>
              <Select
                value={form.watch('size') || undefined}
                onValueChange={(val) => form.setValue('size', val as string)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {ORGANIZATION_SIZES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the organization"
                rows={3}
                {...form.register('description')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Internal notes"
                rows={3}
                {...form.register('notes')}
              />
            </div>
          </form>
        </div>

        <SheetFooter>
          <Button
            type="submit"
            form="org-form"
            disabled={isPending}
          >
            {isPending
              ? isEditing
                ? 'Saving...'
                : 'Creating...'
              : isEditing
                ? 'Save Changes'
                : 'Create Organization'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
