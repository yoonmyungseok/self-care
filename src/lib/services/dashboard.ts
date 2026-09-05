import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/services/settings";
import { calculateWeightStats, getWeightChartData } from "@/lib/calculations/weight";
import { calculateAveragePace, sumDistance } from "@/lib/calculations/running";
import { calculateNutritionSummary } from "@/lib/calculations/diet";
import { todayString } from "@/lib/utils";

export async function getDashboardData() {
  const today = todayString();
  const settings = await getSettings();

  const [weightRecords, runningRecords, todayMeals] = await Promise.all([
    prisma.weightRecord.findMany({ orderBy: { date: "desc" } }),
    prisma.runningRecord.findMany({ orderBy: { date: "desc" } }),
    prisma.meal.findMany({
      where: { date: today },
      include: { foodEntries: true },
    }),
  ]);

  const weightStats = calculateWeightStats(
    weightRecords,
    settings.targetWeight,
    today,
  );

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    .toISOString()
    .slice(0, 10);
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
    .toISOString()
    .slice(0, 10);
  const monthStart = startOfMonth(new Date()).toISOString().slice(0, 10);
  const monthEnd = endOfMonth(new Date()).toISOString().slice(0, 10);

  const weekRuns = runningRecords.filter(
    (r) => r.date >= weekStart && r.date <= weekEnd,
  );
  const monthRuns = runningRecords.filter(
    (r) => r.date >= monthStart && r.date <= monthEnd,
  );

  const last30Start = subDays(new Date(), 29).toISOString().slice(0, 10);
  const last30Runs = runningRecords.filter((r) => r.date >= last30Start);

  const todayFoodEntries = todayMeals.flatMap((m) => m.foodEntries);
  const nutrition = calculateNutritionSummary(todayFoodEntries, settings);

  const runningChartData = aggregateRunningByDate(last30Runs, last30Start, today);
  const weightChartData = getWeightChartData(weightRecords, 30, today);

  return {
    targets: {
      targetCalories: settings.targetCalories,
      targetCarbs: settings.targetCarbs,
      targetProtein: settings.targetProtein,
      targetFat: settings.targetFat,
    },
    weight: weightStats,
    running: {
      weekDistance: sumDistance(weekRuns),
      monthDistance: sumDistance(monthRuns),
      recentAveragePace: calculateAveragePace(runningRecords.slice(0, 10)),
      totalCount: runningRecords.length,
      chartData: runningChartData,
      recentRecords: runningRecords.slice(0, 5),
    },
    diet: nutrition,
    weightChartData,
    recentWeightRecords: weightRecords.slice(0, 5),
    todayMeals,
  };
}

function aggregateRunningByDate(
  records: { date: string; distance: number }[],
  startDate: string,
  endDate: string,
): { date: string; distance: number }[] {
  const map = new Map<string, number>();
  for (const r of records) {
    map.set(r.date, (map.get(r.date) ?? 0) + r.distance);
  }

  const result: { date: string; distance: number }[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    result.push({ date: dateStr, distance: map.get(dateStr) ?? 0 });
  }
  return result;
}
