"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LoadingSpinner } from "@/components/ui/Loading";
import { useToast } from "@/components/ui/Toast";
import { ACTIVITY_LEVEL_OPTIONS, GENDER_OPTIONS } from "@/lib/constants";

interface Settings {
  id: number;
  targetWeight: number;
  birthYear: number;
  gender: string;
  heightCm: number;
  activityLevel: string;
  targetCalories: number;
  targetCarbs: number;
  targetProtein: number;
  targetFat: number;
}

export default function SettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [form, setForm] = useState({
    targetWeight: "",
    birthYear: "",
    gender: "male",
    heightCm: "",
    activityLevel: "moderate",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data: Settings) => {
        setSettings(data);
        setForm({
          targetWeight: data.targetWeight.toString(),
          birthYear: data.birthYear.toString(),
          gender: data.gender,
          heightCm: data.heightCm.toString(),
          activityLevel: data.activityLevel,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      targetWeight: parseFloat(form.targetWeight),
      birthYear: parseInt(form.birthYear, 10),
      gender: form.gender,
      heightCm: parseFloat(form.heightCm),
      activityLevel: form.activityLevel,
    };

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      showToast(data.error ?? "저장에 실패했습니다", "error");
      return;
    }

    setSettings(data);
    showToast("설정이 저장되었습니다");
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingSpinner />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">설정</h1>
        <p className="text-sm text-slate-500">목표 체중과 프로필을 설정하세요</p>
      </div>

      <div className="max-w-lg space-y-6">
        <Card title="체중 목표">
          <Input
            label="목표 체중 (kg)"
            type="number"
            step="0.1"
            value={form.targetWeight}
            onChange={(e) => setForm({ ...form, targetWeight: e.target.value })}
          />
        </Card>

        <Card title="프로필">
          <p className="mb-4 text-sm text-slate-500">
            프로필 정보를 기반으로 영양 목표가 자동 계산됩니다
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="출생년도"
              type="number"
              value={form.birthYear}
              onChange={(e) => setForm({ ...form, birthYear: e.target.value })}
            />
            <Select
              label="성별"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              options={GENDER_OPTIONS}
            />
            <Input
              label="키 (cm)"
              type="number"
              step="0.1"
              value={form.heightCm}
              onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
            />
            <Select
              label="활동 수준"
              value={form.activityLevel}
              onChange={(e) => setForm({ ...form, activityLevel: e.target.value })}
              options={ACTIVITY_LEVEL_OPTIONS}
            />
          </div>
        </Card>

        <Card title="영양 목표 (하루) — 자동 계산">
          <p className="mb-4 text-sm text-slate-500">
            최신 체중 기록과 프로필을 기반으로 Mifflin-St Jeor 공식으로 계산됩니다
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">목표 칼로리</p>
              <p className="text-lg font-semibold text-slate-900">
                {settings?.targetCalories.toLocaleString()} kcal
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">목표 탄수화물</p>
              <p className="text-lg font-semibold text-slate-900">
                {settings?.targetCarbs.toLocaleString()} g
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">목표 단백질</p>
              <p className="text-lg font-semibold text-slate-900">
                {settings?.targetProtein.toLocaleString()} g
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">목표 지방</p>
              <p className="text-lg font-semibold text-slate-900">
                {settings?.targetFat.toLocaleString()} g
              </p>
            </div>
          </div>
        </Card>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "저장 중..." : "설정 저장"}
        </Button>
      </div>
    </AppLayout>
  );
}
