-- Brújula: tabla de respuestas anónimas.
-- Pegar entero en Supabase → SQL Editor → Run. Se puede volver a correr sin romper nada.
--
-- Una fila por test terminado, ~140 bytes con índice incluido:
--   las columnas de códigos son smallint (2 bytes), la fecha es date (4 bytes, sin hora),
--   las respuestas van empaquetadas en medio byte por afirmación (59 bytes para 118),
--   y los puntajes por eje no se guardan porque se recalculan desde las respuestas.
-- Las columnas van de mayor a menor tamaño para no perder bytes en relleno de alineación.

create table if not exists public.respuestas (
  id         bigint generated always as identity primary key,
  fecha      date     not null default current_date,
  test       smallint not null check (test in (1, 2)),              -- 1 internacional, 2 argentina
  variante   smallint not null check (variante between 1 and 3),    -- 1 corta, 2 completa, 3 a fondo
  edad       smallint not null check (edad between 0 and 7),        -- 0 sin dato; ver README
  genero     smallint not null check (genero between 0 and 3),
  educacion  smallint not null check (educacion between 0 and 7),
  segundos   smallint not null check (segundos >= 0),
  respuestas bytea    not null check (octet_length(respuestas) between 1 and 128)
);

comment on table public.respuestas is
  'Una fila por test terminado con consentimiento. respuestas: medio byte por afirmación en el orden de src/data/<test>/questions.json; 0 no preguntada, 1 No sé, 2..6 = −1, −0,5, 0, 0,5, 1.';

-- Solo se puede insertar. Nadie con la clave pública puede leer, modificar ni borrar.
alter table public.respuestas enable row level security;
revoke all on public.respuestas from anon, authenticated;
grant insert (fecha, test, variante, edad, genero, educacion, segundos, respuestas)
  on public.respuestas to anon, authenticated;

drop policy if exists "insertar respuestas" on public.respuestas;
create policy "insertar respuestas" on public.respuestas
  for insert to anon, authenticated
  with check (fecha = current_date);

-- Lee la afirmación i (desde 0) de una fila: −1, −0.5, 0, 0.5, 1, o null si no se
-- preguntó o respondió "No sé". Para consultas rápidas desde el SQL Editor.
create or replace function public.respuesta(r bytea, i int)
returns numeric
language sql immutable strict
set search_path = ''
as $$
  select case
    when i / 2 >= octet_length(r) then null
    else nullif(nullif((get_byte(r, i / 2) >> (4 * (1 - i % 2))) & 15, 0), 1)
  end * 0.5 - 2
$$;
revoke execute on function public.respuesta(bytea, int) from public, anon, authenticated;

-- Tamaño ocupado por la tabla con sus índices:
--   select pg_size_pretty(pg_total_relation_size('public.respuestas'));
