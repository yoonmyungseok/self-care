import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns";
import { prisma } from "@/lib/db";
import { errorResponse, jsonResponse } from "@/lib/utils";
import { runningRecordSchema } from "@/lib/validations/schemas";
import { calculatePaceSeconds, calculateAveragePace, sumDistance } from "@/lib/calculations/running";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const days = parseInt(searchParams.get("days") ?? "30", 10);

    if (date) {
      const records = await prisma.runningRecord.findMany({
        where: { date },
        include: { splits: { orderBy: { splitNumber: "asc" } } },
        orderBy: { createdAt: "desc" },
      });
      return jsonResponse(records);
    }

    const records = await prisma.runningRecord.findMany({
      include: { splits: { orderBy: { splitNumber: "asc" } } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    const today = new Date().toISOString().slice(0, 10);
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
      .toISOString()
      .slice(0, 10);
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
      .toISOString()
      .slice(0, 10);
    const monthStart = startOfMonth(new Date()).toISOString().slice(0, 10);
    const monthEnd = endOfMonth(new Date()).toISOString().slice(0, 10);
    const last7 = subDays(new Date(), 7).toISOString().slice(0, 10);
    const last30 = subDays(new Date(), 30).toISOString().slice(0, 10);

    const stats = {
      weekDistance: sumDistance(records.filter((r) => r.date >= weekStart && r.date <= weekEnd)),
      monthDistance: sumDistance(records.filter((r) => r.date >= monthStart && r.date <= monthEnd)),
      last7DaysDistance: sumDistance(records.filter((r) => r.date >= last7)),
      last30DaysDistance: sumDistance(records.filter((r) => r.date >= last30)),
      totalCount: records.length,
      averagePace: calculateAveragePace(records),
    };

    const chartStart = subDays(new Date(), days - 1).toISOString().slice(0, 10);
    const chartRecords = records.filter((r) => r.date >= chartStart && r.date <= today);

    const distanceByDate = new Map<string, number>();
    const paceByDate = new Map<string, { totalDist: number; totalDur: number }>();

    for (const r of chartRecords) {
      distanceByDate.set(r.date, (distanceByDate.get(r.date) ?? 0) + r.distance);
      const existing = paceByDate.get(r.date) ?? { totalDist: 0, totalDur: 0 };
      existing.totalDist += r.distance;
      existing.totalDur += r.durationSeconds;
      paceByDate.set(r.date, existing);
    }

    const distanceChart: { date: string; distance: number }[] = [];
    const paceChart: { date: string; pace: number | null }[] = [];

    for (let d = new Date(chartStart); d <= new Date(today); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      distanceChart.push({ date: dateStr, distance: distanceByDate.get(dateStr) ?? 0 });
      const paceData = paceByDate.get(dateStr);
      paceChart.push({
        date: dateStr,
        pace: paceData
          ? calculatePaceSeconds(paceData.totalDist, paceData.totalDur)
          : null,
      });
    }

    return jsonResponse({ records, stats, distanceChart, paceChart });
  } catch (error) {
    console.error("GET /api/running:", error);
    return errorResponse("러닝 기록을 불러오지 못했습니다", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { splits, ...rest } = body;
    const parsed = runningRecordSchema.safeParse(rest);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "유효하지 않은 입력입니다");
    }

    const avgPaceSeconds = calculatePaceSeconds(
      parsed.data.distance,
      parsed.data.durationSeconds,
    );

    const record = await prisma.runningRecord.create({
      data: {
        ...parsed.data,
        avgPaceSeconds,
        splits: splits?.length
          ? {
              create: splits.map(
                (s: { splitNumber: number; distance: number; durationSeconds: number }) => ({
                  ...s,
                  paceSeconds: calculatePaceSeconds(s.distance, s.durationSeconds),
                }),
              ),
            }
          : undefined,
      },
      include: { splits: { orderBy: { splitNumber: "asc" } } },
    });

    return jsonResponse(record, 201);
  } catch (error) {
    console.error("POST /api/running:", error);
    return errorResponse("러닝 기록을 저장하지 못했습니다", 500);
  }
}
