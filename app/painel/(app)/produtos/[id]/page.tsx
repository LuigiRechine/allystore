'use client';

import { use } from 'react';
import MerchantLayout from '@/src/components/MerchantLayout';
import ProdutoForm from '@/src/components/ProdutoForm';

export default function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <MerchantLayout title="Editar produto">
      <ProdutoForm produtoId={id} />
    </MerchantLayout>
  );
}
