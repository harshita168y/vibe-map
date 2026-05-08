"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { PlaceWithVibes } from "@/types/vibe";

export function useVibes() {
  const [places, setPlaces] = useState<PlaceWithVibes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlacesWithVibes() {
      const { data, error } = await supabase
        .from("places")
        .select(`
          *,
          vibes (*)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching places:", error);
      } else {
        const activePlaces = (data || [])
          .map((place) => ({
            ...place,
            vibes: (place.vibes || []).filter(
              (vibe: { expires_at: string }) =>
                new Date(vibe.expires_at).getTime() > Date.now()
            ),
          }))
          .filter((place) => place.vibes.length > 0);

        setPlaces(activePlaces as PlaceWithVibes[]);
      }

      setLoading(false);
    }

    fetchPlacesWithVibes();

    const channel = supabase
  .channel("live-vibes")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "vibes",
    },
    () => {
      fetchPlacesWithVibes();
    }
  )
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "places",
    },
    () => {
      fetchPlacesWithVibes();
    }
  )
  .on(
  "postgres_changes",
  {
    event: "*",
    schema: "public",
    table: "vibe_reports",
  },
   (payload) => {
    console.log("Report changed:", payload);
    fetchPlacesWithVibes();
  }
)
  .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { places, loading };
}