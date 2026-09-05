import { describe, it, expect } from "vitest";
import {
  calculatePaceSeconds,
  formatPace,
  calculateAveragePace,
  sumDistance,
} from "@/lib/calculations/running";
import { calculateWeightStats, formatWeightChange } from "@/lib/calculations/weight";
import {
  sumNutrition,
  calculateNutritionSummary,
  calculateProgress,
} from "@/lib/calculations/diet";

describe("running calculations", () => {
  it("calculates pace from distance and duration", () => {
    const pace = calculatePaceSeconds(10, 55 * 60);
    expect(pace).toBeCloseTo(330, 0);
    expect(formatPace(pace)).toBe(`5'30"/km`);
  });

  it("returns null for zero distance", () => {
    expect(calculatePaceSeconds(0, 3600)).toBeNull();
  });

  it("returns null for zero duration", () => {
    expect(calculatePaceSeconds(10, 0)).toBeNull();
  });

  it("formats pace correctly", () => {
    expect(formatPace(330)).toBe(`5'30"/km`);
    expect(formatPace(null)).toBe("-");
    expect(formatPace(0)).toBe("-");
  });

  it("calculates average pace across records", () => {
    const records = [
      { distance: 10, durationSeconds: 3300 },
      { distance: 5, durationSeconds: 1500 },
    ];
    const avg = calculateAveragePace(records);
    expect(avg).toBeCloseTo(320, 0);
  });

  it("sums distance", () => {
    expect(sumDistance([{ distance: 5 }, { distance: 10 }])).toBe(15);
  });
});

describe("weight calculations", () => {
  const records = [
    { date: "2026-01-01", weight: 75.0 },
    { date: "2026-01-15", weight: 73.5 },
    { date: "2026-01-30", weight: 72.0 },
    { date: "2026-02-01", weight: 71.5 },
  ];

  it("calculates current weight and changes", () => {
    const stats = calculateWeightStats(records, 68.0, "2026-02-01");
    expect(stats.current).toBe(71.5);
    expect(stats.changeFromFirst).toBeCloseTo(-3.5, 1);
    expect(stats.remainingToTarget).toBeCloseTo(3.5, 1);
  });

  it("formats weight change with sign", () => {
    expect(formatWeightChange(-1.5)).toBe("-1.5 kg");
    expect(formatWeightChange(2.0)).toBe("+2.0 kg");
    expect(formatWeightChange(null)).toBe("-");
  });

  it("returns null stats for empty records", () => {
    const stats = calculateWeightStats([], 70);
    expect(stats.current).toBeNull();
  });
});

describe("diet calculations", () => {
  const entries = [
    { calories: 300, carbs: 40, protein: 20, fat: 10 },
    { calories: 500, carbs: 60, protein: 30, fat: 15 },
    { calories: 200, carbs: 25, protein: 10, fat: 8 },
  ];

  it("sums nutrition values", () => {
    const total = sumNutrition(entries);
    expect(total.calories).toBe(1000);
    expect(total.carbs).toBe(125);
    expect(total.protein).toBe(60);
    expect(total.fat).toBe(33);
  });

  it("calculates progress percentage", () => {
    expect(calculateProgress(500, 1000)).toBe(50);
    expect(calculateProgress(1200, 1000)).toBe(100);
    expect(calculateProgress(0, 0)).toBe(0);
  });

  it("calculates nutrition summary with targets", () => {
    const summary = calculateNutritionSummary(entries, {
      targetCalories: 2000,
      targetCarbs: 250,
      targetProtein: 120,
      targetFat: 65,
    });

    expect(summary.calories).toBe(1000);
    expect(summary.remainingCalories).toBe(1000);
    expect(summary.calorieProgress).toBe(50);
    expect(summary.carbsProgress).toBe(50);
    expect(summary.proteinProgress).toBe(50);
    expect(summary.fatProgress).toBeCloseTo(50.77, 1);
  });
});
