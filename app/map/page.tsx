"use client";

import { AppShell } from "@/components/layout/AppShell";
import { VibeMap } from "@/components/map/VibeMap";
import { useVibes } from "@/lib/useVibes";
import { Search, Navigation, Plus } from "lucide-react";

export default function MapPage() {
  const { vibes } = useVibes();

  return (
    <AppShell>
      <main className="relative h-screen overflow-hidden bg-gradient-to-br from-blue-100 via-pink-50 to-purple-100">
        <div className="absolute inset-0">
          <VibeMap />
        </div>

        <div className="absolute left-5 right-5 top-5 z-20 flex items-center gap-3">
          <div className="flex flex-1 items-center gap-3 rounded-full bg-white/90 px-4 py-3 shadow-xl backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-xl">
              🙂
            </div>

            <div className="flex-1">
              <p className="text-xs font-medium text-zinc-400">Current city</p>
              <h1 className="text-lg font-bold">Dublin</h1>
            </div>

            <Search size={22} />
          </div>

          <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-xl backdrop-blur-xl">
            <Navigation size={22} />
          </button>
        </div>

        {vibes.map((vibe, index) => (
          <div
            key={vibe.id}
            className="absolute z-10"
            style={{
              left: `${15 + index * 22}%`,
              top: `${30 + index * 8}%`,
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-pink-300/40" />

              <div className="relative flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-xl">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-100 text-xl">
                  ✨
                </span>

                <div>
                  <p className="text-sm font-bold">{vibe.vibe_tag}</p>
                  <p className="text-xs text-zinc-400">{vibe.place_name}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        <section className="absolute bottom-0 left-0 right-0 z-30 rounded-t-[2.5rem] bg-white p-5 shadow-2xl">
          <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-zinc-200" />

          <div className="flex gap-4">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-green-200 to-blue-200" />

            <div className="flex-1">
              <p className="text-sm text-zinc-500">Park · 0.4 mi</p>
              <h2 className="text-2xl font-black">Phoenix Park</h2>
              <p className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                Open now
              </p>
            </div>

            <div className="rounded-3xl bg-pink-100 px-4 py-3 text-center">
              <p className="text-2xl font-black">{vibes.length}</p>
              <p className="text-xs text-zinc-500">vibes</p>
            </div>
          </div>

          <h3 className="mt-5 text-lg font-black">What’s the vibe?</h3>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {["All", "Chill", "Romantic", "Cozy", "Music"].map((tag) => (
              <button
                key={tag}
                className="rounded-full bg-pink-50 px-4 py-2 text-sm font-bold text-pink-600"
              >
                {tag}
              </button>
            ))}
          </div>

          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-pink-500 to-purple-600 py-4 text-lg font-black text-white shadow-xl">
            <Plus size={22} />
            Post a vibe
          </button>
        </section>
      </main>
    </AppShell>
  );
}