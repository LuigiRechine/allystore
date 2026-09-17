'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import MerchantLayout from '@/src/components/MerchantLayout';
import { api, estoqueDoProduto, imagemPrincipal } from '@/src/lib/api';
import { fmt } from '@/src/lib/format';
import { sessaoLojista } from '@/src/lib/session';
import {
  Badge, Button, Card, Img, Modal, Placeholder, SearchInput, PageHeader, StockBadge,
  Table, Thead, Th, Td, Tr, Loading, ErrorState, useToast, IconPlus, IconEdit, IconTrash,
} from '@/src/components/ui';
import type { Estoque, Imagem, Produto, ProdutoVariacao } from '@/src/lib/types';

export default function ProdutosPage() {
  const router = useRouter();
  const { show, ToastEl } = useToast();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [variacoes, setVariacoes] = useState<ProdutoVariacao[]>([]);
  const [estoques, setEstoques] = useState<Estoque[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [excluir, setExcluir] = useState<Produto | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = async () => {
    const sessao = sessaoLojista.ler();
    if (!sessao) return;
    setCarregando(true);
    setErro(null);
    try {
      const [ps, imgs, vars, ests] = await Promise.all([
        api.produto.listar(), api.imagem.listar(), api.produtoVariacao.listar(), api.estoque.listar(),
      ]);
      setProdutos(ps.filter((p) => Number(p.lojaId) === sessao.loja.id));
      setImagens(imgs); setVariacoes(vars); setEstoques(ests);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar produtos.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => produtos.filter((p) => {
    const estoque = estoqueDoProduto(p.id, variacoes, estoques);
    const casaBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
    const casaFiltro =
      filtro === 'todos' ||
      filtro === p.status ||
      (filtro === 'sem_estoque' && estoque === 0) ||
      (filtro === 'estoque_baixo' && estoque !== null && estoque > 0 && estoque <= 5);
    return casaBusca && casaFiltro;
  }), [produtos, variacoes, estoques, busca, filtro]);

  const confirmarExclusao = async () => {
    if (!excluir) return;
    setExcluindo(true);
    try {
      await api.produto.excluir(excluir.id);
      setProdutos((ps) => ps.filter((p) => p.id !== excluir.id));
      show('Produto excluído.');
      setExcluir(null);
    } catch (e) {
      show(
        e instanceof Error && e.message.includes('constraint')
          ? 'Não é possível excluir: o produto está ligado a pedidos ou variações.'
          : e instanceof Error ? e.message : 'Falha ao excluir.',
        'error',
      );
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <MerchantLayout title="Produtos">
      {ToastEl}
      <PageHeader
        title="Produtos"
        description={`${produtos.length} produtos cadastrados`}
        action={<Button onClick={() => router.push('/painel/produtos/novo')}><IconPlus className="w-4 h-4" /> Novo produto</Button>}
      />

      <Card>
        <div className="p-4 border-b border-slate-100 flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48">
            <SearchInput placeholder="Buscar produto..." value={busca} onChange={setBusca} />
          </div>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white"
          >
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="estoque_baixo">Estoque baixo</option>
            <option value="sem_estoque">Sem estoque</option>
          </select>
        </div>

        {carregando ? <Loading /> : erro ? <ErrorState message={erro} onRetry={carregar} /> : (
          <Table>
            <Thead>
              <tr><Th>Produto</Th><Th>Categoria</Th><Th>Preço</Th><Th>Estoque</Th><Th>Status</Th><Th>Ações</Th></tr>
            </Thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-slate-500 text-sm">Nenhum produto encontrado</td></tr>
              ) : filtrados.map((p) => {
                const img = imagemPrincipal(p.id, imagens);
                const estoque = estoqueDoProduto(p.id, variacoes, estoques);
                const sku = variacoes.find((v) => Number(v.produtoId) === p.id)?.sku;
                return (
                  <Tr key={p.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          {img ? <Img src={img} alt={p.nome} className="w-full h-full object-cover" /> : <Placeholder />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{p.nome}</p>
                          <p className="text-xs text-slate-400">{sku ? `SKU: ${sku}` : `#${p.id}`}</p>
                        </div>
                      </div>
                    </Td>
                    <Td><Badge color="slate">{p.categoria?.nome ?? '—'}</Badge></Td>
                    <Td><span className="font-semibold text-slate-900">{fmt(p.preco)}</span></Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{estoque ?? '—'}</span>
                        <StockBadge qty={estoque} />
                      </div>
                    </Td>
                    <Td><Badge color={p.status === 'ativo' ? 'green' : 'slate'}>{p.status === 'ativo' ? 'Ativo' : 'Inativo'}</Badge></Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => router.push(`/painel/produtos/${p.id}`)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors"
                          aria-label="Editar"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setExcluir(p)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                          aria-label="Excluir"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={!!excluir} onClose={() => setExcluir(null)} title="Excluir produto">
        <p className="text-slate-600 mb-6">
          Tem certeza que deseja excluir <strong>{excluir?.nome}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setExcluir(null)}>Cancelar</Button>
          <Button variant="danger" fullWidth onClick={confirmarExclusao} disabled={excluindo}>
            {excluindo ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </Modal>
    </MerchantLayout>
  );
}
