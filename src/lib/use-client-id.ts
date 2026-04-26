"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cover-guessr-client-id";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useClientId(): string | null {
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = generateId();
      localStorage.setItem(STORAGE_KEY, id);
    }
    setClientId(id);
  }, []);

  return clientId;
}
