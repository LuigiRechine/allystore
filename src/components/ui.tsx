'use client';

/* eslint-disable @next/next/no-img-element */

import {
  type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes,
  type TextareaHTMLAttributes, type SelectHTMLAttributes, type ImgHTMLAttributes,
  useState, useCallback,
} from 'react';
import { iniciais } from '@/src/lib/format';

// ─── Imagem ───────────────────────────────────────────────────────────────────
// Usamos <img> em vez de next/image para não precisar configurar remotePatterns
// no next.config.ts a cada domínio de imagem cadastrado pelo lojista.

export function Img({ alt = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return <img alt={alt} {...props} />;
}

export function Placeholder({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full h-full bg-slate-100 flex items-center justify-center ${className}`}>
      <IconPackage className="w-8 h-8 text-slate-300" />
    </div>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

export function AllysToreLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { box: 'w-7 h-7', text: 'text-base' },
    md: { box: 'w-8 h-8', text: 'text-xl' },
    lg: { box: 'w-10 h-10', text: 'text-2xl' },
  };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2">
      <div className={`${s.box} bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <path d="M3 6l9-4 9 4v6c0 5-4 8-9 10C7 20 3 17 3 12V6z" fill="white" fillOpacity="0.9" />
          <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className={`font-bold ${s.text} tracking-tight text-slate-900`}>
        Allys<span className="text-indigo-600">Tore</span>
      </span>
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({ variant = 'primary', size = 'md', children, fullWidth, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm',
    secondary: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus:ring-indigo-300',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-300 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeColor = 'indigo' | 'green' | 'yellow' | 'red' | 'slate' | 'blue' | 'orange' | 'purple';

export function Badge({ children, color = 'slate' }: { children: ReactNode; color?: BadgeColor }) {
  const colors: Record<BadgeColor, string> = {
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    yellow: 'bg-amber-50 text-amber-700 ring-amber-200',
    red: 'bg-red-50 text-red-700 ring-red-200',
    slate: 'bg-slate-100 text-slate-600 ring-slate-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
    orange: 'bg-orange-50 text-orange-700 ring-orange-200',
    purple: 'bg-purple-50 text-purple-700 ring-purple-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${colors[color]}`}>
      {children}
    </span>
  );
}

export const STATUS_PEDIDO = ['novo', 'pago', 'preparacao', 'enviado', 'entregue', 'cancelado'] as const;

export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: BadgeColor }> = {
    novo: { label: 'Novo', color: 'blue' },
    pago: { label: 'Pago', color: 'green' },
    preparacao: { label: 'Em preparação', color: 'purple' },
    enviado: { label: 'Enviado', color: 'indigo' },
    entregue: { label: 'Entregue', color: 'green' },
    cancelado: { label: 'Cancelado', color: 'red' },
  };
  const s = map[status] ?? { label: status, color: 'slate' as BadgeColor };
  return <Badge color={s.color}>{s.label}</Badge>;
}

export function StockBadge({ qty }: { qty: number | null }) {
  if (qty === null) return <Badge color="slate">Sem controle</Badge>;
  if (qty === 0) return <Badge color="red">Sem estoque</Badge>;
  if (qty <= 5) return <Badge color="yellow">Estoque baixo</Badge>;
  return <Badge color="green">Em estoque</Badge>;
}

// ─── Input / Textarea / Select ────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; hint?: string;
}

export function Input({ label, error, hint, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input
        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg outline-none transition-colors
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'}
          placeholder:text-slate-400 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <textarea
        rows={3}
        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg outline-none transition-colors resize-none
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'}
          placeholder:text-slate-400 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; children: ReactNode;
}

export function Select({ label, children, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <select
        className={`w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none
          focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-slate-800 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

// ─── Card / Modal / Toast ─────────────────────────────────────────────────────

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}>{children}</div>;
}

export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title?: string; children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Fechar">
              <IconX />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Toast({ message, type = 'success', onClose }: {
  message: string; type?: 'success' | 'error' | 'info'; onClose: () => void;
}) {
  const colors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 border rounded-xl shadow-lg text-sm font-medium ${colors[type]}`}>
      {type === 'success' && <IconCheck className="w-4 h-4 flex-shrink-0" />}
      {type === 'error' && <IconX className="w-4 h-4 flex-shrink-0" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100" aria-label="Fechar">
        <IconX className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const show = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  const ToastEl = toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null;
  return { show, ToastEl };
}

// ─── Estados de lista ─────────────────────────────────────────────────────────

export function EmptyState({ icon, title, description, action }: {
  icon?: ReactNode; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {icon && <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">{icon}</div>}
      <div>
        <p className="font-semibold text-slate-700">{title}</p>
        {description && <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Spinner({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin text-indigo-600 ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function Loading({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
      <Spinner /> {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
        <IconAlertTriangle className="w-6 h-6" />
      </div>
      <p className="text-sm text-slate-700 font-medium">Não foi possível carregar</p>
      <p className="text-xs text-slate-500 max-w-sm">{message}</p>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Tentar novamente</Button>}
    </div>
  );
}

// ─── Diversos ─────────────────────────────────────────────────────────────────

export function QuantitySelector({ value, onChange, min = 1, max = 99 }: {
  value: number; onChange: (n: number) => void; min?: number; max?: number;
}) {
  return (
    <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden">
      <button onClick={() => onChange(Math.max(min, value - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600" aria-label="Diminuir">
        <span className="text-lg leading-none">−</span>
      </button>
      <span className="w-10 text-center text-sm font-medium text-slate-800">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600" aria-label="Aumentar">
        <span className="text-lg leading-none">+</span>
      </button>
    </div>
  );
}

export function Tabs({ tabs, active, onChange }: {
  tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-0 border-b border-slate-200 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap
            ${active === tab.id ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function StatCard({ label, value, sub, icon, color = 'indigo' }: {
  label: string; value: string; sub?: string; icon?: ReactNode; color?: 'indigo' | 'green' | 'amber' | 'red' | 'purple';
}) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
        </div>
        {icon && <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>{icon}</div>}
      </div>
    </Card>
  );
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' };
  return (
    <div className={`${sizes[size]} rounded-full bg-indigo-100 text-indigo-600 font-semibold flex items-center justify-center flex-shrink-0`}>
      {iniciais(name || '?')}
    </div>
  );
}

export function SearchInput({ placeholder = 'Buscar...', value, onChange }: {
  placeholder?: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
        <IconSearch className="w-4 h-4" />
      </div>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
      />
    </div>
  );
}

export function PageHeader({ title, description, action }: {
  title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-indigo-500 rounded-t-md transition-all duration-500" style={{ height: `${(d.value / max) * 100}%`, minHeight: '4px' }} />
          <span className="text-[10px] text-slate-500 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Divider({ label }: { label?: string }) {
  if (!label) return <div className="border-t border-slate-100 my-4" />;
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 border-t border-slate-200" />
      <span className="text-xs text-slate-400">{label}</span>
      <div className="flex-1 border-t border-slate-200" />
    </div>
  );
}

/** QR estilizado, determinístico a partir do código Pix (sem libs externas). */
export function QRCodePix({ codigo }: { codigo: string }) {
  const cells = Array.from({ length: 25 }, (_, i) => {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const corner = (row < 2 && col < 2) || (row < 2 && col > 2) || (row > 2 && col < 2);
    return corner || codigo.charCodeAt(i % codigo.length) % 2 === 0;
  });
  return (
    <div className="w-44 h-44 bg-white border-2 border-slate-200 rounded-xl p-4 grid grid-cols-5 gap-1">
      {cells.map((filled, i) => <div key={i} className={`rounded-sm ${filled ? 'bg-slate-900' : 'bg-transparent'}`} />)}
    </div>
  );
}

export function ProgressSteps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
              ${i < current ? 'bg-indigo-600 text-white' : i === current ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-slate-100 text-slate-400'}`}>
              {i < current ? <IconCheck className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${i <= current ? 'text-slate-900' : 'text-slate-400'}`}>{step}</span>
          </div>
          {i < steps.length - 1 && <div className={`h-px w-12 mx-2 ${i < current ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
        </div>
      ))}
    </div>
  );
}

// ─── Tabela ───────────────────────────────────────────────────────────────────

export function Table({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`overflow-x-auto ${className}`}><table className="w-full text-sm">{children}</table></div>;
}
export function Thead({ children }: { children: ReactNode }) {
  return <thead className="bg-slate-50 border-b border-slate-200">{children}</thead>;
}
export function Th({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${className}`}>{children}</th>;
}
export function Td({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-slate-700 ${className}`}>{children}</td>;
}
export function Tr({ children, onClick, className = '' }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <tr onClick={onClick} className={`border-b border-slate-100 last:border-0 transition-colors ${onClick ? 'cursor-pointer hover:bg-slate-50' : ''} ${className}`}>
      {children}
    </tr>
  );
}

// ─── Ícones ───────────────────────────────────────────────────────────────────

const iconProps = (className = 'w-5 h-5') => ({
  fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, viewBox: '0 0 24 24',
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className,
});

type IP = { className?: string };

export function IconHome({ className }: IP) { return <svg {...iconProps(className)}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></svg>; }
export function IconPackage({ className }: IP) { return <svg {...iconProps(className)}><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27,6.96 12,12.01 20.73,6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>; }
export function IconShoppingBag({ className }: IP) { return <svg {...iconProps(className)}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>; }
export function IconShoppingCart({ className }: IP) { return <svg {...iconProps(className)}><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /></svg>; }
export function IconClipboard({ className }: IP) { return <svg {...iconProps(className)}><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>; }
export function IconStore({ className }: IP) { return <svg {...iconProps(className)}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>; }
export function IconSettings({ className }: IP) { return <svg {...iconProps(className)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>; }
export function IconLogOut({ className }: IP) { return <svg {...iconProps(className)}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>; }
export function IconSearch({ className }: IP) { return <svg {...iconProps(className)}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>; }
export function IconX({ className }: IP) { return <svg {...iconProps(className)}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }
export function IconCheck({ className }: IP) { return <svg {...iconProps(className)}><polyline points="20,6 9,17 4,12" /></svg>; }
export function IconChevronRight({ className }: IP) { return <svg {...iconProps(className)}><polyline points="9,18 15,12 9,6" /></svg>; }
export function IconChevronLeft({ className }: IP) { return <svg {...iconProps(className)}><polyline points="15,18 9,12 15,6" /></svg>; }
export function IconPlus({ className }: IP) { return <svg {...iconProps(className)}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>; }
export function IconEdit({ className }: IP) { return <svg {...iconProps(className)}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>; }
export function IconTrash({ className }: IP) { return <svg {...iconProps(className)}><polyline points="3,6 5,6 21,6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>; }
export function IconCopy({ className }: IP) { return <svg {...iconProps(className)}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>; }
export function IconBell({ className }: IP) { return <svg {...iconProps(className)}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>; }
export function IconUser({ className }: IP) { return <svg {...iconProps(className)}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>; }
export function IconTruck({ className }: IP) { return <svg {...iconProps(className)}><rect x="1" y="3" width="15" height="13" /><polygon points="16,8 20,8 23,11 23,16 16,16 16,8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>; }
export function IconShield({ className }: IP) { return <svg {...iconProps(className)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>; }
export function IconGrid({ className }: IP) { return <svg {...iconProps(className)}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>; }
export function IconTrendingUp({ className }: IP) { return <svg {...iconProps(className)}><polyline points="23,6 13.5,15.5 8.5,10.5 1,18" /><polyline points="17,6 23,6 23,12" /></svg>; }
export function IconAlertTriangle({ className }: IP) { return <svg {...iconProps(className)}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>; }
export function IconInstagram({ className }: IP) { return <svg {...iconProps(className)}><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>; }
export function IconWhatsApp({ className }: IP) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? 'w-5 h-5'}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
