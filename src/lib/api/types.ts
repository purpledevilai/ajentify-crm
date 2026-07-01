export interface Member {
  member_id: string;
  email: string;
  first_name: string;
  last_name: string;
  email_verified: boolean;
  avatar_url: string | null;
  created_at: number;
  updated_at: number;
}

export interface Workspace {
  workspace_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  settings: Record<string, unknown> | null;
  created_at: number;
  updated_at: number;
}

export interface Contact {
  contact_id: string;
  workspace_id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  company_name: string | null;
  bio: string | null;
  source: string | null;
  status: string;
  linkedin_url: string | null;
  location: string | null;
  avatar_url: string | null;
  created_at: number;
  updated_at: number;
}

export interface Organization {
  organization_id: string;
  workspace_id: string;
  name: string;
  email: string | null;
  website: string | null;
  industry: string | null;
  phone: string | null;
  description: string | null;
  notes: string | null;
  location: string | null;
  size: string | null;
  logo_url: string | null;
  created_at: number;
  updated_at: number;
}

export interface Deal {
  deal_id: string;
  workspace_id: string;
  name: string;
  stage: string;
  value: number | null;
  currency: string;
  expected_close_date: number | null;
  actual_close_date: number | null;
  loss_reason: string | null;
  notes: string | null;
  owner_member_id: string;
  created_at: number;
  updated_at: number;
}

export interface PipelineStage {
  stage_id: string;
  workspace_id: string;
  name: string;
  order: number;
  is_closed: boolean;
  is_won: boolean;
  color: string | null;
  created_at: number;
  updated_at: number;
}

export interface Activity {
  activity_id: string;
  workspace_id: string;
  type: string;
  title: string | null;
  content: string | null;
  metadata: Record<string, unknown> | null;
  entity_type: string;
  entity_id: string;
  member_id: string | null;
  ai_generated: boolean;
  created_at: number;
  updated_at: number;
}

export interface Task {
  task_id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  due_date: number | null;
  completed_at: number | null;
  priority: string;
  status: string;
  member_id: string;
  entity_type: string | null;
  entity_id: string | null;
  reminder_at: number | null;
  recurrence: string | null;
  ai_suggested: boolean;
  created_at: number;
  updated_at: number;
}

export interface CrmEvent {
  event_id: string;
  workspace_id: string;
  name: string;
  start_date: number;
  end_date: number | null;
  location: string | null;
  website: string | null;
  type: string | null;
  description: string | null;
  notes: string | null;
  calendar_event_id: string | null;
  created_at: number;
  updated_at: number;
}

export interface Tag {
  tag_id: string;
  workspace_id: string;
  name: string;
  color: string | null;
  created_at: number;
  updated_at: number;
}

export interface Relationship {
  relationship_id: string;
  workspace_id: string;
  entity_type_a: string;
  entity_id_a: string;
  entity_type_b: string;
  entity_id_b: string;
  type: string;
  metadata: Record<string, unknown> | null;
  created_at: number;
  updated_at: number;
}

export interface PaginatedResponse<T> {
  items?: T[];
  contacts?: T[];
  organizations?: T[];
  deals?: T[];
  events?: T[];
  tasks?: T[];
  activities?: T[];
  tags?: T[];
  members?: T[];
  stages?: T[];
  nextCursor?: string;
}

export interface AuthResponse {
  access_token: string;
  member: Member;
}

export interface MeResponse {
  member: Member;
  workspaces: Workspace[];
}

export interface PipelineResponse {
  stages: PipelineStage[];
  pipeline: Record<string, Deal[]>;
}

export interface ApiErrorResponse {
  message: string;
  error_code?: string;
}
