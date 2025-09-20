# TODO

## Run the app

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file (or export shell variables) with the Expo extra config:
   ```bash
   SUPABASE_URL="https://your-default-project.supabase.co"
   SUPABASE_API_KEY="public-anon-key"
   GMAIL_CLIENT_ID="YOUR_GOOGLE_OAUTH_CLIENT_ID"
   APP_SCHEME="savelah"
   ```
3. Start the Expo development server:
   ```bash
   npm start
   ```
   Then follow the Expo CLI instructions to open the app on a simulator or Expo Go.
4. Ensure push notifications are enabled on your device/emulator so onboarding can register for alerts.

## Supabase setup

1. Create a table to store per-user configuration shared during onboarding:
   ```sql
   create table public.user_settings (
     user_id uuid primary key references auth.users (id) on delete cascade,
     transaction_email text not null,
     use_default_supabase boolean not null default true,
     custom_supabase_url text,
     custom_supabase_anon_key text,
     notifications_enabled boolean not null default true,
     updated_at timestamptz not null default timezone('utc', now())
   );
   ```
2. Enable Row Level Security and add a policy so users can manage their own row:
   ```sql
   alter table public.user_settings enable row level security;

   create policy "Users manage their settings" on public.user_settings
     for select using (auth.uid() = user_id)
     with check (auth.uid() = user_id);
   ```
3. The existing `transactions` and `categories` tables should continue to run on either the default Supabase instance or a custom instance configured by the user during onboarding.
