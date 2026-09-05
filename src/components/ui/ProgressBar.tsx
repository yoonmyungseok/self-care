interface ProgressBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
}

export function ProgressBar({
  label,
  current,
  target,
  unit = "g",
  color = "bg-blue-500",
}: ProgressBarProps) {
  const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">
          {current.toFixed(0)}{unit} / {target.toFixed(0)}{unit}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
