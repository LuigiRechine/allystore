import { createHash, randomBytes } from 'node:crypto';

// PKCE (RFC 7636): o "verifier" é um segredo aleatório que só o nosso servidor conhece;
// o "challenge" (SHA-256 dele) vai na URL de autorização; o verifier só vai na troca do código por token.
// Assim, um código de autorização roubado não serve para nada.

export const gerarVerifier = () => randomBytes(32).toString('base64url'); // 43 caracteres

export const gerarChallenge = (verifier: string) =>
  createHash('sha256').update(verifier).digest('base64url');
