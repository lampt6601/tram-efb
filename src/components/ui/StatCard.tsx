import { type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  className = "",
}: StatCardProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
