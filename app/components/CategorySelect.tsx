"use client";

import type { Category } from "@/lib/categories";

type Props = {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  categories: Category[];
  placeholder?: string;
  disabled?: boolean;
};

export default function CategorySelect({
  label = "Categoria",
  value,
  onChange,
  categories,
  placeholder = "Selecionar",
  disabled,
}: Props) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">{label}</label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 pr-9 text-sm shadow-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50"
        >
          <option value="">{placeholder}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}