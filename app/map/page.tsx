import { AppShell } from "@/components/layout/AppShell";
import { MapPin, Search, Navigation, Plus } from "lucide-react";

const vibes = [
  { label: "Romantic", emoji: "💞", count: 276, x: "12%", y: "28%" },
  { label: "Good music", emoji: "🎵", count: 189, x: "38%", y: "42%" },
  { label: "Chill", emoji: "😎", count: 143, x: "67%", y: "34%" },
  { label: "Cozy", emoji: "☕", count: 98, x: "18%", y: "55%" },
];

export default function MapPage() {
  return (
    <AppShell>
      <main className="relative h-screen overflow-hidden bg-gradient-to-br from-blue-100 via-pink-50 to-purple-100">
        <div className="absolute inset-0 opacity-70">
          <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff80_1px,transparent_1px),linear-gradient(to_bottom,#ffffff80_1px,transparent_1px)] bg-[size:42px_42px]" />
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

        {vibes.map((vibe) => (
          <div
            key={vibe.label}
            className="absolute z-10"
            style={{ left: vibe.x, top: vibe.y }}
          >
            <div className="relative">
              <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-pink-300/40" />
              <div className="relative flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-xl">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-100 text-xl">
                  {vibe.emoji}
                </span>
                <div>
                  <p className="text-sm font-bold">{vibe.label}</p>
                  <p className="text-xs text-zinc-400">{vibe.count} vibes</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-500/20">
          <div className="h-5 w-5 rounded-full border-4 border-white bg-blue-500 shadow-lg" />
        </div>

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
              <p className="text-2xl font-black">276</p>
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