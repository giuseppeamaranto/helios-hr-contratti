// Helpers per avatar circolari (colore di sfondo + iniziali).
// Centralizzati qui per evitare 5+ implementazioni divergenti nei vari componenti.

const COLORS = [
  '#295fa9', '#16a34a', '#d97706', '#7c3aed',
  '#0891b2', '#dc2626', '#0f766e', '#be185d',
];

export function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffff;
  return COLORS[Math.abs(h) % COLORS.length];
}

export function initials(name: string): string {
  return name.trim().split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}
