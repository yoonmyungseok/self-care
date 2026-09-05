"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/Loading";
import { useToast } from "@/components/ui/Toast";

interface Settings {
  id: number;
  targetWeight: number;
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
    targetCalories: "",
    targetCarbs: "",
    targetProtein: "",
    targetFat: "",
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
          targetCalories: data.targetCalories.toString(),
          targetCarbs: data.targetCarbs.toString(),
          targetProtein: data.targetProtein.toString(),
          targetFat: data.targetFat.toString(),
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      targetWeight: parseFloat(form.targetWeight),
      targetCalories: parseFloat(form.targetCalories),
      targetCarbs: parseFloat(form.targetCarbs),
      targetProtein: parseFloat(form.targetProtein),
      targetFat: parseFloat(form.targetFat),
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
        <p className="text-sm text-slate-500">목표 체중과 영양 목표를 설정하세요</p>
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

        <Card title="영양 목표 (하루)">
          <div className="space-y-4">
            <Input
              label="목표 칼로리 (kcal)"
              type="number"
              value={form.targetCalories}
              onChange={(e) => setForm({ ...form, targetCalories: e.target.value })}
            />
            <Input
              label="목표 탄수화물 (g)"
              type="number"
              value={form.targetCarbs}
              onChange={(e) => setForm({ ...form, targetCarbs: e.target.value })}
            />
            <Input
              label="목표 단백질 (g)"
              type="number"
              value={form.targetProtein}
              onChange={(e) => setForm({ ...form, targetProtein: e.target.value })}
            />
            <Input
              label="목표 지방 (g)"
              type="number"
              value={form.targetFat}
              onChange={(e) => setForm({ ...form, targetFat: e.target.value })}
            />
          </div>
        </Card>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "저장 중..." : "설정 저장"}
        </Button>
      </div>
    </AppLayout>
  );
}
