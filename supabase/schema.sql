-- La Mayoría: partidas anónimas.
-- Pegar entero en Supabase → SQL Editor → Run. Se puede volver a correr sin romper nada.
--
-- Una fila por ronda terminada, ~100 bytes con índice incluido:
--   códigos en smallint (2 bytes), fecha date (4 bytes, sin hora) y las jugadas empaquetadas
--   en 2 bytes por carta (una ronda de 25 cartas = 50 bytes). Ver src/engine/codificacion.ts.

create table if not exists public.partidas (
  id         bigint generated always as identity primary key,
  fecha      date     not null default current_date,
  edad       smallint not null check (edad between 0 and 7),        -- 0 sin dato; ver README
  genero     smallint not null check (genero between 0 and 3),
  educacion  smallint not null check (educacion between 0 and 7),
  segundos   smallint not null check (segundos >= 0),
  jugadas    bytea    not null check (octet_length(jugadas) between 2 and 120 and octet_length(jugadas) % 2 = 0)
);

-- Posición en la brújula con todas las rondas del dispositivo, de -100 a 100 (null si no alcanza).
alter table public.partidas
  add column if not exists economia  smallint check (economia  between -100 and 100),
  add column if not exists valores   smallint check (valores   between -100 and 100),
  add column if not exists autoridad smallint check (autoridad between -100 and 100);

comment on table public.partidas is
  'Una fila por ronda. jugadas: 2 bytes por carta — byte 0: bits 6-7 elección (1 A, 2 B, 3 no dice), bits 0-5 parte alta del índice; byte 1: parte baja del índice en src/data/cartas.json.';

-- Restos de una versión anterior del esquema (conteos por carta y predicciones), si existen.
drop trigger if exists sumar_partida on public.partidas;
drop function if exists public.sumar_partida();
drop function if exists public.estado();
drop table if exists public.conteos, public.puntajes;

-- Solo se pueden insertar partidas. Nadie con la clave pública lee, modifica ni borra filas.
alter table public.partidas enable row level security;
revoke all on public.partidas from anon, authenticated;
grant insert (fecha, edad, genero, educacion, segundos, jugadas, economia, valores, autoridad)
  on public.partidas to anon, authenticated;

drop policy if exists "insertar partidas" on public.partidas;
create policy "insertar partidas" on public.partidas
  for insert to anon, authenticated
  with check (fecha = current_date);

-- Lo único que la app lee: el promedio de la brújula de quienes jugaron, sin filas sueltas.
create or replace function public.promedio()
returns table (economia real, valores real, autoridad real, partidas bigint)
language sql stable security definer set search_path = ''
as $$
  select avg(p.economia)::real / 100, avg(p.valores)::real / 100, avg(p.autoridad)::real / 100, count(*)
  from public.partidas p
  where p.economia is not null and p.valores is not null;
$$;
revoke all on function public.promedio() from public;
grant execute on function public.promedio() to anon, authenticated;

-- Cuántos eligieron cada opción de cada carta (índice en cartas.json), para el SQL Editor:
--   select (get_byte(jugadas, k) & 63) * 256 + get_byte(jugadas, k + 1) as carta,
--          get_byte(jugadas, k) >> 6 as eleccion, count(*)
--   from public.partidas, generate_series(0, octet_length(jugadas) - 2, 2) as k
--   group by 1, 2 order by 1, 2;
--
-- Tamaño ocupado:
--   select pg_size_pretty(pg_total_relation_size('public.partidas'));
