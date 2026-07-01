'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCreateContact, useUpdateContact } from '@/lib/hooks/use-contacts';
import { CONTACT_SOURCES, CONTACT_STATUSES } from '@/lib/utils/constants';
import type { Contact } from '@/lib/api/types';

const contactFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  company_name: z.string().optional(),
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  location: z.string().optional(),
  source: z.string().optional(),
  status: z.string().optional(),
  bio: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
}

export function ContactFormSheet({ open, onOpenChange, contact }: ContactFormSheetProps) {
  const isEditing = !!contact;
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      job_title: '',
      company_name: '',
      linkedin_url: '',
      location: '',
      source: '',
      status: 'lead',
      bio: '',
    },
  });

  useEffect(() => {
    if (contact) {
      reset({
        first_name: contact.first_name,
        last_name: contact.last_name ?? '',
        email: contact.email ?? '',
        phone: contact.phone ?? '',
        job_title: contact.job_title ?? '',
        company_name: contact.company_name ?? '',
        linkedin_url: contact.linkedin_url ?? '',
        location: contact.location ?? '',
        source: contact.source ?? '',
        status: contact.status ?? 'lead',
        bio: contact.bio ?? '',
      });
    } else {
      reset({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        job_title: '',
        company_name: '',
        linkedin_url: '',
        location: '',
        source: '',
        status: 'lead',
        bio: '',
      });
    }
  }, [contact, reset]);

  async function onSubmit(data: ContactFormValues) {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name || null,
      email: data.email || null,
      phone: data.phone || null,
      job_title: data.job_title || null,
      company_name: data.company_name || null,
      linkedin_url: data.linkedin_url || null,
      location: data.location || null,
      source: data.source || null,
      status: data.status || 'lead',
      bio: data.bio || null,
    };

    try {
      if (isEditing) {
        await updateContact.mutateAsync({ contact_id: contact.contact_id, ...payload });
        toast.success('Contact updated successfully');
      } else {
        await createContact.mutateAsync(payload);
        toast.success('Contact created successfully');
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(isEditing ? 'Failed to update contact' : 'Failed to create contact', {
        description: message,
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Contact' : 'Add Contact'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the contact information below.'
              : 'Fill in the details to create a new contact.'}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 px-4">
          <form id="contact-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="first_name">First name *</Label>
                <Input
                  id="first_name"
                  placeholder="John"
                  aria-invalid={!!errors.first_name}
                  {...register('first_name')}
                />
                {errors.first_name && (
                  <p className="text-xs text-destructive">{errors.first_name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" placeholder="Doe" {...register('last_name')} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" {...register('phone')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="job_title">Job title</Label>
                <Input id="job_title" placeholder="CEO" {...register('job_title')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company_name">Company</Label>
                <Input id="company_name" placeholder="Acme Inc." {...register('company_name')} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                placeholder="https://linkedin.com/in/..."
                aria-invalid={!!errors.linkedin_url}
                {...register('linkedin_url')}
              />
              {errors.linkedin_url && (
                <p className="text-xs text-destructive">{errors.linkedin_url.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="San Francisco, CA" {...register('location')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Source</Label>
                <Controller
                  control={control}
                  name="source"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTACT_SOURCES.map((source) => (
                          <SelectItem key={source.value} value={source.value}>
                            {source.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTACT_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="A brief description of the contact..."
                rows={3}
                {...register('bio')}
              />
            </div>
          </form>
        </ScrollArea>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
            Cancel
          </Button>
          <Button type="submit" form="contact-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Contact'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
