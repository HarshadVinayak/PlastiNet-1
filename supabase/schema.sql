-- PlastiNet Supabase Database Schema

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table public.users (
  id uuid references auth.users not null primary key,
  email text not null,
  username text,
  avatar_url text,
  eco_level integer default 1,
  xp integer default 0,
  total_plc integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORGANIZATIONS TABLE
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text not null, -- 'school', 'ngo', 'corporate', 'municipality'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SECTORS TABLE
create table public.sectors (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  parent_org_id uuid references public.organizations(id),
  total_impact_score integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- VERIFICATIONS TABLE
create table public.verifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  before_image_url text not null,
  after_image_url text not null,
  ai_data jsonb not null,
  status text not null, -- 'APPROVED', 'DELAYED_REVIEW', 'REJECTED'
  score integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REWARDS TABLE (Transactions)
create table public.rewards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  amount integer not null,
  reason text not null,
  transaction_type text not null, -- 'EARN', 'SPEND'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AI MEMORY TABLE
create table public.ai_memory (
  user_id uuid references public.users(id) primary key,
  common_uploads jsonb default '[]'::jsonb,
  preferences jsonb default '{}'::jsonb,
  consistency_score integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- POSTS (Community Feed)
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  sector_id uuid references public.sectors(id),
  content text not null,
  media_url text,
  media_type text, -- 'image', 'video', 'none'
  likes_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- EVENTS TABLE
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  reward_multiplier numeric default 1.0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS) SETUP
alter table public.users enable row level security;
alter table public.organizations enable row level security;
alter table public.sectors enable row level security;
alter table public.verifications enable row level security;
alter table public.rewards enable row level security;
alter table public.ai_memory enable row level security;
alter table public.posts enable row level security;
alter table public.events enable row level security;

-- Basic Policies
create policy "Users can read their own profile." on public.users for select using (auth.uid() = id);
create policy "Users can update their own profile." on public.users for update using (auth.uid() = id);

create policy "Anyone can read organizations." on public.organizations for select using (true);
create policy "Anyone can read sectors." on public.sectors for select using (true);

create policy "Users can read their own verifications." on public.verifications for select using (auth.uid() = user_id);
create policy "Users can insert their own verifications." on public.verifications for insert with check (auth.uid() = user_id);

create policy "Users can read their own rewards." on public.rewards for select using (auth.uid() = user_id);
create policy "Users can insert their own rewards." on public.rewards for insert with check (auth.uid() = user_id);

create policy "Users can read their own ai memory." on public.ai_memory for select using (auth.uid() = user_id);
create policy "Users can update their own ai memory." on public.ai_memory for update using (auth.uid() = user_id);
create policy "Users can insert their own ai memory." on public.ai_memory for insert with check (auth.uid() = user_id);

create policy "Anyone can read posts." on public.posts for select using (true);
create policy "Users can create posts." on public.posts for insert with check (auth.uid() = user_id);

create policy "Anyone can read events." on public.events for select using (true);
