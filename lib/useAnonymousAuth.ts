"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useAnonymousAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function signInAnonymously() {
      const { data: existingSession } = await supabase.auth.getSession();

      if (existingSession.session?.user) {
        setUserId(existingSession.session.user.id);
        setAuthLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error("Anonymous auth error:", error);
      } else {
        setUserId(data.user?.id || null);
      }

      setAuthLoading(false);
    }

    signInAnonymously();
  }, []);

  return { userId, authLoading };
}