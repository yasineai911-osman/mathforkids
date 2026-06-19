-- Ten a Day — run once in Database > SQL Editor

create table if not exists parents (
  id         uuid primary key default gen_random_uuid(),
  phone      text unique not null,
  pin        text not null,
  created_at timestamptz default now()
);

create table if not exists kids (
  id                uuid primary key default gen_random_uuid(),
  parent_id         uuid references parents(id) on delete cascade not null,
  name              text not null,
  grade             int  not null default 1,
  streak_count      int  not null default 0,
  last_session_date date,
  created_at        timestamptz default now()
);

create table if not exists attempts (
  id             uuid primary key default gen_random_uuid(),
  kid_id         uuid references kids(id) on delete cascade not null,
  problem        text not null,
  correct_answer int  not null,
  kid_answer     int,
  is_correct     boolean not null,
  created_at     timestamptz default now()
);

create index if not exists attempts_kid_id_idx on attempts(kid_id);
create index if not exists kids_parent_id_idx  on kids(parent_id);

alter table parents  enable row level security;
alter table kids     enable row level security;
alter table attempts enable row level security;

create policy "pilot_allow_all_parents"  on parents  for all using (true) with check (true);
create policy "pilot_allow_all_kids"     on kids     for all using (true) with check (true);
create policy "pilot_allow_all_attempts" on attempts for all using (true) with check (true);
