import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">
      <h1 className="text-4xl font-bold mt-24 mb-4">
        Welcome to Lucian's AI Portfolio
      </h1>
      <p className="text-lg mb-8 text-center max-w-xl">
        Explore cutting-edge AI in LLM, Agents, speech recognition, and
        real-time translation. Discover the power of modern AI apps in
        one place.
      </p>
      <Link href="/demos" className="button">
        View Demos
      </Link>
    </main>
  );
}
