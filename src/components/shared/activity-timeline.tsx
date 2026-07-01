'use client';

import { useMemo } from 'react';
import {
  StickyNote,
  Mail,
  Phone,
  Calendar,
  CheckSquare,
  Handshake,
  ArrowRight,
  Trophy,
  XCircle,
  UserPlus,
  RefreshCw,
  Sparkles,
  Activity as ActivityIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useActivities } from '@/lib/hooks/use-activities';
import { formatDate } from '@/lib/utils/format';
import { ACTIVITY_TYPES } from '@/lib/utils/constants';
import type { Activity } from '@/lib/api/types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  StickyNote,
  Mail,
  Phone,
  Calendar,
  CheckSquare,
  Handshake,
  ArrowRight,
  Trophy,
  XCircle,
  UserPlus,
  RefreshCw,
  Sparkles,
};

function getActivityIcon(type: string) {
  const config = ACTIVITY_TYPES[type as keyof typeof ACTIVITY_TYPES];
  if (config) {
    return ICON_MAP[config.icon] ?? ActivityIcon;
  }
  return ActivityIcon;
}

function getActivityLabel(type: string) {
  const config = ACTIVITY_TYPES[type as keyof typeof ACTIVITY_TYPES];
  return config?.label ?? type;
}

interface ActivityTimelineProps {
  entityType: string;
  entityId: string;
}

export function ActivityTimeline({ entityType, entityId }: ActivityTimelineProps) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useActivities({
    entity_type: entityType,
    entity_id: entityId,
  });

  const activities = useMemo(
    () => data?.pages.flatMap((page) => page.activities) ?? [],
    [data],
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <ActivityIcon className="h-8 w-8 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity) => (
        <ActivityItem key={activity.activity_id} activity={activity} />
      ))}
      {hasNextPage && (
        <div className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const Icon = getActivityIcon(activity.type);

  return (
    <div className="flex gap-3 rounded-md px-2 py-2.5 hover:bg-muted/50 transition-colors">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {activity.title ?? getActivityLabel(activity.type)}
          </span>
          {activity.ai_generated && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              <Sparkles className="h-2.5 w-2.5" />
              AI
            </Badge>
          )}
        </div>
        {activity.content && (
          <p className="text-xs text-muted-foreground line-clamp-2">{activity.content}</p>
        )}
        <p className="text-[11px] text-muted-foreground/80">
          {formatDate(activity.created_at)}
        </p>
      </div>
    </div>
  );
}
