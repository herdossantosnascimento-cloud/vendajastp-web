"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export default function HomePage() {
  return (
    <div style={{ padding: 40 }}>
      <h1>VendaJá</h1>
      <p>Escolhe uma categoria:</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id} // ✅ CORRETO (antes era key={cat})
            href={`/category/${cat.id}`}
            style={{
              padding: 20,
              border: "1px solid #ddd",
              borderRadius: 12,
              textDecoration: "none",
              color: "black",
              background: "white",
              display: "block",
            }}
          >
            {cat.label}
          </Link>
        ))}
      </div>
    </div>
  );
}