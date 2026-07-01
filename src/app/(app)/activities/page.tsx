'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useActivities } from '@/lib/hooks/use-activities';
import { formatDate } from '@/lib/utils/format';
import { ACTIVITY_TYPES } from '@/lib/utils/constants';
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
  Activity,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Activity as ActivityType } from '@/lib/api/types';

const ICON_MAP: Record<string, React.ReactNode> = {
  StickyNote: <StickyNote className="h-4 w-4" />,
  Mail: <Mail className="h-4 w-4" />,
  Phone: <Phone className="h-4 w-4" />,
  Calendar: <Calendar className="h-4 w-4" />,
  CheckSquare: <CheckSquare className="h-4 w-4" />,
  Handshake: <Handshake className="h-4 w-4" />,
  ArrowRight: <ArrowRight className="h-4 w-4" />,
  Trophy: <Trophy className="h-4 w-4" />,
  XCircle: <XCircle className="h-4 w-4" />,
  UserPlus: <UserPlus className="h-4 w-4" />,
  RefreshCw: <RefreshCw className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />,
};

function getActivityIcon(type: string): React.ReactNode {
  const activityType = ACTIVITY_TYPES[type as keyof typeof ACTIVITY_TYPES];
  if (activityType) {
    return ICON_MAP[activityType.icon] ?? <Activity className="h-4 w-4" />;
  }
  return <Activity className="h-4 w-4" />;
}

function getActivityLabel(type: string): string {
  const activityType = ACTIVITY_TYPES[type as keyof typeof ACTIVITY_TYPES];
  return activityType?.label ?? type;
}

function ActivityEntry({ activity }: { activity: ActivityType }) {
  const [expanded, setExpanded] = useState(false);
  const hasLongContent = activity.content && activity.content.length > 120;

  return (
    <div className="group flex gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {getActivityIcon(activity.type)}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{activity.title ?? getActivityLabel(activity.type)}</span>
          <Badge variant="secondary" className="text-[10px]">
            {getActivityLabel(activity.type)}
          </Badge>
          {activity.ai_generated && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
              <Sparkles className="h-2.5 w-2.5 mr-0.5" />
              AI
            </Badge>
          )}
        </div>

        {activity.content && (
          <div>
            <p className={`text-sm text-muted-foreground whitespace-pre-wrap ${!expanded && hasLongContent ? 'line-clamp-2' : ''}`}>
              {activity.content}
            </p>
            {hasLongContent && (
              <button
                type="button"
                className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>Show less <ChevronUp className="h-3 w-3" /></>
                ) : (
                  <>Show more <ChevronDown className="h-3 w-3" /></>
                )}
              </button>
            )}
          </div>
        )}

        {activity.entity_type && (
          <span className="text-xs text-muted-foreground capitalize">
            {activity.entity_type}
          </span>
        )}
      </div>

      <div className="shrink-0 text-xs text-muted-foreground whitespace-nowrap pt-0.5">
        {formatDate(activity.created_at)}
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex gap-4 px-4 py-3">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-4 w-16 shrink-0" />
    </div>
  );
}

const ACTIVITY_TYPE_OPTIONS = Object.entries(ACTIVITY_TYPES).map(([value, { label }]) => ({
  value,
  label,
}));

export default function ActivitiesPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = useMemo(() => {
    const f: Record<string, string> = {};
    if (typeFilter !== 'all') f.type = typeFilter;
    return Object.keys(f).length > 0 ? f : undefined;
  }, [typeFilter]);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useActivities(filters);

  const activities = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.activities ?? []) ?? [];
    if (!searchQuery.trim()) return all;
    const q = searchQuery.toLowerCase();
    return all.filter(
      (a) =>
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.content && a.content.toLowerCase().includes(q))
    );
  }, [data, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activities"
        description="A timeline of everything happening across your workspace."
      />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? 'all')}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {ACTIVITY_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="rounded-lg border bg-card divide-y">
          {Array.from({ length: 8 }).map((_, i) => (
            <ActivitySkeleton key={i} />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Activity className="h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No activity yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Activities will appear here as you log calls, notes, emails, and meetings.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border bg-card divide-y">
            {activities.map((activity) => (
              <ActivityEntry key={activity.activity_id} activity={activity} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
