"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserDoc = {
  plan: "free" | "pro";
  freeListingsUsed: number;
  whatsapp?: string;
  createdAt?: any;
};

type AuthContextValue = {
  user: User | null;
  userData: UserDoc | null;
  loading: boolean;

  // ✅ o que o teu /login precisa
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  // guardar unsubscribe do onSnapshot para trocar corretamente
  const unsubUserRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      // limpar listener anterior do userDoc
      if (unsubUserRef.current) {
        unsubUserRef.current();
        unsubUserRef.current = null;
      }

      if (!u) {
        setUserData(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      // garantir que o doc do user existe (merge: true)
      const userRef = doc(db, "users", u.uid);
      await setDoc(
        userRef,
        {
          plan: "free",
          freeListingsUsed: 0,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      // ✅ realtime para atualizar contador e plano automaticamente
      unsubUserRef.current = onSnapshot(userRef, (snap) => {
        if (!snap.exists()) {
          setUserData({ plan: "free", freeListingsUsed: 0 });
        } else {
          setUserData(snap.data() as UserDoc);
        }
        setLoading(false);
      });
    });

    return () => {
      if (unsubUserRef.current) unsubUserRef.current();
      unsubAuth();
    };
  }, []);

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // onAuthStateChanged vai tratar do resto
  }

  async function logout() {
    await signOut(auth);
    // opcional: redirect é feito no teu Header (router.push("/"))
  }

  const value = useMemo(
    () => ({
      user,
      userData,
      loading,
      loginWithGoogle,
      logout,
    }),
    [user, userData, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}