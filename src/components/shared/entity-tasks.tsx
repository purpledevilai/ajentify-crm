'use client';

import { useMemo, useState } from 'react';
import { Plus, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskFormSheet } from '@/components/tasks/task-form-sheet';
import { useTasks, useUpdateTask } from '@/lib/hooks/use-tasks';
import { formatDate } from '@/lib/utils/format';
import { PRIORITY_LEVELS } from '@/lib/utils/constants';
import type { Task } from '@/lib/api/types';

interface EntityTasksProps {
  entityType: string;
  entityId: string;
}

export function EntityTasks({ entityType, entityId }: EntityTasksProps) {
  const [taskSheetOpen, setTaskSheetOpen] = useState(false);

  const { data, isLoading } = useTasks({
    entity_type: entityType,
    entity_id: entityId,
  });
  const updateTask = useUpdateTask();

  const tasks = useMemo(
    () => data?.pages.flatMap((page) => page.tasks) ?? [],
    [data],
  );

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? Date.now() : null;
    try {
      await updateTask.mutateAsync({
        task_id: task.task_id,
        status: newStatus,
        completed_at: completedAt,
      });
    } catch {
      toast.error('Failed to update task');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">Tasks</h4>
        <Button variant="ghost" size="xs" onClick={() => setTaskSheetOpen(true)}>
          <Plus className="h-3 w-3" />
          Add
        </Button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">No tasks yet</p>
      ) : (
        <div className="space-y-1">
          {tasks.map((task) => (
            <TaskItem key={task.task_id} task={task} onToggle={handleToggleComplete} />
          ))}
        </div>
      )}

      <TaskFormSheet
        open={taskSheetOpen}
        onOpenChange={setTaskSheetOpen}
        entityType={entityType}
        entityId={entityId}
      />
    </div>
  );
}

function TaskItem({ task, onToggle }: { task: Task; onToggle: (task: Task) => void }) {
  const isCompleted = task.status === 'completed';
  const priorityConfig = PRIORITY_LEVELS[task.priority as keyof typeof PRIORITY_LEVELS];
  const isOverdue = task.due_date && !isCompleted && task.due_date < Date.now();

  return (
    <div className="flex items-start gap-2.5 rounded-md px-2 py-2 hover:bg-muted/50 transition-colors">
      <Checkbox
        checked={isCompleted}
        onCheckedChange={() => onToggle(task)}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className={`text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {priorityConfig && (
            <Badge
              variant="outline"
              className="text-[10px] h-4 px-1.5 border-transparent"
              style={{
                backgroundColor: `${priorityConfig.color}15`,
                color: priorityConfig.color,
              }}
            >
              {priorityConfig.label}
            </Badge>
          )}
          {task.due_date && (
            <span
              className={`text-[11px] flex items-center gap-0.5 ${
                isOverdue ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              {isOverdue && <AlertCircle className="h-3 w-3" />}
              {formatDate(task.due_date)}
            </span>
          )}
        </div>
      </div>
      {isCompleted ? (
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-0.5" />
      )}
    </div>
  );
}
