'use client';

import { PageHeader } from '@/components/layouts/page-header';
import { useAuth } from '@/lib/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Handshake, CalendarDays, CheckSquare } from 'lucide-react';

export default function DashboardPage() {
  const { member } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${member?.first_name ?? 'there'}`}
        description="Here's what's happening in your CRM today."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Contacts', value: '—', icon: Users },
          { title: 'Open Deals', value: '—', icon: Handshake },
          { title: 'Upcoming Events', value: '—', icon: CalendarDays },
          { title: 'Pending Tasks', value: '—', icon: CheckSquare },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
