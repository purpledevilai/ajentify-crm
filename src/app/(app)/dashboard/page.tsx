'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Handshake,
  CalendarDays,
  CheckSquare,
  StickyNote,
  Mail,
  Phone,
  Calendar,
  ArrowRight,
  Trophy,
  XCircle,
  UserPlus,
  RefreshCw,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { isToday, isBefore, startOfDay, endOfWeek, isAfter } from 'date-fns';

import { PageHeader } from '@/components/layouts/page-header';
import { useAuth } from '@/lib/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useContacts } from '@/lib/hooks/use-contacts';
import { usePipeline } from '@/lib/hooks/use-deals';
import { useTasks, useUpdateTask } from '@/lib/hooks/use-tasks';
import { useActivities } from '@/lib/hooks/use-activities';
import { useEvents } from '@/lib/hooks/use-events';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { PRIORITY_LEVELS } from '@/lib/utils/constants';
import type { Task } from '@/lib/api/types';

const ACTIVITY_ICON_MAP: Record<string, React.ElementType> = {
  note: StickyNote,
  email: Mail,
  call: Phone,
  meeting: Calendar,
  task: CheckSquare,
  deal_created: Handshake,
  deal_stage_changed: ArrowRight,
  deal_won: Trophy,
  deal_lost: XCircle,
  contact_created: UserPlus,
  status_changed: RefreshCw,
  ai_insight: Sparkles,
};

export default function DashboardPage() {
  const { member } = useAuth();
  const contactsQuery = useContacts();
  const pipelineQuery = usePipeline();
  const tasksQuery = useTasks({ member_id: member?.member_id });
  const activitiesQuery = useActivities();
  const eventsQuery = useEvents({ upcoming: true });
  const updateTask = useUpdateTask();

  const allTasks = useMemo(() => {
    return tasksQuery.data?.pages.flatMap((p) => p.tasks) ?? [];
  }, [tasksQuery.data]);

  const allActivities = useMemo(() => {
    return activitiesQuery.data?.pages.flatMap((p) => p.activities).slice(0, 10) ?? [];
  }, [activitiesQuery.data]);

  const upcomingEvents = useMemo(() => {
    return eventsQuery.data?.pages.flatMap((p) => p.events) ?? [];
  }, [eventsQuery.data]);

  const contactCount = useMemo(() => {
    const firstPage = contactsQuery.data?.pages[0];
    if (!firstPage) return 0;
    return firstPage.contacts.length;
  }, [contactsQuery.data]);

  const pipelineStats = useMemo(() => {
    if (!pipelineQuery.data) return { dealCount: 0, totalValue: 0 };
    const allDeals = Object.values(pipelineQuery.data.pipeline).flat();
    const openDeals = allDeals.filter((d) => {
      const stage = pipelineQuery.data.stages.find((s) => s.name === d.stage || s.stage_id === d.stage);
      return !stage?.is_closed;
    });
    return {
      dealCount: openDeals.length,
      totalValue: openDeals.reduce((sum, d) => sum + (d.value ?? 0), 0),
    };
  }, [pipelineQuery.data]);

  const tasksDueToday = useMemo(() => {
    return allTasks.filter(
      (t) => t.due_date && isToday(new Date(t.due_date)) && !t.completed_at
    ).length;
  }, [allTasks]);

  const nextEvent = useMemo(() => {
    if (upcomingEvents.length === 0) return null;
    return upcomingEvents[0];
  }, [upcomingEvents]);

  const { overdueTasks, todayTasks, weekTasks } = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const incomplete = allTasks.filter((t) => !t.completed_at);

    const overdue = incomplete.filter(
      (t) => t.due_date && isBefore(new Date(t.due_date), todayStart)
    ).slice(0, 5);

    const today = incomplete.filter(
      (t) => t.due_date && isToday(new Date(t.due_date))
    ).slice(0, 5);

    const week = incomplete.filter(
      (t) =>
        t.due_date &&
        isAfter(new Date(t.due_date), new Date()) &&
        !isToday(new Date(t.due_date)) &&
        isBefore(new Date(t.due_date), weekEnd)
    ).slice(0, 5);

    return { overdueTasks: overdue, todayTasks: today, weekTasks: week };
  }, [allTasks]);

  const pipelineBar = useMemo(() => {
    if (!pipelineQuery.data) return [];
    const { stages, pipeline } = pipelineQuery.data;
    return stages.map((stage) => {
      const deals = pipeline[stage.stage_id] ?? pipeline[stage.name] ?? [];
      const value = deals.reduce((sum, d) => sum + (d.value ?? 0), 0);
      return { stage, count: deals.length, value };
    }).filter((s) => s.count > 0);
  }, [pipelineQuery.data]);

  const totalPipelineDeals = pipelineBar.reduce((sum, s) => sum + s.count, 0);

  function handleCompleteTask(task: Task) {
    updateTask.mutate({
      task_id: task.task_id,
      completed_at: Date.now(),
      status: 'completed',
    });
  }

  const isLoading =
    contactsQuery.isLoading ||
    pipelineQuery.isLoading ||
    tasksQuery.isLoading ||
    activitiesQuery.isLoading ||
    eventsQuery.isLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${member?.first_name ?? 'there'}`}
        description="Here's what's happening in your CRM today."
      />

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Deals
            </CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {pipelineQuery.isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{pipelineStats.dealCount}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(pipelineStats.totalValue)} pipeline value
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasks Due Today
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {tasksQuery.isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{tasksDueToday}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Events
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {eventsQuery.isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : nextEvent ? (
              <>
                <div className="text-lg font-bold truncate">{nextEvent.name}</div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(nextEvent.start_date)}
                </p>
              </>
            ) : (
              <div className="text-2xl font-bold text-muted-foreground">—</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contacts
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {contactsQuery.isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{contactCount}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tasks + Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Tasks</CardTitle>
            <Link
              href="/tasks"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasksQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <>
                <TaskGroup
                  title="Overdue"
                  tasks={overdueTasks}
                  variant="destructive"
                  onComplete={handleCompleteTask}
                />
                <TaskGroup
                  title="Due Today"
                  tasks={todayTasks}
                  variant="default"
                  onComplete={handleCompleteTask}
                />
                <TaskGroup
                  title="Upcoming This Week"
                  tasks={weekTasks}
                  variant="secondary"
                  onComplete={handleCompleteTask}
                />
                {overdueTasks.length === 0 && todayTasks.length === 0 && weekTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming tasks. You&apos;re all caught up!
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Link
              href="/activities"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {activitiesQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : allActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity yet.
              </p>
            ) : (
              <div className="space-y-3">
                {allActivities.map((activity) => {
                  const Icon = ACTIVITY_ICON_MAP[activity.type] ?? StickyNote;
                  return (
                    <div
                      key={activity.activity_id}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.title ?? activity.type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Summary */}
      {!isLoading && pipelineBar.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex h-8 w-full overflow-hidden rounded-lg">
              {pipelineBar.map((item) => {
                const widthPercent =
                  totalPipelineDeals > 0
                    ? (item.count / totalPipelineDeals) * 100
                    : 0;
                return (
                  <Link
                    key={item.stage.stage_id}
                    href="/deals"
                    className="relative flex items-center justify-center transition-opacity hover:opacity-80"
                    style={{
                      width: `${Math.max(widthPercent, 5)}%`,
                      backgroundColor: item.stage.color ?? '#94a3b8',
                    }}
                    title={`${item.stage.name}: ${item.count} deals`}
                  >
                    <span className="text-xs font-medium text-white truncate px-1">
                      {item.count}
                    </span>
                  </Link>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3">
              {pipelineBar.map((item) => (
                <div key={item.stage.stage_id} className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.stage.color ?? '#94a3b8' }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.stage.name} ({item.count}) — {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TaskGroup({
  title,
  tasks,
  variant,
  onComplete,
}: {
  title: string;
  tasks: Task[];
  variant: 'destructive' | 'default' | 'secondary';
  onComplete: (task: Task) => void;
}) {
  if (tasks.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant={variant} className="text-xs">
          {title}
        </Badge>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <div className="space-y-1">
        {tasks.map((task) => {
          const priorityConfig =
            PRIORITY_LEVELS[task.priority as keyof typeof PRIORITY_LEVELS];
          return (
            <div
              key={task.task_id}
              className="flex items-center gap-3 rounded-md border px-3 py-2"
            >
              <Checkbox
                checked={false}
                onCheckedChange={() => onComplete(task)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>
                <div className="flex items-center gap-2">
                  {task.due_date && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(task.due_date)}
                    </span>
                  )}
                  {task.entity_type && (
                    <span className="text-xs text-muted-foreground">
                      • {task.entity_type}
                    </span>
                  )}
                </div>
              </div>
              {priorityConfig && (
                <Badge variant="outline" className="text-xs shrink-0">
                  <span
                    className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: priorityConfig.color }}
                  />
                  {priorityConfig.label}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
