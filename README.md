## Flashcard

Flashcard app with:

- Create,Read,Update and Delete functionality
- Play modes
- Usage statistics

## Database creation commands

To create the required database run this sql in your DB cluster:

```bash
create table questionnaire (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table flash (
  id uuid primary key default gen_random_uuid(),
  questionnaire_id uuid not null references questionnaire(id) on delete cascade,
  question text not null,
  answer text not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger flash_set_updated_at
before update on flash
for each row
execute function set_updated_at();

-- 4. RLS (dev-open policies)
alter table questionnaire enable row level security;
alter table flash enable row level security;

create policy "dev_all_access_questionnaire"
on questionnaire
for all
using (true)
with check (true);

create policy "dev_all_access_flash"
on flash
for all
using (true)
with check (true);

```
