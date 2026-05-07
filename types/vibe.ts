export type Vibe = {
  id: string;
  place_id: string;
  vibe_tag: string;
  vibe_text: string | null;
  created_at: string;
  expires_at: string;
};

export type PlaceWithVibes = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  mapbox_place_id: string | null;
  created_at: string;
  vibes: Vibe[];
};