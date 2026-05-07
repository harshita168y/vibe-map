// // import { supabase } from "@/lib/supabase";

// // type CreateVibeInput = {
// //   placeName: string;
// //   vibeTag: string;
// //   vibeText?: string;
// //   latitude: number;
// //   longitude: number;
// // };

// // export async function createVibe(input: CreateVibeInput) {
// //   const { data, error } = await supabase
// //     .from("vibes")
// //     .insert({
// //       place_name: input.placeName,
// //       vibe_tag: input.vibeTag,
// //       vibe_text: input.vibeText || null,
// //       latitude: input.latitude,
// //       longitude: input.longitude,
// //     })
// //     .select()
// //     .single();

// //   if (error) {
// //     throw error;
// //   }

// //   return data;
// // }

// import { supabase } from "@/lib/supabase";

// type CreateVibeInput = {
//   placeName: string;
//   latitude: number;
//   longitude: number;
//   mapboxPlaceId?: string;
//   vibeTag: string;
//   vibeText?: string;
// };

// export async function createVibe(input: CreateVibeInput) {
//   let placeId: string | null = null;

//   if (input.mapboxPlaceId) {
//     const { data: existingPlace } = await supabase
//       .from("places")
//       .select("id")
//       .eq("mapbox_place_id", input.mapboxPlaceId)
//       .maybeSingle();

//     if (existingPlace) {
//       placeId = existingPlace.id;
//     }
//   }

//   if (!placeId) {
//     const { data: newPlace, error: placeError } = await supabase
//       .from("places")
//       .insert({
//         name: input.placeName,
//         latitude: input.latitude,
//         longitude: input.longitude,
//         mapbox_place_id: input.mapboxPlaceId || null,
//       })
//       .select("id")
//       .single();

//     if (placeError) throw placeError;

//     placeId = newPlace.id;
//   }

//   const { data, error } = await supabase
//     .from("vibes")
//     .insert({
//       place_id: placeId,
//       vibe_tag: input.vibeTag,
//       vibe_text: input.vibeText || null,
//     })
//     .select()
//     .single();

//   if (error) throw error;

//   return data;
// }

import { supabase } from "@/lib/supabase";

type CreateVibeInput = {
  placeName: string;
  latitude: number;
  longitude: number;
  mapboxPlaceId?: string;
  vibeTag: string;
  vibeText?: string;
  deviceId: string;
};

export async function createVibe(input: CreateVibeInput) {
  let placeId: string | null = null;

  // Try finding existing place first
  if (input.mapboxPlaceId) {
    const { data: existingPlace, error: existingPlaceError } =
      await supabase
        .from("places")
        .select("id")
        .eq("mapbox_place_id", input.mapboxPlaceId)
        .maybeSingle();

    if (existingPlaceError) {
      throw new Error(existingPlaceError.message);
    }

    if (existingPlace) {
      placeId = existingPlace.id;
    }
  }

  // Create place if it doesn't exist
  if (!placeId) {
    const { data: newPlace, error: placeError } = await supabase
      .from("places")
      .insert({
        name: input.placeName,
        latitude: input.latitude,
        longitude: input.longitude,
        mapbox_place_id: input.mapboxPlaceId || null,
      })
      .select("id")
      .single();

    if (placeError) {
      throw new Error(placeError.message);
    }

    if (!newPlace) {
      throw new Error("Could not create place.");
    }

    placeId = newPlace.id;
  }

  // Create vibe
  const { data, error } = await supabase
    .from("vibes")
    .insert({
      place_id: placeId,
      vibe_tag: input.vibeTag,
      vibe_text: input.vibeText || null,
      device_id: input.deviceId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}