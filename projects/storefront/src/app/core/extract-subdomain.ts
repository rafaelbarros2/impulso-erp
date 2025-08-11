export function extractSubdomain(host: string): string | null {
  // exemplos: loja.exemplo.com → "loja"; www.loja.exemplo.com → "loja"; localhost → "demo"
  if (!host) return null;
  if (host.startsWith('localhost')) return 'demo';
  const parts = host.split('.').filter(Boolean);
  if (parts.length < 3) return parts[0] === 'www' ? null : parts[0] ?? null;
  return parts[0] === 'www' ? parts[1] : parts[0];
}
