export const ACTIVITY_TYPES = {
  note: { label: 'Note', icon: 'StickyNote' },
  email: { label: 'Email', icon: 'Mail' },
  call: { label: 'Call', icon: 'Phone' },
  meeting: { label: 'Meeting', icon: 'Calendar' },
  task: { label: 'Task', icon: 'CheckSquare' },
  deal_created: { label: 'Deal Created', icon: 'Handshake' },
  deal_stage_changed: { label: 'Stage Changed', icon: 'ArrowRight' },
  deal_won: { label: 'Deal Won', icon: 'Trophy' },
  deal_lost: { label: 'Deal Lost', icon: 'XCircle' },
  contact_created: { label: 'Contact Created', icon: 'UserPlus' },
  status_changed: { label: 'Status Changed', icon: 'RefreshCw' },
  ai_insight: { label: 'AI Insight', icon: 'Sparkles' },
} as const;

export const PRIORITY_LEVELS = {
  low: { label: 'Low', color: '#6b7280' },
  medium: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#ef4444' },
  urgent: { label: 'Urgent', color: '#dc2626' },
} as const;

export const CONTACT_SOURCES = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'event', label: 'Event' },
  { value: 'inbound', label: 'Inbound' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' },
] as const;

export const CONTACT_STATUSES = [
  { value: 'active', label: 'Active', color: '#22c55e' },
  { value: 'inactive', label: 'Inactive', color: '#6b7280' },
  { value: 'lead', label: 'Lead', color: '#3b82f6' },
  { value: 'prospect', label: 'Prospect', color: '#8b5cf6' },
  { value: 'customer', label: 'Customer', color: '#10b981' },
  { value: 'churned', label: 'Churned', color: '#ef4444' },
] as const;

export const DEAL_STAGE_COLORS: Record<string, string> = {
  lead: '#94a3b8',
  qualified: '#3b82f6',
  proposal: '#8b5cf6',
  negotiation: '#f59e0b',
  closed_won: '#22c55e',
  closed_lost: '#ef4444',
};

export const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1,000 employees' },
  { value: '1001-5000', label: '1,001-5,000 employees' },
  { value: '5001+', label: '5,001+ employees' },
] as const;
