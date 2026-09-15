-- Uzupełnienie tabeli kancelaria_leads
-- ------------------------------------------------------------------
-- 15 września 2026 formularz dostawał od Supabase błąd PGRST204:
-- wysyłamy kolumny, których tabela nie ma. Worker radzi sobie z tym
-- sam — zdejmuje nieznaną kolumnę i ponawia zapis — ale wtedy dane
-- z tych pól przepadają. Poniższe polecenia dokładają brakujące
-- kolumny; te, które już istnieją, zostają nietknięte.
--
-- Uruchomienie: Supabase → SQL Editor → wklej → Run.

alter table public.kancelaria_leads add column if not exists dzielnica     text;
alter table public.kancelaria_leads add column if not exists status        text default 'nowy';
alter table public.kancelaria_leads add column if not exists utm_source    text;
alter table public.kancelaria_leads add column if not exists utm_medium    text;
alter table public.kancelaria_leads add column if not exists utm_campaign  text;
alter table public.kancelaria_leads add column if not exists utm_content   text;
alter table public.kancelaria_leads add column if not exists utm_term      text;

-- Kolumny, na których opiera się reszta. Jeśli którejś brakuje,
-- zgłoszenie nie zapisze się w ogóle i Worker odda błąd.
alter table public.kancelaria_leads add column if not exists imie          text;
alter table public.kancelaria_leads add column if not exists telefon       text;
alter table public.kancelaria_leads add column if not exists email         text;
alter table public.kancelaria_leads add column if not exists temat         text;
alter table public.kancelaria_leads add column if not exists wiadomosc     text;
alter table public.kancelaria_leads add column if not exists zrodlo_domena text;

-- Sprawdzenie, co tabela ma teraz:
-- select column_name, data_type from information_schema.columns
--   where table_name = 'kancelaria_leads' order by ordinal_position;

-- Po dodaniu kolumn odśwież pamięć schematu PostgREST:
notify pgrst, 'reload schema';
