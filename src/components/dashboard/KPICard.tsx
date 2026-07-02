import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  description?: string;
}

export default function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  trendType = "neutral",
  description,
}: KPICardProps) {
  const trendColors = {
    up: "bg-emerald-550/10 text-emerald-600 border border-emerald-500/20",
    down: "bg-rose-550/10 text-rose-600 border border-rose-500/20",
    neutral: "bg-slate-100 text-slate-500 border border-slate-200",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 border border-slate-100">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div>
        <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight font-display mb-2">
          {value}
        </h3>
        
        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-bold ${trendColors[trendType]}`}>
              {trend}
            </span>
          )}
          {description && (
            <span className="text-slate-455 font-medium truncate">
              {description}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
