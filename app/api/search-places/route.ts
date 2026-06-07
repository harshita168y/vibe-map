import { NextResponse } from "next/server";

type GooglePlace = {
  id: string;
  displayName?: {
    text?: string;
  };
  formattedAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
};

type GooglePlacesResponse = {
  places?: GooglePlace[];
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const query = searchParams.get("query");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!query) {
    return NextResponse.json([], { status: 400 });
  }

  const body: {
    textQuery: string;
    maxResultCount: number;
    locationBias?: {
      circle: {
        center: {
          latitude: number;
          longitude: number;
        };
        radius: number;
      };
    };
  } = {
    textQuery: query,
    maxResultCount: 10,
  };

  if (lat && lng) {
    body.locationBias = {
      circle: {
        center: {
          latitude: Number(lat),
          longitude: Number(lng),
        },
        radius: 50000,
      },
    };
  }

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY!,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google Places error:", errorText);
    return NextResponse.json([], { status: response.status });
  }

  const data = (await response.json()) as GooglePlacesResponse;

  const results =
    data.places?.map((place) => ({
      id: place.id,
      name: place.displayName?.text || "Unknown place",
      address: place.formattedAddress || "",
      latitude: place.location?.latitude ?? 0,
      longitude: place.location?.longitude ?? 0,
    })) ?? [];

  return NextResponse.json(results);
}