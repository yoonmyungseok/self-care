import { parseISO, subDays } from "date-fns";

export interface WeightRecordLike {
  date: string;
  weight: number;
}

export interface WeightStats {
  current: number | null;
  changeFromPrevious: number | null;
  changeFromFirst: number | null;
  change7Days: number | null;
  change30Days: number | null;
  targetWeight: number;
  remainingToTarget: number | null;
}

function findRecordOnOrBefore(
  records: WeightRecordLike[],
  targetDate: string,
): WeightRecordLike | null {
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  return sorted.find((r) => r.date <= targetDate) ?? null;
}

export function calculateWeightStats(
  records: WeightRecordLike[],
  targetWeight: number,
  referenceDate: string = new Date().toISOString().slice(0, 10),
): WeightStats {
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0] ?? null;

  if (!latest) {
    return {
      current: null,
      changeFromPrevious: null,
      changeFromFirst: null,
      change7Days: null,
      change30Days: null,
      targetWeight,
      remainingToTarget: null,
    };
  }

  const previousDate = subDays(parseISO(referenceDate), 1);
  const previous = findRecordOnOrBefore(
    records,
    previousDate.toISOString().slice(0, 10),
  );

  const first = [...records].sort((a, b) => a.date.localeCompare(b.date))[0];

  const date7DaysAgo = subDays(parseISO(referenceDate), 7)
    .toISOString()
    .slice(0, 10);
  const date30DaysAgo = subDays(parseISO(referenceDate), 30)
    .toISOString()
    .slice(0, 10);

  const record7DaysAgo = findRecordOnOrBefore(records, date7DaysAgo);
  const record30DaysAgo = findRecordOnOrBefore(records, date30DaysAgo);

  return {
    current: latest.weight,
    changeFromPrevious:
      previous && previous.date !== latest.date
        ? latest.weight - previous.weight
        : previous
          ? 0
          : null,
    changeFromFirst: first ? latest.weight - first.weight : null,
    change7Days: record7DaysAgo
      ? latest.weight - record7DaysAgo.weight
      : null,
    change30Days: record30DaysAgo
      ? latest.weight - record30DaysAgo.weight
      : null,
    targetWeight,
    remainingToTarget: latest.weight - targetWeight,
  };
}

export function formatWeightChange(change: number | null): string {
  if (change == null) return "-";
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)} kg`;
}

export function getWeightChartData(
  records: WeightRecordLike[],
  days: number = 30,
  referenceDate: string = new Date().toISOString().slice(0, 10),
): { date: string; weight: number }[] {
  const startDate = subDays(parseISO(referenceDate), days - 1)
    .toISOString()
    .slice(0, 10);

  return [...records]
    .filter((r) => r.date >= startDate && r.date <= referenceDate)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({ date: r.date, weight: r.weight }));
}
