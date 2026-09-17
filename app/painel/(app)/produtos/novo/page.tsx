'use client';

import MerchantLayout from '@/src/components/MerchantLayout';
import ProdutoForm from '@/src/components/ProdutoForm';

export default function NovoProdutoPage() {
  return (
    <MerchantLayout title="Novo produto">
      <ProdutoForm />
    </MerchantLayout>
  );
}
