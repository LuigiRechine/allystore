import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

// Criptografia dos tokens OAuth das lojas (AES-256-GCM).
// MP_TOKEN_KEY = 32 bytes em base64. Gere com:
//   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

function chave(): Buffer {
  const b64 = process.env.MP_TOKEN_KEY;
  if (!b64) throw new Error('Variável de ambiente MP_TOKEN_KEY não configurada.');
  const k = Buffer.from(b64, 'base64');
  if (k.length !== 32) throw new Error('MP_TOKEN_KEY precisa ter exatamente 32 bytes (base64).');
  return k;
}

/** Formato: v1.<iv>.<tag>.<texto cifrado> (tudo em base64url) */
export function criptografar(texto: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', chave(), iv);
  const cifrado = Buffer.concat([c.update(texto, 'utf8'), c.final()]);
  const tag = c.getAuthTag();
  return ['v1', iv.toString('base64url'), tag.toString('base64url'), cifrado.toString('base64url')].join('.');
}

export function descriptografar(valor: string): string {
  const [versao, iv, tag, cifrado] = valor.split('.');
  if (versao !== 'v1' || !iv || !tag || !cifrado) throw new Error('Token armazenado em formato inválido.');
  const d = createDecipheriv('aes-256-gcm', chave(), Buffer.from(iv, 'base64url'));
  d.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([d.update(Buffer.from(cifrado, 'base64url')), d.final()]).toString('utf8');
}
