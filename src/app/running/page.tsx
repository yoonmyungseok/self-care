"use client";

import { useCallback, useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/ui/StatCard";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { LoadingSpinner, EmptyState } from "@/components/ui/Loading";
import { RunningDistanceChart } from "@/components/charts/Charts";
import { useToast } from "@/components/ui/Toast";
import { formatPace, calculatePaceSeconds, formatDistanceChange } from "@/lib/calculations/running";
import { formatDisplayDate, formatDuration, parseDurationToSeconds, todayString } from "@/lib/utils";
import { RUNNING_TYPES, getRunningTypeLabel } from "@/lib/constants";

interface RunningSplit {
  id?: number;
  splitNumber: number;
  distance: number;
  durationSeconds: number;
  paceSeconds?: number | null;
}

interface RunningRecord {
  id: number;
  date: string;
  type: string;
  distance: number;
  durationSeconds: number;
  avgPaceSeconds: number | null;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  cadence: number | null;
  memo: string | null;
  splits: RunningSplit[];
}

interface RunningStats {
  weekDistance: number;
  monthDistance: number;
  last7DaysDistance: number;
  last30DaysDistance: number;
  weekCount: number;
  monthCount: number;
  recent30AveragePace: number | null;
  longestRun: { distance: number; date: string } | null;
  lastWeekDistance: number;
  weekOverWeekChange: number;
}

const emptyForm = {
  date: todayString(),
  type: "easy",
  distance: "",
  duration: "",
  avgHeartRate: "",
  maxHeartRate: "",
  cadence: "",
  memo: "",
};

const emptySplit = { splitNumber: 1, distance: "", duration: "" };

export default function RunningPage() {
  const { showToast } = useToast();
  const [records, setRecords] = useState<RunningRecord[]>([]);
  const [stats, setStats] = useState<RunningStats | null>(null);
  const [distanceChart, setDistanceChart] = useState<{ date: string; distance: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [splits, setSplits] = useState<typeof emptySplit[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/running?days=30");
    const data = await res.json();
    setRecords(data.records);
    setStats(data.stats);
    setDistanceChart(data.distanceChart);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const computedPace = () => {
    const dist = parseFloat(form.distance);
    const dur = parseDurationToSeconds(form.duration);
    if (!dist || !dur) return null;
    return calculatePaceSeconds(dist, dur);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSplits([]);
    setModalOpen(true);
  };

  const openEdit = (record: RunningRecord) => {
    setEditingId(record.id);
    setForm({
      date: record.date,
      type: record.type,
      distance: record.distance.toString(),
      duration: formatDuration(record.durationSeconds),
      avgHeartRate: record.avgHeartRate?.toString() ?? "",
      maxHeartRate: record.maxHeartRate?.toString() ?? "",
      cadence: record.cadence?.toString() ?? "",
      memo: record.memo ?? "",
    });
    setSplits(
      record.splits.map((s) => ({
        splitNumber: s.splitNumber,
        distance: s.distance.toString(),
        duration: formatDuration(s.durationSeconds),
      })),
    );
    setModalOpen(true);
  };

  const handleSave = async () => {
    const durationSeconds = parseDurationToSeconds(form.duration);
    if (!durationSeconds) {
      showToast("올바른 운동 시간을 입력해주세요 (MM:SS 또는 HH:MM:SS)", "error");
      return;
    }

    setSaving(true);
    const payload = {
      date: form.date,
      type: form.type,
      distance: parseFloat(form.distance),
      durationSeconds,
      avgHeartRate: form.avgHeartRate ? parseInt(form.avgHeartRate, 10) : null,
      maxHeartRate: form.maxHeartRate ? parseInt(form.maxHeartRate, 10) : null,
      cadence: form.cadence ? parseInt(form.cadence, 10) : null,
      memo: form.memo || null,
      splits: splits
        .filter((s) => s.distance && s.duration)
        .map((s) => {
          const dur = parseDurationToSeconds(s.duration);
          return {
            splitNumber: s.splitNumber,
            distance: parseFloat(s.distance),
            durationSeconds: dur!,
          };
        }),
    };

    const url = editingId ? `/api/running/${editingId}` : "/api/running";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      showToast(data.error ?? "저장에 실패했습니다", "error");
      return;
    }

    showToast(editingId ? "수정되었습니다" : "저장되었습니다");
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    const res = await fetch(`/api/running/${deleteId}`, { method: "DELETE" });
    setSaving(false);
    if (!res.ok) {
      showToast("삭제에 실패했습니다", "error");
      return;
    }
    showToast("삭제되었습니다");
    setConfirmOpen(false);
    setDeleteId(null);
    fetchData();
  };

  const addSplit = () => {
    setSplits([...splits, { ...emptySplit, splitNumber: splits.length + 1 }]);
  };

  const updateSplit = (index: number, field: string, value: string) => {
    const updated = [...splits];
    updated[index] = { ...updated[index], [field]: value };
    setSplits(updated);
  };

  const removeSplit = (index: number) => {
    setSplits(splits.filter((_, i) => i !== index).map((s, i) => ({ ...s, splitNumber: i + 1 })));
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">러닝 기록</h1>
          <p className="text-sm text-slate-500">러닝 활동을 기록하고 분석하세요</p>
        </div>
        <Button onClick={openCreate}>+ 기록 추가</Button>
      </div>

      {stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="이번 주" value={`${stats.weekDistance.toFixed(1)} km`} />
          <StatCard label="이번 달" value={`${stats.monthDistance.toFixed(1)} km`} />
          <StatCard
            label="이번 주 횟수"
            value={`${stats.weekCount}회`}
            subValue={`이번 달 ${stats.monthCount}회`}
          />
          <StatCard
            label="최근 30일 페이스"
            value={formatPace(stats.recent30AveragePace)}
          />
          <StatCard
            label="최장 거리 (PR)"
            value={stats.longestRun ? `${stats.longestRun.distance.toFixed(1)} km` : "-"}
            subValue={stats.longestRun ? formatDisplayDate(stats.longestRun.date) : undefined}
          />
          <StatCard
            label="지난주 대비"
            value={formatDistanceChange(stats.weekOverWeekChange)}
            subValue={`이번 주 ${stats.weekDistance.toFixed(1)}km · 지난주 ${stats.lastWeekDistance.toFixed(1)}km`}
          />
        </div>
      )}

      <Card title="러닝 거리 그래프 (최근 30일)" className="mb-6">
        <RunningDistanceChart data={distanceChart} />
      </Card>

      <Card title="기록 목록">
        {records.length === 0 ? (
          <EmptyState message="아직 러닝 기록이 없습니다." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-2 pr-4">날짜</th>
                  <th className="pb-2 pr-4">종류</th>
                  <th className="pb-2 pr-4">거리</th>
                  <th className="pb-2 pr-4">시간</th>
                  <th className="pb-2 pr-4">페이스</th>
                  <th className="pb-2">작업</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4">{formatDisplayDate(r.date)}</td>
                    <td className="py-3 pr-4">{getRunningTypeLabel(r.type)}</td>
                    <td className="py-3 pr-4 font-medium">{r.distance.toFixed(1)} km</td>
                    <td className="py-3 pr-4">{formatDuration(r.durationSeconds)}</td>
                    <td className="py-3 pr-4">{formatPace(r.avgPaceSeconds)}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                          수정
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeleteId(r.id);
                            setConfirmOpen(true);
                          }}
                        >
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "러닝 기록 수정" : "러닝 기록 추가"}
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="날짜"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <Select
            label="러닝 종류"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={[...RUNNING_TYPES]}
          />
          <Input
            label="거리 (km)"
            type="number"
            step="0.1"
            value={form.distance}
            onChange={(e) => setForm({ ...form, distance: e.target.value })}
          />
          <Input
            label="운동 시간 (MM:SS 또는 HH:MM:SS)"
            placeholder="00:55:00"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />
          <div className="sm:col-span-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
            평균 페이스: <strong>{formatPace(computedPace())}</strong>
          </div>
          <Input
            label="평균 심박수"
            type="number"
            value={form.avgHeartRate}
            onChange={(e) => setForm({ ...form, avgHeartRate: e.target.value })}
          />
          <Input
            label="최대 심박수"
            type="number"
            value={form.maxHeartRate}
            onChange={(e) => setForm({ ...form, maxHeartRate: e.target.value })}
          />
          <Input
            label="케이던스"
            type="number"
            value={form.cadence}
            onChange={(e) => setForm({ ...form, cadence: e.target.value })}
          />
          <Input
            label="메모"
            value={form.memo}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
          />
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">구간별 기록</h3>
            <Button variant="secondary" size="sm" onClick={addSplit}>
              + 구간 추가
            </Button>
          </div>
          {splits.map((split, index) => (
            <div key={index} className="mb-2 grid grid-cols-4 gap-2">
              <Input
                label={`구간 ${split.splitNumber}`}
                type="number"
                step="0.1"
                placeholder="거리(km)"
                value={split.distance}
                onChange={(e) => updateSplit(index, "distance", e.target.value)}
              />
              <Input
                label="시간"
                placeholder="MM:SS"
                value={split.duration}
                onChange={(e) => updateSplit(index, "duration", e.target.value)}
              />
              <div className="flex items-end pb-2 text-sm text-slate-500">
                {(() => {
                  const d = parseFloat(split.distance);
                  const dur = parseDurationToSeconds(split.duration);
                  return dur && d ? formatPace(calculatePaceSeconds(d, dur)) : "-";
                })()}
              </div>
              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={() => removeSplit(index)}>
                  삭제
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={saving || !form.distance || !form.duration}>
            {saving ? "저장 중..." : "저장"}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="기록 삭제"
        message="이 러닝 기록을 삭제하시겠습니까?"
        loading={saving}
      />
    </AppLayout>
  );
}
