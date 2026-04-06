interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

export default function MetricCard({ label, value, sub, accent = '#7F77DD' }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-2xl font-bold" style={{ color: accent }}>
        {value}
      </div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}
