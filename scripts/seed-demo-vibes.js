require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --------------------------------------------------
// TEST PLACES
// --------------------------------------------------

const PLACES = [
  {
    name: "Copper Face Jacks",
    latitude: 53.33544,
    longitude: -6.26351,
  },
  {
    name: "D Two",
    latitude: 53.3359,
    longitude: -6.2639,
  },
];

// --------------------------------------------------
// THREE TEST VIBES
// --------------------------------------------------

const VIBES = [
  {
    vibe_tag: "🔥 Lively",
    vibe_text: "The place is buzzing tonight!",
  },
  {
    vibe_tag: "🎶 Party",
    vibe_text: "Music is hitting and the crowd is energetic.",
  },
  {
    vibe_tag: "🍸 Social",
    vibe_text: "Busy, social and good energy tonight.",
  },
];

// --------------------------------------------------
// CREATE / FIND PLACE
// --------------------------------------------------

async function getOrCreatePlace(place) {
  const { data: existing, error: findError } =
    await supabase
      .from("places")
      .select("id")
      .eq("name", place.name)
      .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (existing) {
    console.log(`Found: ${place.name}`);
    return existing.id;
  }

  const id = crypto.randomUUID();

  const { data, error } = await supabase
    .from("places")
    .insert({
      id,
      name: place.name,
      latitude: place.latitude,
      longitude: place.longitude,
      mapbox_place_id: null,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  console.log(`Created: ${place.name}`);

  return data.id;
}

// --------------------------------------------------
// INSERT VIBE
// --------------------------------------------------

async function insertVibe(placeId, vibe) {
  const now = new Date();

  // For THIS TEST, keep the vibe alive for 3 hours.
  const expiresAt = new Date(
    now.getTime() + 3 * 60 * 60 * 1000
  );

  const { error } = await supabase
    .from("vibes")
    .insert({
      id: crypto.randomUUID(),

      place_id: placeId,

      vibe_tag: vibe.vibe_tag,

      vibe_text: vibe.vibe_text,

      created_at: now.toISOString(),

      expires_at: expiresAt.toISOString(),

      user_id: null,

      device_id: null,
    });

  if (error) {
    throw error;
  }

  console.log(
    `  Added vibe: ${vibe.vibe_tag}`
  );

  console.log(
    `  Expires: ${expiresAt.toISOString()}`
  );
}

// --------------------------------------------------
// MAIN
// --------------------------------------------------

async function main() {
  console.log("\n==============================");
  console.log("VibeMap GitHub Action TEST");
  console.log("==============================\n");

  for (let i = 0; i < PLACES.length; i++) {
    const place = PLACES[i];

    console.log(`Processing ${place.name}`);

    const placeId = await getOrCreatePlace(place);

    const vibe = VIBES[i % VIBES.length];

    await insertVibe(placeId, vibe);
  }

  console.log("\nDONE!");
}

main().catch((error) => {
  console.error("\nFAILED:");
  console.error(error);

  process.exit(1);
});
