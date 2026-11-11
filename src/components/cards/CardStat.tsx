import React from "react";

interface CardStatProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

export default function CardStat({ icon, label, value, color }: CardStatProps) {
  return (
    <div className="flex-1 min-w-[200px] rounded-2xl bg-white border border-gray-200 dark:bg-[#101726] dark:border-white/10 p-5 flex items-center gap-4 shadow-sm transition-colors">
      <div
        className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value.toLocaleString("id-ID")}
        </p>
      </div>
    </div>
  );
}
