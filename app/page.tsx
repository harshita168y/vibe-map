export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0F1117] text-white">
      <section className="relative flex min-h-screen items-center justify-center px-5">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-[#0F1117] to-black" />
        <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />

        <div className="relative z-10 w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-pink-500 via-purple-500 to-blue-400 text-4xl shadow-[0_0_45px_rgba(255,77,166,0.35)]">
            ✨
          </div>

          <p className="mb-3 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-pink-200 backdrop-blur-xl">
            Real-time vibes around you
          </p>

          <h1 className="text-5xl font-black tracking-tight">
            Find the vibe before you go.
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-base font-medium leading-7 text-zinc-400">
            See what places feel like right now!!!
          </p>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-4 text-left shadow-2xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-black">Live vibe preview</p>
              <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-bold text-pink-200">
                3h expiry
              </span>
            </div>

            <div className="space-y-2">
              {[
                ["☕ Cozy cafés", "Chill · active nearby"],
                ["🎵 Music spots", "Live · happening now"],
                ["🌃 Night vibes", "Busy · trending"],
                ["🌿 Quiet places", "Peaceful · low crowd"],
              ].map(([place, vibe]) => (
                <div
                  key={place}
                  className="flex items-center justify-between rounded-2xl bg-[#1A1B22]/90 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-black">{place}</p>
                    <p className="text-xs font-semibold text-zinc-500">
                      {vibe}
                    </p>
                  </div>

                  <div className="h-3 w-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-[0_0_18px_rgba(255,77,166,0.8)]" />
                </div>
              ))}
            </div>
          </div>

          <a
            href="/map"
            className="mt-8 inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4 text-lg font-black text-white shadow-[0_0_35px_rgba(255,77,166,0.35)] active:scale-95"
          >
            Open Vibe Map
          </a>

          <p className="mt-4 text-xs font-medium text-zinc-500">
            Anonymous. Real-time. No profiles. No followers.
          </p>
        </div>
      </section>
    </main>
  );
}