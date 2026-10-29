-- Rode UMA VEZ no SQL Editor do Supabase, DEPOIS de criar as tabelas com o Prisma.
--
-- Por quê: o Supabase expõe todas as tabelas do schema "public" numa API pública
-- (Data API), acessível com a chave publicável. Sem RLS, qualquer pessoa leria
-- a tabela "Usuario" (com os hashes de senha). O Prisma conecta como role "postgres",
-- que ignora o RLS, então o app continua funcionando normalmente.

do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' and tablename <> '_prisma_migrations'
  loop
    execute format('alter table public.%I enable row level security', t.tablename);
    execute format('revoke all on table public.%I from anon, authenticated', t.tablename);
  end loop;
end $$;

-- As sequences (ids autoincrement) também não precisam ficar abertas
revoke all on all sequences in schema public from anon, authenticated;
