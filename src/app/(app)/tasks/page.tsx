'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskFormSheet } from '@/components/tasks/task-form-sheet';
import { useTasks, useUpdateTask } from '@/lib/hooks/use-tasks';
import { useAuth } from '@/lib/providers/auth-provider';
import { formatDate } from '@/lib/utils/format';
import { PRIORITY_LEVELS } from '@/lib/utils/constants';
import {
  Plus,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Clock,
  CalendarDays,
  CalendarClock,
  CircleCheck,
} from 'lucide-react';
import {
  isToday,
  isThisWeek,
  isBefore,
  startOfDay,
  endOfDay,
  endOfWeek,
} from 'date-fns';
import type { Task } from '@/lib/api/types';

type PriorityFilter = 'all' | 'high' | 'medium' | 'low' | 'urgent';

interface TaskGroup {
  key: string;
  label: string;
  icon: React.ReactNode;
  headerClass: string;
  tasks: Task[];
  defaultCollapsed: boolean;
}

function groupTasks(tasks: Task[]): TaskGroup[] {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const overdue: Task[] = [];
  const dueToday: Task[] = [];
  const dueThisWeek: Task[] = [];
  const dueLater: Task[] = [];
  const completed: Task[] = [];

  for (const task of tasks) {
    if (task.status === 'completed') {
      completed.push(task);
      continue;
    }
    if (!task.due_date) {
      dueLater.push(task);
      continue;
    }
    const dueDate = new Date(task.due_date);
    if (isBefore(dueDate, todayStart)) {
      overdue.push(task);
    } else if (isToday(dueDate) || (dueDate >= todayStart && dueDate <= todayEnd)) {
      dueToday.push(task);
    } else if (isThisWeek(dueDate, { weekStartsOn: 1 }) || dueDate <= weekEnd) {
      dueThisWeek.push(task);
    } else {
      dueLater.push(task);
    }
  }

  return [
    {
      key: 'overdue',
      label: 'Overdue',
      icon: <AlertCircle className="h-4 w-4" />,
      headerClass: 'text-red-600 dark:text-red-400',
      tasks: overdue.sort((a, b) => (a.due_date ?? 0) - (b.due_date ?? 0)),
      defaultCollapsed: false,
    },
    {
      key: 'today',
      label: 'Due Today',
      icon: <Clock className="h-4 w-4" />,
      headerClass: 'text-amber-600 dark:text-amber-400',
      tasks: dueToday.sort((a, b) => (a.due_date ?? 0) - (b.due_date ?? 0)),
      defaultCollapsed: false,
    },
    {
      key: 'week',
      label: 'Due This Week',
      icon: <CalendarDays className="h-4 w-4" />,
      headerClass: 'text-foreground',
      tasks: dueThisWeek.sort((a, b) => (a.due_date ?? 0) - (b.due_date ?? 0)),
      defaultCollapsed: false,
    },
    {
      key: 'later',
      label: 'Due Later',
      icon: <CalendarClock className="h-4 w-4" />,
      headerClass: 'text-muted-foreground',
      tasks: dueLater.sort((a, b) => (a.due_date ?? 0) - (b.due_date ?? 0)),
      defaultCollapsed: true,
    },
    {
      key: 'completed',
      label: 'Completed',
      icon: <CircleCheck className="h-4 w-4" />,
      headerClass: 'text-muted-foreground',
      tasks: completed.sort((a, b) => (b.completed_at ?? 0) - (a.completed_at ?? 0)).slice(0, 10),
      defaultCollapsed: true,
    },
  ];
}

const PRIORITY_BADGE_VARIANTS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  medium: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

function TaskRow({ task, onToggle }: { task: Task; onToggle: (task: Task) => void }) {
  const isCompleted = task.status === 'completed';
  const isOverdue = !isCompleted && task.due_date && isBefore(new Date(task.due_date), startOfDay(new Date()));

  return (
    <div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors">
      <Checkbox
        checked={isCompleted}
        onCheckedChange={() => onToggle(task)}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium truncate ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </span>
          {task.ai_suggested && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 shrink-0">
              AI
            </Badge>
          )}
        </div>
        {task.entity_type && task.entity_id && (
          <span className="text-xs text-muted-foreground capitalize">
            {task.entity_type}: {task.entity_id.slice(0, 8)}…
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {task.priority && PRIORITY_LEVELS[task.priority as keyof typeof PRIORITY_LEVELS] && (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_BADGE_VARIANTS[task.priority] ?? ''}`}>
            {PRIORITY_LEVELS[task.priority as keyof typeof PRIORITY_LEVELS].label}
          </span>
        )}
        {task.due_date && (
          <span className={`text-xs whitespace-nowrap ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground'}`}>
            {formatDate(task.due_date)}
          </span>
        )}
      </div>
    </div>
  );
}

function TaskGroupSection({ group, onToggle }: { group: TaskGroup; onToggle: (task: Task) => void }) {
  const [collapsed, setCollapsed] = useState(group.defaultCollapsed);

  if (group.tasks.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        className={`flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold ${group.headerClass}`}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {group.icon}
        {group.label}
        <span className="ml-1 text-xs font-normal text-muted-foreground">({group.tasks.length})</span>
      </button>
      {!collapsed && (
        <div className="divide-y divide-border/50">
          {group.tasks.map((task) => (
            <TaskRow key={task.task_id} task={task} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, g) => (
        <div key={g} className="space-y-2">
          <Skeleton className="h-6 w-32 ml-3" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function TasksPage() {
  const { member } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [showCompleted, setShowCompleted] = useState(true);

  const { data, isLoading } = useTasks();
  const updateTask = useUpdateTask();

  const allTasks = useMemo(() => {
    return data?.pages.flatMap((p) => p.tasks ?? []) ?? [];
  }, [data]);

  const filteredTasks = useMemo(() => {
    let tasks = allTasks;
    if (priorityFilter !== 'all') {
      tasks = tasks.filter((t) => t.priority === priorityFilter);
    }
    return tasks;
  }, [allTasks, priorityFilter]);

  const groups = useMemo(() => {
    const g = groupTasks(filteredTasks);
    if (!showCompleted) return g.filter((gr) => gr.key !== 'completed');
    return g;
  }, [filteredTasks, showCompleted]);

  async function handleToggle(task: Task) {
    const isCompleting = task.status !== 'completed';
    try {
      await updateTask.mutateAsync({
        task_id: task.task_id,
        status: isCompleting ? 'completed' : 'pending',
        completed_at: isCompleting ? Date.now() : null,
      });
      toast.success(isCompleting ? 'Task completed' : 'Task reopened');
    } catch {
      toast.error('Failed to update task');
    }
  }

  const hasAnyTasks = groups.some((g) => g.tasks.length > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Manage your to-dos and follow-ups."
        actions={
          <Button onClick={() => setSheetOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        }
      />

      <div className="flex items-center gap-3 flex-wrap">
        <Select
          value={priorityFilter}
          onValueChange={(val) => setPriorityFilter(val as PriorityFilter)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={showCompleted ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setShowCompleted(!showCompleted)}
        >
          {showCompleted ? 'Hide Completed' : 'Show Completed'}
        </Button>
      </div>

      {isLoading ? (
        <TaskListSkeleton />
      ) : !hasAnyTasks ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <CheckSquare className="h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No tasks yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a task to keep track of what needs to be done.
          </p>
          <Button className="mt-4" onClick={() => setSheetOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </div>
      ) : (
        <div className="space-y-2 rounded-lg border bg-card">
          {groups.map((group) => (
            <TaskGroupSection key={group.key} group={group} onToggle={handleToggle} />
          ))}
        </div>
      )}

      <TaskFormSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
