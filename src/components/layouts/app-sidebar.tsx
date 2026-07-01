'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers/auth-provider';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  Building2,
  Handshake,
  CalendarDays,
  CheckSquare,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Plus,
} from 'lucide-react';

const COLLAPSE_KEY = 'ajentify_sidebar_collapsed';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Contacts', href: '/contacts', icon: Users },
  { label: 'Organizations', href: '/organizations', icon: Building2 },
  { label: 'Deals', href: '/deals', icon: Handshake },
  { label: 'Events', href: '/events', icon: CalendarDays },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Activities', href: '/activities', icon: Activity },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { member, logout } = useAuth();
  const { activeWorkspace, setActiveWorkspace, workspaces } = useWorkspace();
  const { setTheme } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSE_KEY);
    if (stored === 'true') setCollapsed(true);
  }, []);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(COLLAPSE_KEY, String(next));
  }

  const memberName = member
    ? `${member.first_name} ${member.last_name}`.trim()
    : '';

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen border-r bg-sidebar text-sidebar-foreground transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="p-3">
        {collapsed ? (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-md bg-sidebar-accent text-sm font-semibold cursor-default"
            title={activeWorkspace?.name ?? 'Workspace'}
          >
            {activeWorkspace?.name?.[0]?.toUpperCase() ?? 'W'}
          </div>
        ) : (
          <Select
            value={activeWorkspace?.workspace_id ?? ''}
            onValueChange={(id) => {
              if (id === '__create__') {
                router.push('/create-workspace');
                return;
              }
              const ws = workspaces.find((w) => w.workspace_id === id);
              if (ws) setActiveWorkspace(ws);
            }}
          >
            <SelectTrigger className="w-full">
              <span className="truncate">
                {activeWorkspace?.name ?? 'Select workspace'}
              </span>
            </SelectTrigger>
            <SelectContent>
              {workspaces.map((ws) => (
                <SelectItem key={ws.workspace_id} value={ws.workspace_id}>
                  {ws.name}
                </SelectItem>
              ))}
              <SelectSeparator />
              <SelectItem value="__create__">
                <span className="flex items-center gap-2">
                  <Plus className="h-3.5 w-3.5" />
                  Create workspace
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <Separator />

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                collapsed && 'justify-center px-0',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="p-2 space-y-1">
        <Link
          href="/settings"
          title={collapsed ? 'Settings' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            pathname.startsWith('/settings')
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
            collapsed && 'justify-center px-0',
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent/50 outline-none',
              collapsed && 'justify-center px-0',
            )}
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={member?.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">
                {memberName ? getInitials(memberName) : '?'}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <span className="truncate text-sidebar-foreground/70">
                {memberName || member?.email}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-48">
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'w-full',
            collapsed ? 'justify-center px-0' : 'justify-start',
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
