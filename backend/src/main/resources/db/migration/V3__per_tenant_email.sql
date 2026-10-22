alter table users drop constraint if exists users_email_key;
create unique index if not exists idx_users_tenant_email on users (tenant_id, email);
