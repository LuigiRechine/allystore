import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <p className="text-6xl font-bold text-slate-200">404</p>
        <h1 className="text-xl font-bold text-slate-900 mt-4">Página não encontrada</h1>
        <p className="text-sm text-slate-500 mt-2">
          O endereço que você tentou acessar não existe ou a loja está inativa.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
