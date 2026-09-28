-- La Mayoría: partidas anónimas y conteos por carta.
-- Pegar entero en Supabase → SQL Editor → Run. Se puede volver a correr sin romper nada.
--
-- Una fila por ronda terminada, ~90 bytes con índice incluido:
--   códigos en smallint (2 bytes), fecha date (4 bytes, sin hora) y las jugadas empaquetadas
--   en 3 bytes por carta (una ronda de 15 cartas = 45 bytes). Ver src/engine/codificacion.ts.
-- Los conteos por carta se actualizan con un trigger: leerlos no exige recorrer las partidas.

create table if not exists public.partidas (
  id         bigint generated always as identity primary key,
  fecha      date     not null default current_date,
  edad       smallint not null check (edad between 0 and 7),        -- 0 sin dato; ver README
  genero     smallint not null check (genero between 0 and 3),
  educacion  smallint not null check (educacion between 0 and 7),
  segundos   smallint not null check (segundos >= 0),
  promedio   smallint not null check (promedio between 0 and 100),  -- puntos por carta
  jugadas    bytea    not null check (octet_length(jugadas) between 3 and 90 and octet_length(jugadas) % 3 = 0)
);

comment on table public.partidas is
  'Una fila por ronda. jugadas: 3 bytes por carta — byte 0: bits 6-7 elección (1 A, 2 B, 3 no dice), bits 0-5 parte alta del índice; byte 1: parte baja del índice en src/data/cartas.json; byte 2: predicción 0-100 (% que cree que eligió A).';

-- Conteos agregados por carta (índice en cartas.json).
create table if not exists public.conteos (
  carta  smallint primary key,
  a      integer not null default 0,   -- eligieron A
  b      integer not null default 0,   -- eligieron B
  nada   integer not null default 0,   -- prefirieron no decir
  pa     integer not null default 0,   -- suma de predicciones (% A) de quienes eligieron A
  na     integer not null default 0,
  pb     integer not null default 0,   -- ídem, de quienes eligieron B
  nb     integer not null default 0
);

-- Partidas por tramo de 2 puntos de promedio (0..49), para el percentil.
create table if not exists public.puntajes (
  tramo smallint primary key check (tramo between 0 and 49),
  n     integer not null default 0
);

-- Solo se pueden insertar partidas. Nadie con la clave pública lee, modifica ni borra filas.
alter table public.partidas enable row level security;
alter table public.conteos enable row level security;
alter table public.puntajes enable row level security;
revoke all on public.partidas, public.conteos, public.puntajes from anon, authenticated;
grant insert (fecha, edad, genero, educacion, segundos, promedio, jugadas)
  on public.partidas to anon, authenticated;

drop policy if exists "insertar partidas" on public.partidas;
create policy "insertar partidas" on public.partidas
  for insert to anon, authenticated
  with check (fecha = current_date);

-- Suma cada partida a los conteos. Corre con los permisos del dueño de las tablas.
create or replace function public.sumar_partida()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  k int;
  b0 int;
  idx int;
  e int;
  p int;
begin
  for k in 0 .. octet_length(new.jugadas) / 3 - 1 loop
    b0 := get_byte(new.jugadas, 3 * k);
    e := b0 >> 6;
    idx := ((b0 & 63) << 8) | get_byte(new.jugadas, 3 * k + 1);
    p := least(get_byte(new.jugadas, 3 * k + 2), 100);
    continue when e = 0;
    insert into public.conteos as c (carta, a, b, nada, pa, na, pb, nb)
    values (idx, (e = 1)::int, (e = 2)::int, (e = 3)::int,
            case when e = 1 then p else 0 end, (e = 1)::int,
            case when e = 2 then p else 0 end, (e = 2)::int)
    on conflict (carta) do update set
      a = c.a + excluded.a, b = c.b + excluded.b, nada = c.nada + excluded.nada,
      pa = c.pa + excluded.pa, na = c.na + excluded.na,
      pb = c.pb + excluded.pb, nb = c.nb + excluded.nb;
  end loop;
  insert into public.puntajes as t (tramo, n) values (least(new.promedio / 2, 49), 1)
  on conflict (tramo) do update set n = t.n + 1;
  return null;
end;
$$;
revoke execute on function public.sumar_partida() from public, anon, authenticated;

drop trigger if exists sumar_partida on public.partidas;
create trigger sumar_partida after insert on public.partidas
  for each row execute function public.sumar_partida();

-- Lo que lee la app: solo agregados, nunca partidas individuales.
create or replace function public.estado()
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select json_build_object(
    'cartas', (select coalesce(json_agg(json_build_object(
                 'c', carta, 'a', a, 'b', b, 'nada', nada, 'pa', pa, 'na', na, 'pb', pb, 'nb', nb)), '[]')
               from public.conteos),
    'puntajes', (select coalesce(json_agg(json_build_object('t', tramo, 'n', n)), '[]')
                 from public.puntajes)
  )
$$;
revoke execute on function public.estado() from public;
grant execute on function public.estado() to anon, authenticated;

-- Tamaño ocupado:
--   select pg_size_pretty(pg_total_relation_size('public.partidas'));
