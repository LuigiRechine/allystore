'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fmt } from '@/src/lib/format';
import { useLoja } from '@/src/context/LojaContext';
import { useCarrinho } from '@/src/context/CarrinhoContext';
import { StoreNav } from '@/src/components/StoreChrome';
import {
  Button, Divider, EmptyState, Img, Placeholder, QuantitySelector, Loading,
  IconChevronLeft, IconShoppingCart, IconShield, IconX,
} from '@/src/components/ui';

export default function CarrinhoPage() {
  const loja = useLoja();
  const router = useRouter();
  const { itens, subtotal, definirQuantidade, remover, pronto } = useCarrinho();

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreNav />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Carrinho</h1>
          <Link href={`/loja/${loja.slug}`} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <IconChevronLeft className="w-4 h-4" /> Continuar comprando
          </Link>
        </div>

        {!pronto ? (
          <Loading />
        ) : itens.length === 0 ? (
          <EmptyState
            icon={<IconShoppingCart className="w-8 h-8" />}
            title="Seu carrinho está vazio"
            description="Adicione produtos para continuar com a compra."
            action={<Button onClick={() => router.push(`/loja/${loja.slug}`)}>Ver produtos</Button>}
          />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {itens.map((item) => (
                <div key={`${item.produtoId}-${item.variacaoId ?? 'x'}`} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    {item.imagem ? <Img src={item.imagem} alt={item.nome} className="w-full h-full object-cover" /> : <Placeholder />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{item.nome}</p>
                    {(item.tamanho || item.cor) && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.tamanho ? `Tamanho: ${item.tamanho}` : ''}
                        {item.tamanho && item.cor ? ' • ' : ''}
                        {item.cor ? `Cor: ${item.cor}` : ''}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
                      <QuantitySelector
                        value={item.quantidade}
                        max={item.estoqueDisponivel ?? 99}
                        onChange={(q) => definirQuantidade(item.produtoId, item.variacaoId, q)}
                      />
                      <div className="text-right">
                        <p className="text-xs text-slate-400">{fmt(item.preco)} cada</p>
                        <p className="font-bold text-slate-900">{fmt(item.preco * item.quantidade)}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => remover(item.produtoId, item.variacaoId)}
                    className="text-slate-400 hover:text-red-500 transition-colors self-start"
                    aria-label="Remover item"
                  >
                    <IconX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sticky top-20">
                <h2 className="font-bold text-slate-900 mb-4">Resumo do pedido</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({itens.reduce((s, i) => s + i.quantidade, 0)} itens)</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Frete</span>
                    <span className="text-slate-500">A combinar</span>
                  </div>
                  <Divider />
                  <div className="flex justify-between font-bold text-slate-900 text-base">
                    <span>Total</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  <p className="text-xs text-slate-500">3x de {fmt(subtotal / 3)} sem juros</p>
                </div>
                <Button fullWidth size="lg" className="mt-5" onClick={() => router.push(`/loja/${loja.slug}/checkout`)}>
                  Finalizar compra
                </Button>
                <div className="flex items-center gap-2 mt-3 justify-center">
                  <IconShield className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-xs text-slate-400">Compra protegida e segura</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
