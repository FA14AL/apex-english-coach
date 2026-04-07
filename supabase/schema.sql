-- APEX English Coach — Supabase Schema
-- Paste everything below this comment into the Supabase SQL Editor (Dashboard → SQL Editor → New Query) and click Run.

create table profiles (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  sessions_completed integer default 0,
  avg_wpm integer default 0,
  top_fillers jsonb default '[]',
  weak_areas jsonb default '[]',
  improving jsonb default '[]',
  readiness_score integer default 0,
  last_session timestamptz,
  module_scores jsonb default '{}'
);

create table sessions (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  module text,
  scenario_title text,
  scores jsonb,
  summary text,
  duration_seconds integer,
  filler_count integer,
  wpm integer
);

create table daily_reports (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  report_markdown text,
  readiness_score integer
);
