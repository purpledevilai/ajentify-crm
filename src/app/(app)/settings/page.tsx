'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  LogOut,
  Trash2,
  Plus,
  X,
  User,
  Building2,
  GitBranch,
  Tags,
  UsersRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

import { PageHeader } from '@/components/layouts/page-header';
import { useAuth } from '@/lib/providers/auth-provider';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import * as authApi from '@/lib/api/auth';
import { wsRpc } from '@/lib/api/rpc';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  usePipelineStages,
  useCreatePipelineStage,
  useUpdatePipelineStage,
  useDeletePipelineStage,
} from '@/lib/hooks/use-pipeline';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/lib/hooks/use-tags';
import { useWorkspaceMembers, useInviteMember, useRemoveMember } from '@/lib/hooks/use-members';

type SettingsTab = 'profile' | 'workspace' | 'pipeline' | 'tags' | 'members';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'workspace', label: 'Workspace', icon: Building2 },
  { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
  { id: 'tags', label: 'Tags', icon: Tags },
  { id: 'members', label: 'Members', icon: UsersRound },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile, workspace, and team settings."
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar nav (desktop) */}
        <nav className="hidden lg:flex lg:w-56 lg:shrink-0 lg:flex-col lg:gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile horizontal tabs */}
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1 lg:hidden">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6 min-w-0">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'workspace' && <WorkspaceTab />}
          {activeTab === 'pipeline' && <PipelineTab />}
          {activeTab === 'tags' && <TagsTab />}
          {activeTab === 'members' && <MembersTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const { member, logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      first_name: member?.first_name ?? '',
      last_name: member?.last_name ?? '',
    },
  });

  async function onSave(data: { first_name: string; last_name: string }) {
    setIsSaving(true);
    try {
      await authApi.updateMe(data);
      toast.success('Profile updated successfully.');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error('Failed to save profile.');
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    try {
      await authApi.deleteAccount();
      toast.success('Your account has been deleted.');
      await logout();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error('Failed to delete account. Please try again.');
      }
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={member?.email ?? ''} disabled />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="first_name">First name</Label>
                <Input id="first_name" {...register('first_name')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" {...register('last_name')} />
              </div>
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>Sign out of your account on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger
              disabled={isDeleting}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white shadow-xs transition-all hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete account
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account, remove you from all
                  workspaces, and delete any workspaces where you are the sole
                  member. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </>
  );
}

function WorkspaceTab() {
  const { activeWorkspace } = useWorkspace();
  const { refreshWorkspaces, logout } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: activeWorkspace?.name ?? '',
      description: activeWorkspace?.description ?? '',
    },
  });

  async function onSave(data: { name: string; description: string }) {
    if (!activeWorkspace) return;
    setIsSaving(true);
    try {
      await wsRpc('update_workspace', activeWorkspace.workspace_id, {
        name: data.name,
        description: data.description,
      });
      await refreshWorkspaces();
      toast.success('Workspace updated successfully.');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error('Failed to update workspace.');
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteWorkspace() {
    if (!activeWorkspace) return;
    const deletingId = activeWorkspace.workspace_id;
    setIsDeleting(true);
    setDialogOpen(false);
    try {
      await wsRpc('delete_workspace', deletingId, {});
      setDeleteConfirm('');
      toast.success('Workspace deleted.');
      await refreshWorkspaces();
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error('Failed to delete workspace.');
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>Update your workspace settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="ws_name">Name</Label>
              <Input id="ws_name" {...register('name')} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ws_description">Description</Label>
              <Textarea id="ws_description" {...register('description')} rows={3} />
            </div>
            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input value={activeWorkspace?.slug ?? ''} disabled />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Delete workspace</CardTitle>
          <CardDescription>
            Permanently delete this workspace and all its data. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>
              Type <span className="font-mono font-bold">{activeWorkspace?.name}</span> to confirm
            </Label>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type workspace name..."
            />
          </div>
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger
              disabled={isDeleting || deleteConfirm !== activeWorkspace?.name}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white shadow-xs transition-all hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete workspace
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &quot;{activeWorkspace?.name}&quot; and all
                  associated data including contacts, deals, and activities.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteWorkspace}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Yes, delete workspace
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </>
  );
}

function PipelineTab() {
  const stagesQuery = usePipelineStages();
  const createStage = useCreatePipelineStage();
  const updateStage = useUpdatePipelineStage();
  const deleteStage = useDeletePipelineStage();

  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('#3b82f6');

  async function handleAddStage() {
    if (!newStageName.trim()) return;
    try {
      await createStage.mutateAsync({ name: newStageName.trim(), color: newStageColor });
      setNewStageName('');
      toast.success('Stage created.');
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error('Failed to create stage.');
    }
  }

  async function handleUpdateStage(
    stageId: string,
    updates: { name?: string; color?: string; is_closed?: boolean; is_won?: boolean }
  ) {
    try {
      await updateStage.mutateAsync({ stage_id: stageId, ...updates });
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error('Failed to update stage.');
    }
  }

  async function handleDeleteStage(stageId: string) {
    try {
      await deleteStage.mutateAsync(stageId);
      toast.success('Stage deleted.');
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error('Failed to delete stage.');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Stages</CardTitle>
        <CardDescription>Configure your deal pipeline stages.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stagesQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {stagesQuery.data?.stages.map((stage) => (
              <StageRow
                key={stage.stage_id}
                stage={stage}
                onUpdate={(updates) => handleUpdateStage(stage.stage_id, updates)}
                onDelete={() => handleDeleteStage(stage.stage_id)}
              />
            ))}
          </div>
        )}

        <Separator />

        <div className="flex items-center gap-2">
          <Input
            placeholder="New stage name..."
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddStage();
              }
            }}
          />
          <input
            type="color"
            value={newStageColor}
            onChange={(e) => setNewStageColor(e.target.value)}
            className="h-9 w-9 shrink-0 cursor-pointer rounded-md border"
          />
          <Button
            onClick={handleAddStage}
            disabled={!newStageName.trim() || createStage.isPending}
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StageRow({
  stage,
  onUpdate,
  onDelete,
}: {
  stage: { stage_id: string; name: string; color: string | null; is_closed: boolean; is_won: boolean };
  onUpdate: (updates: { name?: string; color?: string; is_closed?: boolean; is_won?: boolean }) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(stage.name);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
      <input
        type="color"
        value={stage.color ?? '#94a3b8'}
        onChange={(e) => onUpdate({ color: e.target.value })}
        className="h-8 w-8 shrink-0 cursor-pointer rounded border-0"
      />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          if (name !== stage.name && name.trim()) {
            onUpdate({ name: name.trim() });
          }
        }}
        className="flex-1 min-w-[120px]"
      />
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch
            checked={stage.is_closed}
            onCheckedChange={(val) => onUpdate({ is_closed: val })}
            size="sm"
          />
          Closed
        </label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch
            checked={stage.is_won}
            onCheckedChange={(val) => onUpdate({ is_won: val })}
            size="sm"
          />
          Won
        </label>
      </div>
      <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function TagsTab() {
  const tagsQuery = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#8b5cf6');

  async function handleAddTag() {
    if (!newTagName.trim()) return;
    try {
      await createTag.mutateAsync({ name: newTagName.trim(), color: newTagColor });
      setNewTagName('');
      toast.success('Tag created.');
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error('Failed to create tag.');
    }
  }

  async function handleDeleteTag(tagId: string) {
    try {
      await deleteTag.mutateAsync(tagId);
      toast.success('Tag deleted.');
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error('Failed to delete tag.');
    }
  }

  async function handleUpdateTag(tagId: string, updates: { name?: string; color?: string }) {
    try {
      await updateTag.mutateAsync({ tag_id: tagId, ...updates });
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error('Failed to update tag.');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
        <CardDescription>Manage tags to organize contacts, deals, and events.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tagsQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : tagsQuery.data?.tags.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No tags yet. Create one below.
          </p>
        ) : (
          <div className="space-y-2">
            {tagsQuery.data?.tags.map((tag) => (
              <TagRow
                key={tag.tag_id}
                tag={tag}
                onUpdate={(updates) => handleUpdateTag(tag.tag_id, updates)}
                onDelete={() => handleDeleteTag(tag.tag_id)}
              />
            ))}
          </div>
        )}

        <Separator />

        <div className="flex items-center gap-2">
          <Input
            placeholder="New tag name..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <input
            type="color"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            className="h-9 w-9 shrink-0 cursor-pointer rounded-md border"
          />
          <Button
            onClick={handleAddTag}
            disabled={!newTagName.trim() || createTag.isPending}
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TagRow({
  tag,
  onUpdate,
  onDelete,
}: {
  tag: { tag_id: string; name: string; color: string | null };
  onUpdate: (updates: { name?: string; color?: string }) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(tag.name);

  return (
    <div className="flex items-center gap-3 rounded-md border px-3 py-2">
      <input
        type="color"
        value={tag.color ?? '#6b7280'}
        onChange={(e) => onUpdate({ color: e.target.value })}
        className="h-7 w-7 shrink-0 cursor-pointer rounded border-0"
      />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          if (name !== tag.name && name.trim()) {
            onUpdate({ name: name.trim() });
          }
        }}
        className="flex-1"
      />
      <AlertDialog>
        <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md p-2 text-destructive hover:bg-destructive/10">
          <X className="h-4 w-4" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tag &quot;{tag.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the tag from all associated entities. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MembersTab() {
  const { member } = useAuth();
  const membersQuery = useWorkspaceMembers();
  const inviteMember = useInviteMember();
  const removeMember = useRemoveMember();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    try {
      await inviteMember.mutateAsync({ email: inviteEmail.trim(), role: inviteRole });
      setInviteEmail('');
      toast.success('Invitation sent.');
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error('Failed to invite member.');
    }
  }

  async function handleRemoveMember(memberId: string) {
    try {
      await removeMember.mutateAsync(memberId);
      toast.success('Member removed.');
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error('Failed to remove member.');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>Manage who has access to this workspace.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {membersQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {membersQuery.data?.members.map((m) => (
              <div
                key={m.member_id}
                className="flex items-center gap-3 rounded-md border px-3 py-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {m.first_name[0]}{m.last_name?.[0] ?? ''}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {m.first_name} {m.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                </div>
                <Badge variant="secondary" className="text-xs capitalize">
                  {m.role}
                </Badge>
                {m.member_id !== member?.member_id && (
                  <AlertDialog>
                    <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md p-2 text-destructive hover:bg-destructive/10">
                      <X className="h-4 w-4" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove member?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Remove {m.first_name} {m.last_name} from this workspace?
                          They will lose access immediately.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveMember(m.member_id)}
                          className="bg-destructive text-white hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        )}

        <Separator />

        <div className="space-y-3">
          <p className="text-sm font-medium">Invite a member</p>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Email address..."
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleInvite();
                }
              }}
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail.trim() || inviteMember.isPending}
              size="sm"
            >
              {inviteMember.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
