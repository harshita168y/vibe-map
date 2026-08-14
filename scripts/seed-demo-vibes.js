const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DEMO_PLACES = [
  // ---------------- DUBLIN ----------------
  {
    city: "Dublin",
    name: "Beanhive Coffee",
    latitude: 53.3396,
    longitude: -6.2603,
  },
  {
    city: "Dublin",
    name: "Keoghs Cafe",
    latitude: 53.3437,
    longitude: -6.2595,
  },
  {
    city: "Dublin",
    name: "Lemon Jelly Cafe",
    latitude: 53.3478,
    longitude: -6.2711,
  },
  {
    city: "Dublin",
    name: "Joy of Cha",
    latitude: 53.3430,
    longitude: -6.2657,
  },
  {
    city: "Dublin",
    name: "Social Fabric Cafe",
    latitude: 53.3482,
    longitude: -6.2675,
  },

  // ---------------- LIMERICK ----------------
  {
    city: "Limerick",
    name: "Cafe Rose",
    latitude: 52.6638,
    longitude: -8.6267,
  },
  {
    city: "Limerick",
    name: "Story Cafe",
    latitude: 52.6633,
    longitude: -8.6285,
  },
  {
    city: "Limerick",
    name: "Hook & Ladder",
    latitude: 52.6645,
    longitude: -8.6238,
  },
  {
    city: "Limerick",
    name: "Aroma Coffee",
    latitude: 52.6649,
    longitude: -8.6258,
  },
  {
    city: "Limerick",
    name: "Fika Coffee",
    latitude: 52.6628,
    longitude: -8.6275,
  },

  // ---------------- GALWAY ----------------
  {
    city: "Galway",
    name: "An Tobar Nua",
    latitude: 53.2747,
    longitude: -9.0566,
  },
  {
    city: "Galway",
    name: "Esquires Coffee Galway",
    latitude: 53.2740,
    longitude: -9.0509,
  },
  {
    city: "Galway",
    name: "Seacrest Cafe",
    latitude: 53.2708,
    longitude: -9.0535,
  },
  {
    city: "Galway",
    name: "Jungle Cafe Galway",
    latitude: 53.2728,
    longitude: -9.0530,
  },
  {
    city: "Galway",
    name: "Dough Bros",
    latitude: 53.2734,
    longitude: -9.0546,
  },

  // ---------------- CORK ----------------
  {
    city: "Cork",
    name: "Greenwich Cafe",
    latitude: 51.8985,
    longitude: -8.4756,
  },
  {
    city: "Cork",
    name: "Farmgate Cafe",
    latitude: 51.9000,
    longitude: -8.4742,
  },
  {
    city: "Cork",
    name: "Dwyers Garden Cafe",
    latitude: 51.8989,
    longitude: -8.4730,
  },
  {
    city: "Cork",
    name: "Cafe Gusto",
    latitude: 51.8995,
    longitude: -8.4764,
  },
  {
    city: "Cork",
    name: "Liberty Grill",
    latitude: 51.8974,
    longitude: -8.4738,
  },
];

// ============================================================
// VIBES
// ============================================================

const VIBES = [
  {
    tag: "Chill",
    text: "Pretty relaxed here right now ☕",
  },
  {
    tag: "Busy",
    text: "A little busy but still comfortable",
  },
  {
    tag: "Lively",
    text: "Lots of people and good energy 🔥",
  },
  {
    tag: "Social",
    text: "Feels social and lively right now",
  },
  {
    tag: "Productive",
    text: "Good spot to sit down and get some work done 💻",
  },
  {
    tag: "Cozy",
    text: "Cozy atmosphere right now",
  },
  {
    tag: "Relaxed",
    text: "Nice relaxed atmosphere",
  },
];

// ============================================================
// TIME HELPERS
// ============================================================

const TIMEZONE = "Europe/Dublin";

function getDublinTimeParts() {
  const formatter = new Intl.DateTimeFormat("en-IE", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(new Date());

  const result = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      result[part.type] = part.value;
    }
  }

  return {
    year: Number(result.year),
    month: Number(result.month),
    day: Number(result.day),
    hour: Number(result.hour),
    minute: Number(result.minute),
    second: Number(result.second),
  };
}

// Convert a Dublin local time to a real UTC timestamp.
//
// We use Intl to determine the current Dublin offset so this
// continues to work during Irish summer/winter time.
function dublinTimeToUTC(hour, minute = 0) {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-IE", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(now);

  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  const year = Number(values.year);
  const month = Number(values.month);
  const day = Number(values.day);

  // Start with a UTC approximation.
  let guess = new Date(
    Date.UTC(year, month - 1, day, hour, minute, 0)
  );

  // Determine the Dublin offset at this approximate time.
  const offsetFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    timeZoneName: "longOffset",
    hour: "2-digit",
    minute: "2-digit",
  });

  const offsetParts = offsetFormatter.formatToParts(guess);

  const offsetPart = offsetParts.find(
    (part) => part.type === "timeZoneName"
  );

  const offsetString = offsetPart?.value || "GMT+00:00";

  const match = offsetString.match(
    /GMT([+-])(\d{2}):(\d{2})/
  );

  let offsetMinutes = 0;

  if (match) {
    const sign = match[1] === "+" ? 1 : -1;

    offsetMinutes =
      sign *
      (Number(match[2]) * 60 + Number(match[3]));
  }

  return new Date(
    guess.getTime() - offsetMinutes * 60 * 1000
  );
}

function getExpirationTime() {
  return dublinTimeToUTC(17, 0).toISOString();
}

function getCurrentTime() {
  return dublinTimeToUTC(
    getDublinTimeParts().hour,
    getDublinTimeParts().minute
  ).toISOString();
}

// ============================================================
// RANDOM VIBE
// ============================================================

function getRandomVibe() {
  return VIBES[
    Math.floor(Math.random() * VIBES.length)
  ];
}

// ============================================================
// FIND OR CREATE PLACE
// ============================================================

async function getOrCreatePlace(place) {
  // Try to find existing place by name.
  const { data: existingPlace, error: findError } =
    await supabase
      .from("places")
      .select("id, name, latitude, longitude")
      .eq("name", place.name)
      .maybeSingle();

  if (findError) {
    throw new Error(
      `Error finding ${place.name}: ${findError.message}`
    );
  }

  if (existingPlace) {
    console.log(
      `✓ Found existing place: ${place.name}`
    );

    return existingPlace.id;
  }

  // Generate UUID ourselves.
  const placeId = crypto.randomUUID();

  const { data: newPlace, error: insertError } =
    await supabase
      .from("places")
      .insert({
        id: placeId,
        name: place.name,
        latitude: place.latitude,
        longitude: place.longitude,
        mapbox_place_id: null,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

  if (insertError) {
    throw new Error(
      `Error creating ${place.name}: ${insertError.message}`
    );
  }

  console.log(
    `+ Created place: ${place.name}`
  );

  return newPlace.id;
}

// ============================================================
// REMOVE PREVIOUS DEMO VIBE
// ============================================================

async function removePreviousDemoVibe(placeId) {
  /*
   * Since demo vibes have user_id = NULL and device_id = NULL,
   * we use those fields to identify the seeded rows.
   *
   * IMPORTANT:
   * This assumes you don't have normal anonymous vibes where
   * BOTH user_id and device_id are NULL.
   */

  const { error } = await supabase
    .from("vibes")
    .delete()
    .eq("place_id", placeId)
    .is("user_id", null)
    .is("device_id", null);

  if (error) {
    throw new Error(
      `Error removing previous demo vibe: ${error.message}`
    );
  }
}

// ============================================================
// CREATE VIBE
// ============================================================

async function createDemoVibe(placeId, placeName) {
  const vibe = getRandomVibe();

  const createdAt = getCurrentTime();
  const expiresAt = getExpirationTime();

  const { error } = await supabase
    .from("vibes")
    .insert({
      id: crypto.randomUUID(),

      place_id: placeId,

      vibe_tag: vibe.tag,

      vibe_text: vibe.text,

      created_at: createdAt,

      expires_at: expiresAt,

      // Deliberately NULL.
      user_id: null,

      device_id: null,
    });

  if (error) {
    throw new Error(
      `Error creating vibe for ${placeName}: ${error.message}`
    );
  }

  console.log(
    `  → ${placeName}: ${vibe.tag} | expires ${expiresAt}`
  );
}


async function processPlace(place) {
  console.log(
    `\nProcessing ${place.city} → ${place.name}`
  );

  const placeId = await getOrCreatePlace(place);

  await removePreviousDemoVibe(placeId);

  await createDemoVibe(
    placeId,
    place.name
  );
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log(
    "\n=========================================="
  );

  console.log(
    "      VIBEMAP DEMO VIBE SEEDER"
  );

  console.log(
    "==========================================\n"
  );

  const dublinTime = getDublinTimeParts();

  console.log(
    `Ireland time: ${dublinTime.hour}:${String(
      dublinTime.minute
    ).padStart(2, "0")}`
  );

  /*
   * Only run during 09:00–17:00.
   */

  if (
    dublinTime.hour < 9 ||
    dublinTime.hour >= 17
  ) {
    console.log(
      "\nOutside demo hours (09:00–17:00)."
    );

    console.log(
      "No demo vibes will be created.\n"
    );

    return;
  }

  console.log(
    "\nInside demo hours. Seeding vibes..."
  );

  for (const place of DEMO_PLACES) {
    try {
      await processPlace(place);
    } catch (error) {
      console.error(
        `\nERROR: ${place.name}`
      );

      console.error(error.message);
    }
  }

  console.log(
    "\n=========================================="
  );

  console.log(
    "Demo vibe seeding complete."
  );

  console.log(
    "==========================================\n"
  );
}

main().catch((error) => {
  console.error(error);

  process.exit(1);
});
