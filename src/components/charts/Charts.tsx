"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

interface WeightChartProps {
  data: { date: string; weight: number }[];
}

export function WeightChart({ data }: WeightChartProps) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">표시할 데이터가 없습니다</p>;
  }

  const chartData = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "M/d"),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <Tooltip
          formatter={(value) => [`${Number(value).toFixed(1)} kg`, "체중"]}
          labelFormatter={(label) => label}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 3, fill: "#2563eb" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface RunningDistanceChartProps {
  data: { date: string; distance: number }[];
}

export function RunningDistanceChart({ data }: RunningDistanceChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "M/d"),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <Tooltip
          formatter={(value) => [`${Number(value).toFixed(1)} km`, "거리"]}
        />
        <Bar dataKey="distance" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
