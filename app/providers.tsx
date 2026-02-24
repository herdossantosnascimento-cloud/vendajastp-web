"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Listing = {
  id: string;
  title: string;
  price: string;
  category: string;
  location: string;
  description: string;
  whatsapp: string;
  photos: string[];
  createdAt: number;
  userId: string; // ✅ novo
};

export type User = {
  id: string; // ✅ novo
  name: string;
  whatsapp: string;
};

type AppContextValue = {
  listings: Listing[];
  addListing: (l: Omit<Listing, "id" | "createdAt">) => string;

  user: User | null;
  login: (u: { name: string; whatsapp: string }) => void;
  logout: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const LISTINGS_KEY = "vendajastp:listings:v2";
const USER_KEY = "vendajastp:user:v1";

function makeUserId(name: string, whatsapp: string) {
  const base = (whatsapp || name || "user").trim().toLowerCase();
  return base.replace(/\s+/g, "").replace(/[^\w+]/g, "");
}

export function ListingsProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // load
  useEffect(() => {
    try {
      const rawListings = localStorage.getItem(LISTINGS_KEY);
      if (rawListings) setListings(JSON.parse(rawListings));
    } catch {}

    try {
      const rawUser = localStorage.getItem(USER_KEY);
      if (rawUser) setUser(JSON.parse(rawUser));
    } catch {}
  }, []);

  // save
  useEffect(() => {
    try {
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
    } catch {}
  }, [listings]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
    } catch {}
  }, [user]);

  const value = useMemo<AppContextValue>(() => {
    return {
      listings,
      addListing: (l) => {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const newItem: Listing = { ...l, id, createdAt: Date.now() };
        setListings((prev) => [newItem, ...prev]);
        return id;
      },

      user,
      login: (u) => {
        const id = makeUserId(u.name, u.whatsapp);
        setUser({ id, name: u.name, whatsapp: u.whatsapp });
      },
      logout: () => setUser(null),
    };
  }, [listings, user]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useListings() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useListings must be used inside ListingsProvider");
  return ctx;
}