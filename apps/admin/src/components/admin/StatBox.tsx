export function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 px-3 py-3 text-center dark:bg-slate-800">
      <div className="mb-1">{icon}</div>
      <div className="text-base font-bold text-slate-900 dark:text-slate-100">{value}</div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
