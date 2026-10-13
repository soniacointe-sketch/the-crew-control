create table public.eloah_training_courses (
 id text primary key, title text not null, universe text not null, description text not null,
 price_cents integer not null check(price_cents>=0), currency text not null default 'eur' check(currency='eur'),
 visible boolean not null default false, sales_open boolean not null default false,
 stripe_price_id text, session_details text not null default 'Date et format à confirmer'
);
create table public.eloah_training_registrations (
 user_id uuid not null references auth.users(id) on delete cascade,
 course_id text not null references public.eloah_training_courses(id),
 state text not null default 'requested' check(state in ('requested','paid','granted','refunded','cancelled')),
 created_at timestamptz not null default now(), primary key(user_id,course_id)
);
create table public.eloah_training_lessons (
 course_id text not null references public.eloah_training_courses(id),
 position integer not null, title text not null, body text not null,
 primary key(course_id,position)
);
create table public.eloah_training_orders (
 session_id text primary key, user_id uuid not null references auth.users(id),
 course_id text not null references public.eloah_training_courses(id),
 amount_cents integer not null, currency text not null, payment_intent text,
 state text not null check(state in ('pending','paid','refunded')), created_at timestamptz not null default now()
);
alter table public.eloah_training_courses enable row level security;
alter table public.eloah_training_registrations enable row level security;
alter table public.eloah_training_lessons enable row level security;
alter table public.eloah_training_orders enable row level security;
revoke all on public.eloah_training_courses,public.eloah_training_registrations,public.eloah_training_lessons,public.eloah_training_orders from anon,authenticated;
grant select on public.eloah_training_courses to anon,authenticated;
grant select,insert on public.eloah_training_registrations to authenticated;
grant select on public.eloah_training_lessons,public.eloah_training_orders to authenticated;
grant all on public.eloah_training_courses,public.eloah_training_registrations,public.eloah_training_lessons,public.eloah_training_orders to service_role;
create policy training_catalog on public.eloah_training_courses for select to anon,authenticated using(visible);
create policy training_registration_read on public.eloah_training_registrations for select to authenticated using(user_id=(select auth.uid()));
create policy training_registration_request on public.eloah_training_registrations for insert to authenticated with check(user_id=(select auth.uid()) and state='requested' and exists(select 1 from public.eloah_training_courses c where c.id=course_id and c.visible));
create policy training_lesson_access on public.eloah_training_lessons for select to authenticated using(exists(select 1 from public.eloah_training_registrations r where r.user_id=(select auth.uid()) and r.course_id=eloah_training_lessons.course_id and r.state in ('paid','granted')));
create policy training_order_read on public.eloah_training_orders for select to authenticated using(user_id=(select auth.uid()));
insert into public.eloah_training_courses(id,title,universe,description,price_cents,visible,sales_open) values('pg-me-choisir','Me choisir sans culpabiliser','Power & Glam','Atelier guidé de 75 minutes : comprendre une situation, formuler une limite et choisir une action concrète. Partages facultatifs.',2900,true,false);
