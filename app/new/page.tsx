"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useListings } from "../providers";

import { uploadPhotos } from "../lib/storage";
import { createListing } from "../lib/listings";

const CATEGORIES = [
  "Veículos",
  "Aluguer de Carros",
  "Imóveis",
  "Quartos & Arrendamento",
  "Moda & Beleza",
  "Serviços",
  "Guest House & Turismo",
  "Tecnologia",
  "Casa & Mobiliário",
  "Outros",
  "Procuro",
];

const MAX_PHOTOS = 3;

export default function NewListingPage() {
  const router = useRouter();
  const { user } = useListings();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      title.trim().length > 0 &&
      category.trim().length > 0 &&
      location.trim().length > 0 &&
      description.trim().length > 0 &&
      whatsapp.trim().length > 0 &&
      photos.length > 0 &&
      !submitting
    );
  }, [title, category, location, description, whatsapp, photos.length, submitting]);

  function onPickPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const next = [...photos, ...files].slice(0, MAX_PHOTOS);
    setPhotos(next);
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit() {
    try {
      setSubmitting(true);

      if (!user?.id) {
        alert("Precisas de entrar na tua conta primeiro.");
        setSubmitting(false);
        return;
      }

      // Upload para Firebase Storage
      const photoUrls = await uploadPhotos(photos, user.id);

      // Guardar no Firestore
      await createListing({
        title: title.trim(),
        price: price.trim(),
        category: category.trim(),
        location: location.trim(),
        description: description.trim(),
        whatsapp: whatsapp.trim(),
        photos: photoUrls,
        userId: user.id,
      });

      alert("Anúncio publicado com sucesso ✅");
      router.push("/listings");
    } catch (error) {
      console.error(error);
      alert("Erro ao publicar anúncio.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1>Publicar anúncio</h1>

      <div style={{ display: "grid", gap: 10 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
        />

        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Preço"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Localização"
        />

        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="WhatsApp"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição"
        />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onPickPhotos}
        />

        <div style={{ display: "flex", gap: 10 }}>
          {photos.map((file, i) => (
            <div key={i}>
              <img
                src={URL.createObjectURL(file)}
                alt=""
                width={80}
              />
              <button type="button" onClick={() => removePhoto(i)}>
                Remover
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          {submitting ? "A publicar..." : "Publicar anúncio"}
        </button>
      </div>
    </div>
  );
}