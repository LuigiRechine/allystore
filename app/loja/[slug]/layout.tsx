import { notFound } from 'next/navigation';
import { LojaRepository } from '@/src/repository/lojaRepository';
import { LojaProvider } from '@/src/context/LojaContext';
import { CarrinhoProvider } from '@/src/context/CarrinhoContext';
import type { Loja } from '@/src/lib/types';

// Server Component: busca a loja direto pelo repository (sem HTTP interno).
async function buscarLoja(slug: string): Promise<Loja | null> {
  const repo = new LojaRepository();
  const lojas = await repo.listarTodos();
  const achada = lojas.find((l) => l.slug === slug);
  return achada ? (JSON.parse(JSON.stringify(achada)) as Loja) : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loja = await buscarLoja(slug);
  return {
    title: loja ? `${loja.nome} | AllysTore` : 'Loja não encontrada',
    description: loja?.descricao ?? 'Loja online criada com AllysTore',
  };
}

export default async function LojaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const loja = await buscarLoja(slug);

  if (!loja || loja.status !== 'ativo') notFound();

  return (
    <LojaProvider loja={loja}>
      <CarrinhoProvider slug={slug}>{children}</CarrinhoProvider>
    </LojaProvider>
  );
}
