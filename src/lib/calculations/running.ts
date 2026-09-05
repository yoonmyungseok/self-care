/**
 * Calculate average pace in seconds per km.
 * pace = duration(minutes) / distance(km)
 */
export function calculatePaceSeconds(
  distanceKm: number,
  durationSeconds: number,
): number | null {
  if (!distanceKm || distanceKm <= 0 || !durationSeconds || durationSeconds <= 0) {
    return null;
  }
  const durationMinutes = durationSeconds / 60;
  const paceMinutes = durationMinutes / distanceKm;
  return paceMinutes * 60;
}

export function formatPace(paceSeconds: number | null | undefined): string {
  if (paceSeconds == null || !Number.isFinite(paceSeconds) || paceSeconds <= 0) {
    return "-";
  }
  const minutes = Math.floor(paceSeconds / 60);
  const seconds = Math.round(paceSeconds % 60);
  return `${minutes}'${seconds.toString().padStart(2, "0")}"/km`;
}

export function calculateAveragePace(
  records: { distance: number; durationSeconds: number }[],
): number | null {
  const valid = records.filter((r) => r.distance > 0 && r.durationSeconds > 0);
  if (valid.length === 0) return null;

  const totalDistance = valid.reduce((sum, r) => sum + r.distance, 0);
  const totalDuration = valid.reduce((sum, r) => sum + r.durationSeconds, 0);
  return calculatePaceSeconds(totalDistance, totalDuration);
}

export function sumDistance(records: { distance: number }[]): number {
  return records.reduce((sum, r) => sum + r.distance, 0);
}
