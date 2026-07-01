'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/lib/providers/auth-provider';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import { rpc } from '@/lib/api/rpc';
import { ApiError } from '@/lib/api/client';
import type { Workspace } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const slugRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

const schema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100),
  slug: z
    .string()
    .min(3, 'At least 3 characters')
    .max(50, 'At most 50 characters')
    .regex(slugRegex, 'Lowercase letters, numbers, and hyphens only. Must start and end with a letter or number.'),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

export default function CreateWorkspacePage() {
  const router = useRouter();
  const { refreshWorkspaces } = useAuth();
  const { setActiveWorkspace } = useWorkspace();
  const [slugTouched, setSlugTouched] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', description: '' },
  });

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setValue('name', name);
    if (!slugTouched) {
      setValue('slug', generateSlug(name), { shouldValidate: true });
    }
  }

  async function onSubmit(data: FormValues) {
    try {
      const res = await rpc<{ workspace: Workspace }>('create_workspace', {
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
      });

      setActiveWorkspace(res.workspace);
      await refreshWorkspaces();

      toast.success('Workspace created!');
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error('Failed to create workspace. Please try again.');
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-muted/50 to-background px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Plus className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Create a new workspace
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up another workspace for a different team or project.
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Workspace details</CardTitle>
          <CardDescription>
            A workspace is your team&apos;s CRM — where you manage contacts, deals, and events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Workspace name</Label>
              <Input
                id="name"
                placeholder="e.g. Acme Sales"
                {...register('name')}
                onChange={handleNameChange}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">URL slug</Label>
              <Input
                id="slug"
                placeholder="e.g. acme-sales"
                {...register('slug', {
                  onChange: () => setSlugTouched(true),
                })}
              />
              <p className="text-xs text-muted-foreground">
                This will be used in URLs. Lowercase letters, numbers, and hyphens only.
              </p>
              {errors.slug && (
                <p className="text-xs text-destructive">{errors.slug.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">
                Description <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="What is this workspace for?"
                rows={3}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Create workspace
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
