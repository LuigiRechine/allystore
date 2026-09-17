import Link from 'next/link';
import { LojaRepository } from '@/src/repository/lojaRepository';

export default async function Home() {
  let lojas: { id: number; nome: string; slug: string; descricao: string | null }[] = [];
  try {
    const repo = new LojaRepository();
    const todas = await repo.listarTodos();
    lojas = JSON.parse(JSON.stringify(todas.filter((l) => l.status === 'ativo').slice(0, 6)));
  } catch {
    lojas = [];
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M3 6l9-4 9 4v6c0 5-4 8-9 10C7 20 3 17 3 12V6z" fill="white" fillOpacity="0.9" />
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Allys<span className="text-indigo-600">Tore</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/painel/entrar" className="text-sm text-slate-600 hover:text-slate-900">Sou lojista</Link>
            <Link href="/painel/criar-loja" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Criar minha loja
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-slate-900 max-w-xl leading-tight">
          Sua loja online pronta em minutos.
        </h1>
        <p className="text-slate-600 mt-4 max-w-lg">
          A AllysTore é a plataforma para microempreendedores criarem e gerenciarem lojas online sem precisar de conhecimento técnico.
        </p>

        {lojas.length > 0 && (
          <section className="mt-16">
            <h2 className="font-bold text-lg text-slate-900 mb-5">Lojas na plataforma</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lojas.map((l) => (
                <Link
                  key={l.id}
                  href={`/loja/${l.slug}`}
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold mb-3">
                    {l.nome[0]?.toUpperCase()}
                  </div>
                  <p className="font-semibold text-slate-900">{l.nome}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{l.descricao ?? `/loja/${l.slug}`}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-20 pt-8 border-t border-slate-200 flex gap-6 text-sm text-slate-500">
          <Link href="/painel/entrar" className="hover:text-slate-900">Painel do lojista</Link>
          <Link href="/admin/entrar" className="hover:text-slate-900">Painel administrativo</Link>
        </footer>
      </main>
    </div>
  );
}
