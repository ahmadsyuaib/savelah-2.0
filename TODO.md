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
   EXPO_PUBLIC_GOOGLE_CLIENT_ID="YOUR_GOOGLE_OAUTH_CLIENT_ID"
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

## Gmail email interception setup

1. In Google Cloud Console, enable the Gmail API for your project and create an OAuth Client ID (type **Web** or **Android/iOS** depending on how you run Expo). Add `https://auth.expo.io/*` to the authorised redirect URIs when targeting Expo Go.
2. Add the client identifier to your environment by defining `EXPO_PUBLIC_GOOGLE_CLIENT_ID` (Expo automatically exposes `EXPO_PUBLIC_` prefixed values). For example:
   ```bash
   EXPO_PUBLIC_GOOGLE_CLIENT_ID="your-oauth-client-id.apps.googleusercontent.com"
   ```
3. Restart the Expo server so the new environment variable is picked up (`npm start`).
4. Launch the app, go through onboarding, and set the transaction email address to the same Gmail inbox you will authorise. You can change it later from Profile → Supabase Settings if needed.
5. Open the **Expenses** tab and tap **Connect Gmail**. Sign in with the Gmail account whose inbox should be parsed and grant the requested scopes. A success message will appear once the tokens are stored.
6. To test the interception quickly, send an email from `timeformetostudy@gmail.com` to the authorised Gmail inbox using the template in `parsers/fixtures/timeformetostudy-sample.txt`. Ensure the email body keeps the `Amount`, `Direction`, and other labels on their own lines.
7. Back in the app, tap **Sync Gmail** on the Expenses screen. The new test parser (`parsers/TimeForMeToStudyParser.js`) will translate the message into a transaction so that you can confirm the flow end-to-end.
