export type Priority = "low" | "medium" | "high";

export type Plan = "free" | "pro" | "enterprise";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
}

export interface Member {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  assigneeId?: string;
  labels: string[];
  commentCount: number;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface Board {
  id: string;
  tenantId: string;
  name: string;
  columns: Column[];
}

export type ActivityKind =
  | "created"
  | "moved"
  | "commented"
  | "assigned"
  | "completed";

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  actorId: string;
  cardTitle: string;
  detail?: string;
  at: string;
}
