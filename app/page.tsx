import Link from 'next/link';
import { Bricolage_Grotesque } from 'next/font/google';
import { LojaRepository } from '@/src/repository/lojaRepository';

// Fonte dos títulos e nomes de loja (o texto corrido continua em Inter)
const display = Bricolage_Grotesque({ subsets: ['latin'], display: 'swap' });

type LojaCard = {
  id: number;
  nome: string;
  slug: string;
  descricao: string | null;
  logo: string | null;
};

// Cada loja recebe sempre a mesma cor (pelo id), então a vitrine fica colorida e estável
const CORES = [
  'bg-rose-500',
  'bg-sky-600',
  'bg-emerald-600',
  'bg-violet-600',
  'bg-orange-600',
  'bg-teal-600',
  'bg-fuchsia-600',
  'bg-amber-600',
];
const corDaLoja = (id: number) => CORES[id % CORES.length];

const foco =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400';

function Marca({ escura = false }: { escura?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" aria-hidden="true">
          <path d="M3 6l9-4 9 4v6c0 5-4 8-9 10C7 20 3 17 3 12V6z" fill="white" fillOpacity="0.9" />
          <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className={`${display.className} font-bold text-xl tracking-tight ${escura ? 'text-white' : 'text-slate-900'}`}>
        Allys<span className={escura ? 'text-indigo-300' : 'text-indigo-600'}>Tore</span>
      </span>
    </div>
  );
}

function Avatar({ loja, tamanho }: { loja: LojaCard; tamanho: 'grande' | 'medio' }) {
  if (loja.logo) {
    return (
      <div
        className={`bg-white rounded-2xl flex items-center justify-center overflow-hidden ${
          tamanho === 'grande' ? 'w-20 h-20' : 'w-14 h-14'
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={loja.logo} alt="" className="w-full h-full object-contain p-1.5" />
      </div>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`${display.className} font-extrabold text-white/90 leading-none ${
        tamanho === 'grande' ? 'text-7xl' : 'text-5xl'
      }`}
    >
      {loja.nome[0]?.toUpperCase()}
    </span>
  );
}

export default async function Home() {
  let lojas: LojaCard[] = [];
  try {
    const repo = new LojaRepository();
    const todas = await repo.listarTodos();
    lojas = JSON.parse(JSON.stringify(todas.filter((l) => l.status === 'ativo').slice(0, 12)));
  } catch {
    lojas = [];
  }

  const destaques = lojas.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Topo */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" aria-label="AllysTore, página inicial" className={`rounded-md ${foco}`}>
            <Marca />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/painel/entrar" className={`text-sm text-slate-600 hover:text-slate-900 rounded-md ${foco}`}>
              Sou lojista
            </Link>
            <Link
              href="/painel/criar-loja"
              className={`text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors ${foco}`}
            >
              Criar minha loja
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-indigo-950">
        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1
              className={`${display.className} text-4xl sm:text-6xl font-extrabold text-white leading-[1.05] tracking-tight`}
            >
              Descubra lojas e compre direto de quem faz.
            </h1>
            <p className="text-indigo-200 mt-6 text-lg max-w-md leading-relaxed">
              Escolha uma loja, monte seu carrinho e finalize o pedido. Cada loja da AllysTore é de um empreendedor
              independente.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#lojas"
                className={`bg-white text-indigo-950 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors ${foco}`}
              >
                Ver lojas
              </a>
              <Link
                href="/painel/criar-loja"
                className={`border border-indigo-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-900 transition-colors ${foco}`}
              >
                Criar minha loja
              </Link>
            </div>
          </div>

          {destaques.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {destaques.map((l, i) => (
                <Link
                  key={l.id}
                  href={`/loja/${l.slug}`}
                  className={`${corDaLoja(l.id)} rounded-3xl aspect-square p-5 flex flex-col justify-between hover:scale-[1.02] transition-transform ${foco} ${
                    i % 2 === 1 ? 'sm:translate-y-6' : ''
                  }`}
                >
                  <Avatar loja={l} tamanho="grande" />
                  <span className={`${display.className} text-white font-bold text-lg leading-tight line-clamp-2`}>
                    {l.nome}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Vitrine de lojas */}
      <main id="lojas" className="max-w-6xl mx-auto px-6 py-16 scroll-mt-16">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className={`${display.className} text-3xl font-bold text-slate-900 tracking-tight`}>
              Lojas abertas agora
            </h2>
            <p className="text-slate-500 mt-1">Entre em uma loja para ver os produtos.</p>
          </div>
          {lojas.length > 0 && (
            <p className="text-sm text-slate-500 shrink-0">
              {lojas.length} {lojas.length === 1 ? 'loja' : 'lojas'}
            </p>
          )}
        </div>

        {lojas.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
            <p className={`${display.className} text-xl font-bold text-slate-900`}>Ainda não há lojas por aqui</p>
            <p className="text-slate-500 mt-2">Crie a primeira loja da plataforma.</p>
            <Link
              href="/painel/criar-loja"
              className={`inline-block mt-5 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors ${foco}`}
            >
              Criar minha loja
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lojas.map((l) => (
              <Link
                key={l.id}
                href={`/loja/${l.slug}`}
                className={`group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-300 hover:shadow-lg transition ${foco}`}
              >
                <div className={`${corDaLoja(l.id)} h-36 flex items-center justify-center`}>
                  <Avatar loja={l} tamanho="medio" />
                </div>
                <div className="p-5">
                  <h3 className={`${display.className} text-xl font-bold text-slate-900`}>{l.nome}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2 min-h-10">
                    {l.descricao ?? 'Veja os produtos desta loja.'}
                  </p>
                  <span className="inline-block mt-4 text-sm font-semibold text-indigo-600 group-hover:underline">
                    Visitar loja
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Chamada para lojistas */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className={`${display.className} text-2xl font-bold text-slate-900 tracking-tight`}>
              Tem um negócio? Abra sua loja em minutos.
            </h2>
            <p className="text-slate-500 mt-2 max-w-lg">
              Cadastre seus produtos, receba pedidos e acompanhe as vendas em um painel simples, sem precisar de
              conhecimento técnico.
            </p>
          </div>
          <Link
            href="/painel/criar-loja"
            className={`shrink-0 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors text-center ${foco}`}
          >
            Criar minha loja
          </Link>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
          <Marca />
          <div className="flex gap-6">
            <Link href="/painel/entrar" className={`hover:text-slate-900 rounded-md ${foco}`}>
              Painel do lojista
            </Link>
            <Link href="/admin/entrar" className={`hover:text-slate-900 rounded-md ${foco}`}>
              Painel administrativo
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}