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
  firebaseUser: User | null;
  userDoc: UserDoc | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  const unsubUserRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);

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

      const userRef = doc(db, "users", u.uid);

      try {
        await setDoc(
          userRef,
          {
            email: u.email ?? "",
            displayName: u.displayName ?? "",
            photoURL: u.photoURL ?? "",
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error("Erro ao garantir user doc:", err);
      }

      unsubUserRef.current = onSnapshot(
        userRef,
        (snap) => {
          const data = snap.exists() ? (snap.data() as any) : {};

          setUserData({
            plan: data.plan === "pro" ? "pro" : "free",
            freeListingsUsed: Number(data.freeListingsUsed ?? 0),
            whatsapp: data.whatsapp,
            createdAt: data.createdAt,
          });

          setLoading(false);
        },
        (err) => {
          console.error("Erro ao ler user doc:", err);
          setUserData({
            plan: "free",
            freeListingsUsed: 0,
            whatsapp: "",
            createdAt: null,
          });
          setLoading(false);
        }
      );
    });

    return () => {
      if (unsubUserRef.current) unsubUserRef.current();
      unsubAuth();
    };
  }, []);

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function logout() {
    await signOut(auth);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      userData,
      firebaseUser: user,
      userDoc: userData,
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
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
  return ctx;
}
