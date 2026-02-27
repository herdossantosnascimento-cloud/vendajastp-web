"use client";

import type { Category } from "@/lib/categories";

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  categories: Category[];
  placeholder?: string;
  disabled?: boolean;
};

export default function CategorySelect({
  label,
  value,
  onChange,
  categories,
  placeholder = "Selecionar…",
  disabled = false,
}: Props) {
  return (
    <label className="block">
      {label ? (
        <span className="text-sm font-semibold text-gray-800">
          {label}
        </span>
      ) : null}

      <select
        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>

        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
    </label>
  );
}