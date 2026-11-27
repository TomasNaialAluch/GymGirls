/** Los Timestamp de Firestore llegan del API como { _seconds, _nanoseconds }. */
export function timestampMillis(value: unknown): number | null {
  const ts = value as { _seconds?: number; seconds?: number } | null;
  const seconds = ts?._seconds ?? ts?.seconds;
  return seconds != null ? seconds * 1000 : null;
}

/** Días de calendario entre `millis` y ahora (0 = hoy). */
export function daysAgo(millis: number, now = Date.now()): number {
  const day = (m: number) => new Date(m).setHours(0, 0, 0, 0);
  return Math.round((day(now) - day(millis)) / 86_400_000);
}
