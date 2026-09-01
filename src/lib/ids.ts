const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

export function newId(prefix: string): string {
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `${prefix}_${out}`;
}
