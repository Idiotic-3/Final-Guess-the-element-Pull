-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create game_history table
create table game_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  score integer not null,
  total_questions integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_achievements table
create table user_achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  achievement_id text not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, achievement_id)
);

-- Create user_streaks table
create table user_streaks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  current_streak integer default 0 not null,
  longest_streak integer default 0 not null,
  last_game_date timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table game_history enable row level security;
alter table user_achievements enable row level security;
alter table user_streaks enable row level security;

-- Create policies
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can view their own game history"
  on game_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own game history"
  on game_history for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own achievements"
  on user_achievements for select
  using (auth.uid() = user_id);

create policy "Users can insert their own achievements"
  on user_achievements for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own streaks"
  on user_streaks for select
  using (auth.uid() = user_id);

create policy "Users can update their own streaks"
  on user_streaks for update
  using (auth.uid() = user_id);

create policy "Users can insert their own streaks"
  on user_streaks for insert
  with check (auth.uid() = user_id);

-- Create function to handle profile updates
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updating updated_at
create trigger handle_profiles_updated_at
  before update on profiles
  for each row
  execute procedure handle_updated_at();

-- Create function to automatically create a profile for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  
  -- Initialize user streaks
  insert into public.user_streaks (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
