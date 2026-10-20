create table tenants (
  id uuid primary key,
  slug varchar(80) not null unique,
  name varchar(120) not null,
  plan varchar(20) not null,
  created_at timestamptz not null
);

create table users (
  id uuid primary key,
  tenant_id uuid not null references tenants (id),
  email varchar(255) not null unique,
  password_hash varchar(100) not null,
  display_name varchar(120) not null,
  role varchar(20) not null,
  created_at timestamptz not null
);

create index idx_users_tenant_id on users (tenant_id);
