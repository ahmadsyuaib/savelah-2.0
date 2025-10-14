-- Additional functions and helpers for the Supabase database.
-- Run this file after the base schema in SCHEMA.sql has been applied.

-- Keeps user_settings.updated_at current whenever the row is changed.
create or replace function public.touch_user_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists user_settings_updated_at_trigger on public.user_settings;
create trigger user_settings_updated_at_trigger
before update on public.user_settings
for each row
execute function public.touch_user_settings_updated_at();

-- Returns income, expenses, and balance totals for a user within a range.
create or replace function public.get_monthly_summary(
    p_user_id uuid,
    p_start timestamptz,
    p_end timestamptz
)
returns table(
    income numeric,
    expenses numeric,
    balance numeric
)
language sql
stable
as $$
    with totals as (
        select
            coalesce(sum(case when direction = 'incoming' then amount end), 0) as income,
            coalesce(sum(case when direction = 'outgoing' then amount end), 0) as expenses
        from public.transactions
        where user_id = p_user_id
          and transacted_at >= p_start
          and transacted_at < p_end
    )
    select income, expenses, income - expenses as balance
    from totals;
$$;

-- Provides per-category spend within a range to complement the summary view.
create or replace function public.get_category_usage(
    p_user_id uuid,
    p_start timestamptz,
    p_end timestamptz
)
returns table(
    category_id bigint,
    category_name text,
    monthly_budget numeric,
    spent numeric
)
language sql
stable
as $$
    select
        c.id as category_id,
        c.name as category_name,
        c.monthly_budget,
        coalesce(sum(case when t.direction = 'outgoing' then t.amount end), 0) as spent
    from public.categories c
    left join public.transactions t
        on t.category_id = c.id
       and t.user_id = p_user_id
       and t.transacted_at >= p_start
       and t.transacted_at < p_end
    where c.user_id = p_user_id
    group by c.id, c.name, c.monthly_budget
    order by c.created_at;
$$;
