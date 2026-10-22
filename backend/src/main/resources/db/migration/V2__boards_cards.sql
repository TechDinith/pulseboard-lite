create table boards (
  id uuid primary key,
  tenant_id uuid not null references tenants (id),
  name varchar(120) not null,
  created_at timestamptz not null
);

create index idx_boards_tenant_id on boards (tenant_id);

create table columns (
  id uuid primary key,
  board_id uuid not null references boards (id) on delete cascade,
  name varchar(80) not null,
  position integer not null,
  created_at timestamptz not null
);

create index idx_columns_board_id on columns (board_id);

create table cards (
  id uuid primary key,
  column_id uuid not null references columns (id) on delete cascade,
  tenant_id uuid not null references tenants (id),
  title varchar(200) not null,
  description text,
  priority varchar(10) not null,
  assignee_id uuid references users (id),
  labels text,
  due_at timestamptz,
  position integer not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index idx_cards_column_id on cards (column_id);
create index idx_cards_tenant_id on cards (tenant_id);
create index idx_cards_assignee_id on cards (assignee_id);
