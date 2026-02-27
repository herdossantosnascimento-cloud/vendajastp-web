"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  label?: string;
};

type PreviewItem = { id: string; url: string };

function makeId(file: File) {
  return `${file.name}_${file.size}_${file.lastModified}_${Math.random()
    .toString(16)
    .slice(2)}`;
}

export default function ImageUploader({
  value,
  onChange,
  maxFiles = 10,
  label = "Fotos",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const previews = useMemo(() => {
    return value.map((file) => ({
      id: makeId(file),
      url: URL.createObjectURL(file),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  function addFiles(files: FileList | null) {
    if (!files) return;

    const incoming = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );

    if (!incoming.length) return;

    const next = [...value, ...incoming].slice(0, maxFiles);
    onChange(next);

    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(index: number) {
    const next = value.slice();
    next.splice(index, 1);
    onChange(next);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= value.length) return;

    const next = value.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);

    onChange(next);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-gray-900">{label}</div>
          <div className="text-xs text-gray-500">
            {value.length}/{maxFiles} — primeira imagem vira “capa”
          </div>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
        >
          Adicionar fotos
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      <div
        className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
      >
        {value.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-600">
            Solta imagens aqui ou clica em <b>Adicionar fotos</b>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {previews.map((p, index) => (
              <div
                key={p.id}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragEnd={() => setDragIndex(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex === null) return;
                  move(dragIndex, index);
                  setDragIndex(null);
                }}
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    src={p.url}
                    alt="preview"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/60 to-black/0 p-2">
                  <div className="text-xs font-semibold text-white">
                    {index === 0 ? "Capa" : `#${index + 1}`}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, index - 1)}
                      className="rounded-lg bg-white/15 px-2 py-1 text-xs font-semibold text-white hover:bg-white/25"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      onClick={() => move(index, index + 1)}
                      className="rounded-lg bg-white/15 px-2 py-1 text-xs font-semibold text-white hover:bg-white/25"
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      onClick={() => removeAt(index)}
                      className="rounded-lg bg-red-500/80 px-2 py-1 text-xs font-semibold text-white hover:bg-red-500"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}