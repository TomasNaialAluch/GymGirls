/** Días que dura una invitación desde que se genera. */
export const INVITE_TTL_DAYS = 14;

export function isInviteCode(code: unknown): code is string {
  return typeof code === "string" && /^[A-Za-z0-9_-]{4,32}$/.test(code);
}

/** Acepta el código suelto o el link completo `.../invite/{code}`. */
export function parseInviteCode(input: string): string {
  const value = input.trim();
  const fromLink = value.match(/\/invite\/([^/?#\s]+)/);
  return fromLink ? fromLink[1] : value;
}

/** Las invitaciones viejas tienen `expiresAt: null` y no vencen. */
export function isInviteExpired(
  expiresAt: { toMillis(): number } | null | undefined,
): boolean {
  return !!expiresAt && expiresAt.toMillis() < Date.now();
}
