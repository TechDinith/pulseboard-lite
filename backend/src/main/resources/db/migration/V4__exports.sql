create table exports (
  id uuid primary key,
  tenant_id uuid not null references tenants (id),
  board_id uuid not null references boards (id),
  requested_by uuid not null references users (id),
  status varchar(20) not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index idx_exports_tenant_id on exports (tenant_id);
