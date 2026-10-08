import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

type Papel = 'admin' | 'lojista' | 'cliente';
type Acesso = 'publico' | Papel[];

const LOGADOS: Papel[] = ['admin', 'lojista', 'cliente'];
const EQUIPE: Papel[] = ['admin', 'lojista'];

// Quem pode LER (GET) e quem pode ESCREVER (POST/PUT/DELETE) em cada recurso de /api/<recurso>
const REGRAS: Record<string, { leitura: Acesso; escrita: Acesso }> = {
  usuario:         { leitura: ['admin'], escrita: ['admin'] }, // o próprio usuário é tratado abaixo
  administrador:   { leitura: ['admin'], escrita: ['admin'] },
  admin:           { leitura: ['admin'], escrita: ['admin'] },
  lojista:         { leitura: EQUIPE,    escrita: ['admin'] },
  cliente:         { leitura: EQUIPE,    escrita: ['admin', 'cliente'] },
  // vitrine pública: qualquer pessoa pode ler, só a equipe da loja escreve
  loja:            { leitura: 'publico', escrita: EQUIPE },
  categoria:       { leitura: 'publico', escrita: EQUIPE },
  produto:         { leitura: 'publico', escrita: EQUIPE },
  produtoVariacao: { leitura: 'publico', escrita: EQUIPE },
  estoque:         { leitura: 'publico', escrita: EQUIPE },
  imagem:          { leitura: 'publico', escrita: EQUIPE },
  // compra (o cliente precisa criar). TODO: fechar no passo do checkout seguro
  pedido:          { leitura: LOGADOS,   escrita: LOGADOS },
  produtoPedido:   { leitura: LOGADOS,   escrita: LOGADOS },
  pagamento:       { leitura: LOGADOS,   escrita: LOGADOS },
  carrinho:        { leitura: LOGADOS,   escrita: LOGADOS },
  produtoCarrinho: { leitura: LOGADOS,   escrita: LOGADOS },
};

async function lerSessao(req: NextRequest): Promise<{ id: number; tipo: Papel } | null> {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const segredo = new TextEncoder().encode(process.env.JWT_SECRET ?? '');
    const { payload } = await jwtVerify(token, segredo);
    return { id: Number(payload.id), tipo: payload.tipo as Papel };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessao = await lerSessao(req);

  // ---------- API ----------
  if (pathname.startsWith('/api/')) {
    const partes = pathname.split('/').filter(Boolean); // ['api', 'produto', '3']
    const recurso = partes[1];
    const id = partes[2];

    // login/registrar/logout/me/senha se protegem sozinhos; webhook será validado pela assinatura do provedor
    if (recurso === 'auth' || recurso === 'webhook') return NextResponse.next();

    const regra = REGRAS[recurso];
    if (!regra) return NextResponse.json({ erro: 'Acesso negado.' }, { status: 403 }); // padrão: negar

    const leitura = req.method === 'GET' || req.method === 'HEAD';
    const acesso = leitura ? regra.leitura : regra.escrita;

    if (acesso === 'publico') return NextResponse.next();
    if (!sessao) return NextResponse.json({ erro: 'Faça login para continuar.' }, { status: 401 });

    // cada usuário pode ler/editar o PRÓPRIO cadastro (nunca excluir)
    const proprioUsuario = recurso === 'usuario' && id && Number(id) === sessao.id && req.method !== 'DELETE';
    if (proprioUsuario || acesso.includes(sessao.tipo)) return NextResponse.next();

    return NextResponse.json({ erro: 'Você não tem permissão para isso.' }, { status: 403 });
  }

  // ---------- PÁGINAS ----------
  if (pathname.startsWith('/painel')) {
    const livre = pathname === '/painel/entrar' || pathname === '/painel/criar-loja';
    if (!livre && sessao?.tipo !== 'lojista') {
      return NextResponse.redirect(new URL('/painel/entrar', req.url));
    }
  }

  if (pathname.startsWith('/admin')) {
    if (pathname !== '/admin/entrar' && sessao?.tipo !== 'admin') {
      return NextResponse.redirect(new URL('/admin/entrar', req.url));
    }
  }

  const area = pathname.match(/^\/loja\/([^/]+)\/(conta|checkout|pagamento|confirmacao)/);
  if (area && sessao?.tipo !== 'cliente') {
    const volta = area[2] === 'checkout' ? '?redirect=checkout' : '';
    return NextResponse.redirect(new URL(`/loja/${area[1]}/entrar${volta}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/painel/:path*', '/admin/:path*', '/loja/:path*'],
};