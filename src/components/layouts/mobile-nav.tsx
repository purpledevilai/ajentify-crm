'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/providers/auth-provider';
import { useWorkspace } from '@/lib/providers/workspace-provider';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  Handshake,
  CheckSquare,
  Menu,
  Building2,
  CalendarDays,
  Activity,
  Settings,
  LogOut,
  ChevronsUpDown,
} from 'lucide-react';

const tabs = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Contacts', href: '/contacts', icon: Users },
  { label: 'Deals', href: '/deals', icon: Handshake },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
];

const moreItems = [
  { label: 'Companies', href: '/companies', icon: Building2 },
  { label: 'Events', href: '/events', icon: CalendarDays },
  { label: 'Activities', href: '/activities', icon: Activity },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { activeWorkspace, setActiveWorkspace, workspaces } = useWorkspace();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground',
            )}
          >
            <tab.icon className="h-5 w-5" />
            <span>{tab.label}</span>
          </Link>
        );
      })}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs text-muted-foreground"
        >
          <Menu className="h-5 w-5" />
          <span>More</span>
        </SheetTrigger>
        <SheetContent side="bottom" className="pb-[env(safe-area-inset-bottom)]">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="grid gap-1 py-4">
            {workspaces.length > 1 && (
              <>
                <div className="px-3 pb-1">
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">Workspace</p>
                  <Select
                    value={activeWorkspace?.workspace_id ?? ''}
                    onValueChange={(id) => {
                      const ws = workspaces.find((w) => w.workspace_id === id);
                      if (ws) setActiveWorkspace(ws);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <span className="flex items-center gap-2 truncate">
                        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        {activeWorkspace?.name ?? 'Select workspace'}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {workspaces.map((ws) => (
                        <SelectItem key={ws.workspace_id} value={ws.workspace_id}>
                          {ws.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Separator className="my-1" />
              </>
            )}
            {moreItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-accent/50',
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <Separator className="my-1" />
            <button
              onClick={async () => {
                setOpen(false);
                await logout();
              }}
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              <span>Log out</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
