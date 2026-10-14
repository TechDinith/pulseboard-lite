import type {
  ActivityEvent,
  Board,
  Member,
  Tenant,
} from "@/types";

export const members: Member[] = [
  { id: "u_1", name: "Ava Morgan", initials: "AM", color: "#6366f1" },
  { id: "u_2", name: "Liam Chen", initials: "LC", color: "#0ea5e9" },
  { id: "u_3", name: "Noah Patel", initials: "NP", color: "#10b981" },
  { id: "u_4", name: "Mia Rossi", initials: "MR", color: "#f59e0b" },
  { id: "u_5", name: "Ethan Cole", initials: "EC", color: "#ef4444" },
];

export const tenants: Tenant[] = [
  { id: "t_1", name: "Acme Inc.", slug: "acme", plan: "pro" },
  { id: "t_2", name: "Globex", slug: "globex", plan: "free" },
  { id: "t_3", name: "Initech", slug: "initech", plan: "enterprise" },
];

export const currentTenant = tenants[0];

export const currentUserId = members[0].id;

export const board: Board = {
  id: "b_1",
  tenantId: currentTenant.id,
  name: "Sprint 24",
  columns: [
    {
      id: "col_backlog",
      title: "Backlog",
      cards: [
        {
          id: "c_101",
          title: "Audit third-party auth providers",
          description:
            "Document OAuth scopes for Google and GitHub sign-in before the security review.",
          priority: "low",
          assigneeId: "u_3",
          labels: ["security", "research"],
          commentCount: 2,
        },
        {
          id: "c_102",
          title: "Design empty states for the activity feed",
          priority: "medium",
          assigneeId: "u_4",
          labels: ["design"],
          commentCount: 0,
        },
      ],
    },
    {
      id: "col_todo",
      title: "To do",
      cards: [
        {
          id: "c_201",
          title: "Multi-tenant board permissions",
          description:
            "Owners and admins can archive columns; members can only move cards.",
          priority: "high",
          assigneeId: "u_1",
          labels: ["backend", "auth"],
          commentCount: 5,
        },
        {
          id: "c_202",
          title: "Wire RTK Query for board fetch",
          priority: "high",
          assigneeId: "u_2",
          labels: ["frontend"],
          commentCount: 1,
        },
        {
          id: "c_203",
          title: "Add Redis pub/sub spike",
          priority: "medium",
          assigneeId: "u_5",
          labels: ["realtime"],
          commentCount: 3,
        },
      ],
    },
    {
      id: "col_in_progress",
      title: "In progress",
      cards: [
        {
          id: "c_301",
          title: "SSE endpoint for card moves",
          description:
            "Stream board deltas from the Node service; keep payloads small.",
          priority: "high",
          assigneeId: "u_5",
          labels: ["realtime", "node"],
          commentCount: 8,
        },
        {
          id: "c_302",
          title: "JWT refresh flow",
          priority: "medium",
          assigneeId: "u_3",
          labels: ["auth"],
          commentCount: 2,
        },
      ],
    },
    {
      id: "col_review",
      title: "Review",
      cards: [
        {
          id: "c_401",
          title: "Export worker retry policy",
          description: "Exponential backoff with a dead-letter queue after 5 tries.",
          priority: "medium",
          assigneeId: "u_4",
          labels: ["sqs", "worker"],
          commentCount: 4,
        },
      ],
    },
    {
      id: "col_done",
      title: "Done",
      cards: [
        {
          id: "c_501",
          title: "Scaffold Next.js + Tailwind dashboard",
          priority: "low",
          assigneeId: "u_1",
          labels: ["frontend"],
          commentCount: 1,
        },
        {
          id: "c_502",
          title: "Postgres schema for tenants",
          priority: "medium",
          assigneeId: "u_2",
          labels: ["backend", "postgres"],
          commentCount: 6,
        },
      ],
    },
  ],
};

export const activity: ActivityEvent[] = [
  {
    id: "a_1",
    kind: "moved",
    actorId: "u_5",
    cardTitle: "SSE endpoint for card moves",
    detail: "To do → In progress",
    at: "2026-10-13T09:42:00.000Z",
  },
  {
    id: "a_2",
    kind: "commented",
    actorId: "u_3",
    cardTitle: "Postgres schema for tenants",
    detail: "“Added a partial index on tenant_id.”",
    at: "2026-10-13T09:17:00.000Z",
  },
  {
    id: "a_3",
    kind: "assigned",
    actorId: "u_1",
    cardTitle: "Multi-tenant board permissions",
    detail: "assigned to Ava Morgan",
    at: "2026-10-13T08:55:00.000Z",
  },
  {
    id: "a_4",
    kind: "created",
    actorId: "u_4",
    cardTitle: "Export worker retry policy",
    at: "2026-10-13T08:31:00.000Z",
  },
  {
    id: "a_5",
    kind: "completed",
    actorId: "u_2",
    cardTitle: "Postgres schema for tenants",
    at: "2026-10-12T17:20:00.000Z",
  },
];

export function getMember(id: string | undefined): Member | undefined {
  return members.find((member) => member.id === id);
}
