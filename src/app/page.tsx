"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LoadingSpinner } from "@/components/ui/Loading";
import { WeightChart, RunningDistanceChart } from "@/components/charts/Charts";
import { formatWeightChange, getWeightChangeClassName, getWeightChangeTrend } from "@/lib/calculations/weight";
import { formatPace } from "@/lib/calculations/running";
import { formatDisplayDate } from "@/lib/utils";
import { getRunningTypeLabel, getMealTypeLabel } from "@/lib/constants";

interface DashboardData {
  weight: {
    current: number | null;
    changeFromPrevious: number | null;
    change7Days: number | null;
    change30Days: number | null;
    targetWeight: number;
    remainingToTarget: number | null;
  };
  running: {
    weekDistance: number;
    monthDistance: number;
    recentAveragePace: number | null;
    chartData: { date: string; distance: number }[];
    recentRecords: {
      id: number;
      date: string;
      type: string;
      distance: number;
      avgPaceSeconds: number | null;
    }[];
  };
  targets: {
    targetCalories: number;
    targetCarbs: number;
    targetProtein: number;
    targetFat: number;
  };
  diet: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    remainingCalories: number;
    calorieProgress: number;
    carbsProgress: number;
    proteinProgress: number;
    fatProgress: number;
  };
  weightChartData: { date: string; weight: number }[];
  recentWeightRecords: {
    id: number;
    date: string;
    weight: number;
    changeFromPrevious: number | null;
  }[];
  todayMeals: {
    id: number;
    mealType: string;
    foodEntries: { id: number; foodName: string; calories: number }[];
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <LoadingSpinner />
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <p className="text-center text-slate-500">데이터를 불러올 수 없습니다</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">오늘의 건강 상태를 한눈에 확인하세요</p>
      </div>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          오늘의 요약
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="현재 체중"
            value={data.weight.current != null ? `${data.weight.current.toFixed(1)} kg` : "-"}
            subValue={
              data.weight.changeFromPrevious != null
                ? `전일 ${formatWeightChange(data.weight.changeFromPrevious)}`
                : formatWeightChange(data.weight.change7Days) + " (7일)"
            }
            trend={
              data.weight.changeFromPrevious != null
                ? getWeightChangeTrend(data.weight.changeFromPrevious)
                : data.weight.change7Days != null
                  ? data.weight.change7Days > 0
                    ? "up"
                    : data.weight.change7Days < 0
                      ? "down"
                      : "neutral"
                  : undefined
            }
            valueTrend={getWeightChangeTrend(data.weight.changeFromPrevious)}
          />
          <StatCard
            label="목표 체중"
            value={`${data.weight.targetWeight.toFixed(1)} kg`}
            subValue={
              data.weight.remainingToTarget != null
                ? `${data.weight.remainingToTarget > 0 ? "+" : ""}${data.weight.remainingToTarget.toFixed(1)} kg`
                : "-"
            }
          />
          <StatCard
            label="오늘 칼로리"
            value={`${data.diet.calories.toFixed(0)} kcal`}
            subValue={`남은 ${data.diet.remainingCalories.toFixed(0)} kcal`}
          />
          <StatCard
            label="목표 칼로리"
            value={`${data.targets.targetCalories.toFixed(0)} kcal`}
            subValue={`${data.diet.calorieProgress.toFixed(0)}% 달성`}
          />
          <StatCard
            label="이번 주 러닝"
            value={`${data.running.weekDistance.toFixed(1)} km`}
            subValue={`이번 달 ${data.running.monthDistance.toFixed(1)} km`}
          />
        </div>
      </section>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card title="체중 변화 (최근 30일)">
          <WeightChart data={data.weightChartData} />
        </Card>
        <Card title="러닝 거리 (최근 30일)">
          <RunningDistanceChart data={data.running.chartData} />
        </Card>
      </div>

      <Card title="오늘의 영양소" className="mb-6">
        <div className="space-y-4">
          <ProgressBar
            label="칼로리"
            current={data.diet.calories}
            target={data.targets.targetCalories}
            unit=" kcal"
            color="bg-orange-500"
          />
          <ProgressBar
            label="탄수화물"
            current={data.diet.carbs}
            target={data.targets.targetCarbs}
            color="bg-amber-500"
          />
          <ProgressBar
            label="단백질"
            current={data.diet.protein}
            target={data.targets.targetProtein}
            color="bg-emerald-500"
          />
          <ProgressBar
            label="지방"
            current={data.diet.fat}
            target={data.targets.targetFat}
            color="bg-rose-500"
          />
        </div>
      </Card>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          최근 기록
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card title="최근 체중">
            {data.recentWeightRecords.length === 0 ? (
              <p className="text-sm text-slate-500">기록이 없습니다</p>
            ) : (
              <ul className="space-y-2">
                {data.recentWeightRecords.map((r) => (
                  <li key={r.id} className="flex justify-between text-sm">
                    <span className="text-slate-500">{formatDisplayDate(r.date)}</span>
                    <span
                      className={`rounded-md px-2 py-0.5 font-medium ${getWeightChangeClassName(r.changeFromPrevious)}`}
                    >
                      {r.weight.toFixed(1)} kg
                      {r.changeFromPrevious != null && (
                        <span className="ml-1.5 text-xs font-normal opacity-80">
                          {formatWeightChange(r.changeFromPrevious)}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="최근 러닝">
            {data.running.recentRecords.length === 0 ? (
              <p className="text-sm text-slate-500">기록이 없습니다</p>
            ) : (
              <ul className="space-y-2">
                {data.running.recentRecords.map((r) => (
                  <li key={r.id} className="flex justify-between text-sm">
                    <span>
                      <span className="text-slate-500">{formatDisplayDate(r.date)}</span>
                      <span className="ml-2 text-slate-400">{getRunningTypeLabel(r.type)}</span>
                    </span>
                    <span className="font-medium">
                      {r.distance.toFixed(1)} km · {formatPace(r.avgPaceSeconds)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="오늘 식단">
            {data.todayMeals.length === 0 ? (
              <p className="text-sm text-slate-500">오늘 기록된 식단이 없습니다</p>
            ) : (
              <ul className="space-y-3">
                {data.todayMeals.map((meal) => (
                  <li key={meal.id}>
                    <p className="text-xs font-semibold text-slate-500">
                      {getMealTypeLabel(meal.mealType)}
                    </p>
                    {meal.foodEntries.map((f) => (
                      <div key={f.id} className="flex justify-between text-sm">
                        <span>{f.foodName}</span>
                        <span className="text-slate-500">{f.calories.toFixed(0)} kcal</span>
                      </div>
                    ))}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </section>
    </AppLayout>
  );
}
