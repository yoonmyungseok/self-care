export const RUNNING_TYPES = [
  { value: "easy", label: "이지런" },
  { value: "recovery", label: "회복주" },
  { value: "lsd", label: "LSD" },
  { value: "rest", label: "휴식" },
  { value: "tempo", label: "지속주" },
] as const;

export const MEAL_TYPES = [
  { value: "breakfast", label: "아침" },
  { value: "lunch", label: "점심" },
  { value: "dinner", label: "저녁" },
  { value: "snack", label: "간식" },
] as const;

export const CONDITION_OPTIONS = [
  { value: "great", label: "매우 좋음" },
  { value: "good", label: "좋음" },
  { value: "normal", label: "보통" },
  { value: "bad", label: "나쁨" },
  { value: "terrible", label: "매우 나쁨" },
] as const;

export const BOWEL_OPTIONS = [
  { value: "normal", label: "정상" },
  { value: "constipation", label: "변비" },
  { value: "diarrhea", label: "설사" },
  { value: "none", label: "없음" },
] as const;

export const GENDER_OPTIONS = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
] as const;

export const ACTIVITY_LEVEL_OPTIONS = [
  { value: "sedentary", label: "거의 운동 안 함" },
  { value: "light", label: "가벼운 활동 (주 1-3회)" },
  { value: "moderate", label: "보통 활동 (주 3-5회)" },
  { value: "active", label: "활발한 활동 (주 6-7회)" },
  { value: "very_active", label: "매우 활발 (하루 2회 이상)" },
] as const;

export function getRunningTypeLabel(value: string): string {
  return RUNNING_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function getMealTypeLabel(value: string): string {
  return MEAL_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function getConditionLabel(value: string | null | undefined): string {
  if (!value) return "-";
  return CONDITION_OPTIONS.find((c) => c.value === value)?.label ?? value;
}

export function getBowelLabel(value: string | null | undefined): string {
  if (!value) return "-";
  return BOWEL_OPTIONS.find((b) => b.value === value)?.label ?? value;
}
