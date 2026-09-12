"use client";

import { useCallback, useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { LoadingSpinner, EmptyState } from "@/components/ui/Loading";
import { useToast } from "@/components/ui/Toast";

interface RunningType {
  id: number;
  value: string;
  label: string;
  excludeFromStats: boolean;
  sortOrder: number;
}

const emptyForm = {
  value: "",
  label: "",
  excludeFromStats: false,
  sortOrder: "0",
};

export default function RunningSettingsPage() {
  const { showToast } = useToast();
  const [runningTypes, setRunningTypes] = useState<RunningType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadRunningTypes = useCallback(async () => {
    const res = await fetch("/api/running/types");
    const data: RunningType[] = await res.json();
    setRunningTypes(data);
  }, []);

  useEffect(() => {
    loadRunningTypes().finally(() => setLoading(false));
  }, [loadRunningTypes]);

  const openAdd = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      sortOrder: runningTypes.length.toString(),
    });
    setModalOpen(true);
  };

  const openEdit = (item: RunningType) => {
    setEditingId(item.id);
    setForm({
      value: item.value,
      label: item.label,
      excludeFromStats: item.excludeFromStats,
      sortOrder: item.sortOrder.toString(),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      value: form.value.trim(),
      label: form.label.trim(),
      excludeFromStats: form.excludeFromStats,
      sortOrder: parseInt(form.sortOrder, 10) || 0,
    };

    const url = editingId ? `/api/running/types/${editingId}` : "/api/running/types";
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

    setModalOpen(false);
    await loadRunningTypes();
    showToast(editingId ? "러닝 종류가 수정되었습니다" : "러닝 종류가 추가되었습니다");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);

    const res = await fetch(`/api/running/types/${deleteId}`, { method: "DELETE" });
    const data = await res.json();

    setSaving(false);
    setConfirmOpen(false);
    setDeleteId(null);

    if (!res.ok) {
      showToast(data.error ?? "삭제에 실패했습니다", "error");
      return;
    }

    await loadRunningTypes();
    showToast("러닝 종류가 삭제되었습니다");
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
          <h1 className="text-2xl font-bold text-slate-900">러닝 종류 설정</h1>
          <p className="text-sm text-slate-500">러닝 기록에 사용할 종류를 관리하세요</p>
        </div>
        <Button onClick={openAdd}>종류 추가</Button>
      </div>

      <Card>
        {runningTypes.length === 0 ? (
          <EmptyState message="등록된 러닝 종류가 없습니다" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-2 pr-4">표시 이름</th>
                  <th className="pb-2 pr-4">식별값</th>
                  <th className="pb-2 pr-4">통계 제외</th>
                  <th className="pb-2 pr-4">순서</th>
                  <th className="pb-2">작업</th>
                </tr>
              </thead>
              <tbody>
                {runningTypes.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium">{item.label}</td>
                    <td className="py-3 pr-4 font-mono text-slate-600">{item.value}</td>
                    <td className="py-3 pr-4">{item.excludeFromStats ? "예" : "아니오"}</td>
                    <td className="py-3 pr-4">{item.sortOrder}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                          수정
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeleteId(item.id);
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
        title={editingId ? "러닝 종류 수정" : "러닝 종류 추가"}
      >
        <div className="grid gap-4">
          <Input
            label="표시 이름 (예: 이지런, LSD)"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            required
          />
          <Input
            label="식별값 (예: easy, lsd)"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value.toLowerCase() })}
            placeholder="영문 소문자, 숫자, 밑줄"
            required
          />
          <Input
            label="정렬 순서"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            required
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.excludeFromStats}
              onChange={(e) => setForm({ ...form, excludeFromStats: e.target.checked })}
              className="rounded border-slate-300"
            />
            통계에서 제외 (휴식일 등)
          </label>
          {form.excludeFromStats && (
            <p className="text-sm text-slate-500">
              통계 제외 종류는 거리·페이스 통계에 포함되지 않으며, 날짜와 메모만 기록합니다.
            </p>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !form.label.trim() || !form.value.trim()}
          >
            {saving ? "저장 중..." : "저장"}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="러닝 종류 삭제"
        message="이 러닝 종류를 삭제하시겠습니까? 사용 중인 기록이 있으면 삭제할 수 없습니다."
        loading={saving}
      />
    </AppLayout>
  );
}
