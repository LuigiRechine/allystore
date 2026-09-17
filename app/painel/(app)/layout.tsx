import type { ReactNode } from 'react';

// O MerchantLayout é aplicado dentro de cada página para que cada uma defina
// seu próprio título na topbar.
export default function PainelLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
