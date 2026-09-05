import { PrismaClient } from "@prisma/client";
import { calculatePaceSeconds } from "../src/lib/calculations/running";
import { parseDurationToSeconds } from "../src/lib/utils";

const EXCEL_PATH = "c:\\Users\\yoon\\Downloads\\러닝_기록_시트.xlsx";

const TYPE_MAP: Record<string, string> = {
  easy: "easy",
  recovery: "recovery",
  lsd: "lsd",
  tempo: "tempo",
};

interface DailyRow {
  date: string;
  type: string;
  distance: number;
  duration: string;
  avgHr: number | null;
  maxHr: number | null;
  cadence: number | null;
  memo: string | null;
}

interface SplitRow {
  date: string;
  splitNumber: number;
  pace: string;
}

function parsePaceToSeconds(pace: string): number | null {
  return parseDurationToSeconds(pace);
}

async function loadExcelData(): Promise<{ runs: DailyRow[]; splits: SplitRow[] }> {
  const { execFileSync } = await import("node:child_process");
  const script = `
import pandas as pd, json, sys
xlsx = sys.argv[1]
type_map = {'이지런': 'easy', '회복주': 'recovery', 'LSD': 'lsd', '지속주': 'tempo'}
daily = pd.read_excel(xlsx, sheet_name='Daily_Log')
splits = pd.read_excel(xlsx, sheet_name=1)
runs = daily[daily.iloc[:,2].notna()].copy()
runs.columns = ['date','type','distance','duration','avg_pace','avg_hr','max_hr','cadence','memo']
runs['date'] = runs['date'].dt.strftime('%Y-%m-%d')
runs['type'] = runs['type'].map(type_map)
runs = runs.where(pd.notnull(runs), None)
splits.columns = ['date','split_number','pace','hr','cadence','memo']
splits['date'] = splits['date'].dt.strftime('%Y-%m-%d')
splits = splits.where(pd.notnull(splits), None)
def clean(records):
    out = []
    for r in records:
        row = {}
        for k, v in r.items():
            if v is None or (isinstance(v, float) and pd.isna(v)):
                row[k] = None
            else:
                row[k] = v
        out.append(row)
    return out
print(json.dumps({'runs': clean(runs.to_dict(orient='records')), 'splits': clean(splits.to_dict(orient='records'))}, ensure_ascii=False))
`;
  const output = execFileSync("python", ["-c", script, EXCEL_PATH], {
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024,
    env: { ...process.env, PYTHONIOENCODING: "utf-8" },
  });
  const data = JSON.parse(output) as {
    runs: Array<Record<string, unknown>>;
    splits: Array<Record<string, unknown>>;
  };

  const runs: DailyRow[] = data.runs.map((r) => ({
    date: String(r.date),
    type: String(r.type),
    distance: Number(r.distance),
    duration: String(r.duration),
    avgHr: r.avg_hr != null ? Number(r.avg_hr) : null,
    maxHr: r.max_hr != null ? Number(r.max_hr) : null,
    cadence: r.cadence != null ? Number(r.cadence) : null,
    memo: r.memo != null ? String(r.memo) : null,
  }));

  const splits: SplitRow[] = data.splits.map((s) => ({
    date: String(s.date),
    splitNumber: Number(s.split_number),
    pace: String(s.pace),
  }));

  return { runs, splits };
}

function buildSplits(
  date: string,
  totalDistance: number,
  splitRows: SplitRow[],
): { splitNumber: number; distance: number; durationSeconds: number; paceSeconds: number | null }[] {
  if (splitRows.length === 0) return [];

  const fullKm = Math.floor(totalDistance);
  const remainder = Math.round((totalDistance - fullKm) * 100) / 100;

  return splitRows.map((s) => {
    const isLast = s.splitNumber === splitRows.length;
    const distance = isLast && remainder > 0 ? remainder : 1;
    const paceSeconds = parsePaceToSeconds(s.pace);
    const durationSeconds = paceSeconds ? Math.round(paceSeconds * distance) : 0;

    return {
      splitNumber: s.splitNumber,
      distance,
      durationSeconds,
      paceSeconds,
    };
  });
}

async function main() {
  const prisma = new PrismaClient();
  const { runs, splits } = await loadExcelData();

  const splitsByDate = new Map<string, SplitRow[]>();
  for (const s of splits) {
    const list = splitsByDate.get(s.date) ?? [];
    list.push(s);
    splitsByDate.set(s.date, list);
  }
  for (const list of splitsByDate.values()) {
    list.sort((a, b) => a.splitNumber - b.splitNumber);
  }

  const existing = await prisma.runningRecord.findMany({ select: { date: true, distance: true, type: true } });
  const existingKeys = new Set(existing.map((r) => `${r.date}|${r.type}|${r.distance}`));

  let imported = 0;
  let skipped = 0;

  for (const run of runs) {
    const type = run.type;
    if (!type || !TYPE_MAP[type]) {
      console.warn(`⚠️  Unknown type "${run.type}" on ${run.date}, skipping`);
      skipped++;
      continue;
    }

    const key = `${run.date}|${type}|${run.distance}`;
    if (existingKeys.has(key)) {
      console.log(`⏭️  Already exists: ${run.date} ${run.type} ${run.distance}km`);
      skipped++;
      continue;
    }

    const durationSeconds = parseDurationToSeconds(run.duration);
    if (!durationSeconds) {
      console.warn(`⚠️  Invalid duration "${run.duration}" on ${run.date}, skipping`);
      skipped++;
      continue;
    }

    const avgPaceSeconds = calculatePaceSeconds(run.distance, durationSeconds);
    const dateSplits = splitsByDate.get(run.date) ?? [];
    const splitData = buildSplits(run.date, run.distance, dateSplits);

    await prisma.runningRecord.create({
      data: {
        date: run.date,
        type,
        distance: run.distance,
        durationSeconds,
        avgPaceSeconds,
        avgHeartRate: run.avgHr,
        maxHeartRate: run.maxHr,
        cadence: run.cadence,
        memo: run.memo,
        splits:
          splitData.length > 0
            ? {
                create: splitData.map((s) => ({
                  splitNumber: s.splitNumber,
                  distance: s.distance,
                  durationSeconds: s.durationSeconds,
                  paceSeconds: s.paceSeconds,
                })),
              }
            : undefined,
      },
    });

    console.log(`✅ ${run.date} ${run.type} ${run.distance}km (${splitData.length} splits)`);
    imported++;
  }

  console.log(`\n🎉 Done: ${imported} imported, ${skipped} skipped`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Import failed:", e);
  process.exit(1);
});
