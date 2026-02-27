"use client";

import { useState } from "react";
import { CATEGORIES } from "../../lib/categories";

export default function Page() {
  const [categoryId, setCategoryId] = useState(CATEGORIES[0]?.id ?? "");

  return (
    <div style={{ padding: 40 }}>
      <h1>Publicar anúncio (teste)</h1>

      <label>Categoria</label>
      <br />

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        style={{ padding: 8, width: 320 }}
      >
        {CATEGORIES.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.label}
          </option>
        ))}
      </select>

      <p style={{ marginTop: 16 }}>
        Selecionado: <b>{categoryId}</b>
      </p>
    </div>
  );
}