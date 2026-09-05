import { z } from "zod";

export const weightRecordSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "올바른 날짜 형식이 아닙니다"),
  weight: z.number().positive("체중은 0보다 커야 합니다"),
  steps: z.number().int().nonnegative().optional().nullable(),
  water: z.number().nonnegative().optional().nullable(),
  sleep: z.number().nonnegative().optional().nullable(),
  condition: z.string().optional().nullable(),
  bowelMovement: z.string().optional().nullable(),
  memo: z.string().optional().nullable(),
});

export const runningRecordSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.string().min(1, "러닝 종류를 선택해주세요"),
  distance: z.number().positive("거리는 0보다 커야 합니다"),
  durationSeconds: z.number().int().positive("운동 시간은 0보다 커야 합니다"),
  avgHeartRate: z.number().int().nonnegative().optional().nullable(),
  maxHeartRate: z.number().int().nonnegative().optional().nullable(),
  cadence: z.number().int().nonnegative().optional().nullable(),
  memo: z.string().optional().nullable(),
});

export const runningSplitSchema = z.object({
  splitNumber: z.number().int().positive(),
  distance: z.number().positive("거리는 0보다 커야 합니다"),
  durationSeconds: z.number().int().positive("시간은 0보다 커야 합니다"),
  heartRate: z.number().int().nonnegative().optional().nullable(),
  cadence: z.number().int().nonnegative().optional().nullable(),
});

export const foodEntrySchema = z.object({
  mealId: z.number().int().positive().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  foodName: z.string().min(1, "음식명을 입력해주세요"),
  amount: z.number().positive("섭취량은 0보다 커야 합니다"),
  unit: z.string().min(1, "단위를 입력해주세요"),
  calories: z.number().nonnegative("칼로리는 0 이상이어야 합니다"),
  carbs: z.number().nonnegative("탄수화물은 0 이상이어야 합니다"),
  protein: z.number().nonnegative("단백질은 0 이상이어야 합니다"),
  fat: z.number().nonnegative("지방은 0 이상이어야 합니다"),
  sodium: z.number().nonnegative().optional().nullable(),
  memo: z.string().optional().nullable(),
});

export const foodItemSchema = z.object({
  name: z.string().min(1, "음식명을 입력해주세요"),
  standardAmount: z.string().min(1, "기준 양을 입력해주세요"),
  calories: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  sodium: z.number().nonnegative().optional().nullable(),
});

export const settingsSchema = z.object({
  targetWeight: z.number().positive("목표 체중은 0보다 커야 합니다"),
  birthYear: z
    .number()
    .int()
    .min(1900, "올바른 출생년도를 입력해주세요")
    .max(new Date().getFullYear(), "올바른 출생년도를 입력해주세요"),
  gender: z.enum(["male", "female"]),
  heightCm: z.number().positive("키는 0보다 커야 합니다"),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
});

export type WeightRecordInput = z.infer<typeof weightRecordSchema>;
export type RunningRecordInput = z.infer<typeof runningRecordSchema>;
export type RunningSplitInput = z.infer<typeof runningSplitSchema>;
export type FoodEntryInput = z.infer<typeof foodEntrySchema>;
export type FoodItemInput = z.infer<typeof foodItemSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
