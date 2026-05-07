"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Vibe } from "@/types/vibe";

export function useVibes() {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVibes() {
      const { data, error } = await supabase
        .from("vibes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching vibes:", error);
      } else {
        setVibes(data || []);
      }

      setLoading(false);
    }

    fetchVibes();
  }, []);

  return { vibes, loading };
}
