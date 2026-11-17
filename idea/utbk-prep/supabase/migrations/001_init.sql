create type mapel as enum (
  'pu', 'ppu', 'pbm', 'pk',
  'mat_ipa', 'fis', 'kim', 'bio',
  'mat_ips', 'eko', 'sos', 'geo'
);

create type tipe_sesi as enum ('latihan', 'simulasi');

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nama        text not null,
  target_ptn  text,
  tahun_utbk  smallint,
  created_at  timestamptz default now()
);

create table soal (
  id              bigserial primary key,
  mapel           mapel not null,
  subtopik        text not null,
  tahun           smallint,
  tingkat         smallint check (tingkat between 1 and 5),
  pertanyaan      text not null,
  opsi            jsonb not null,
  jawaban_benar   char(1) not null,
  pembahasan      text,
  created_at      timestamptz default now()
);

create index soal_mapel_subtopik_idx on soal(mapel, subtopik);
create index soal_tingkat_idx on soal(tingkat);

create table sesi_ujian (
  id            bigserial primary key,
  user_id       uuid references profiles(id) on delete cascade,
  tipe          tipe_sesi not null,
  mapel_filter  mapel[],
  mulai_at      timestamptz default now(),
  selesai_at    timestamptz,
  durasi_detik  int
);

create index sesi_ujian_user_idx on sesi_ujian(user_id);

create table jawaban (
  id              bigserial primary key,
  sesi_id         bigint references sesi_ujian(id) on delete cascade,
  soal_id         bigint references soal(id),
  jawaban_user    char(1),
  benar           boolean,
  waktu_detik     smallint,
  created_at      timestamptz default now()
);

create index jawaban_sesi_idx on jawaban(sesi_id);
create index jawaban_soal_idx on jawaban(soal_id);

create view performa_subtopik as
select
  j.sesi_id,
  su.user_id,
  s.mapel,
  s.subtopik,
  count(*)                                 as total_soal,
  sum(case when j.benar then 1 else 0 end) as benar,
  round(avg(j.waktu_detik))                as rata_waktu_detik,
  round(
    sum(case when j.benar then 1 else 0 end)::numeric
    / count(*) * 100, 1
  )                                        as akurasi_pct
from jawaban j
join soal s on s.id = j.soal_id
join sesi_ujian su on su.id = j.sesi_id
group by j.sesi_id, su.user_id, s.mapel, s.subtopik;

create table subscriptions (
  id              bigserial primary key,
  user_id         uuid references profiles(id),
  plan            text default 'free',
  aktif_sampai    timestamptz,
  midtrans_order  text,
  created_at      timestamptz default now()
);

create index subscriptions_user_idx on subscriptions(user_id);

alter table profiles      enable row level security;
alter table sesi_ujian    enable row level security;
alter table jawaban       enable row level security;
alter table subscriptions enable row level security;
alter table soal          enable row level security;

create policy "user own data" on profiles
  for all using (auth.uid() = id);

create policy "user own sesi" on sesi_ujian
  for all using (auth.uid() = user_id);

create policy "user own jawaban" on jawaban
  for all using (
    auth.uid() = (select user_id from sesi_ujian where id = sesi_id)
  );

create policy "user own sub" on subscriptions
  for all using (auth.uid() = user_id);

create policy "soal read" on soal
  for select using (auth.role() = 'authenticated');

-- auto-create profile on signup
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nama)
  values (new.id, coalesce(new.raw_user_meta_data->>'nama', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
