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

export function formatPaceColon(paceSeconds: number | null | undefined): string {
  if (paceSeconds == null || !Number.isFinite(paceSeconds) || paceSeconds <= 0) {
    return "-";
  }
  const minutes = Math.floor(paceSeconds / 60);
  const seconds = Math.round(paceSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatDistanceKm(distance: number): string {
  const value = distance % 1 === 0 ? distance.toString() : distance.toFixed(1);
  return `${value}km`;
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

export function countRecords(
  records: { date: string }[],
  startDate: string,
  endDate: string,
): number {
  return records.filter((r) => r.date >= startDate && r.date <= endDate).length;
}

export function findLongestRun(
  records: { date: string; distance: number }[],
): { distance: number; date: string } | null {
  if (records.length === 0) return null;

  const longest = records.reduce((best, record) =>
    record.distance > best.distance ? record : best,
  );

  return { distance: longest.distance, date: longest.date };
}

export function formatDistanceChange(changeKm: number): string {
  if (changeKm === 0) return "0 km";
  const sign = changeKm > 0 ? "+" : "";
  return `${sign}${changeKm.toFixed(1)} km`;
}
