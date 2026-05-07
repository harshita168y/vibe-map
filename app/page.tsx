export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold">Vibe Map</h1>

        <p className="text-zinc-400">
          Real-time vibes around the world
        </p>

        <a
          href="/map"
          className="inline-block rounded-2xl bg-white text-black px-6 py-3 font-medium"
        >
          Open Map
        </a>
      </div>
    </main>
  );
}