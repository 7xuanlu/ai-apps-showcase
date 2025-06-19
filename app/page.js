import Link from "next/link";
import Button from "@/app/components/Button";

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center bg-white text-gray-900">
      <h1 className="text-5xl font-bold mb-4">
        Welcome to Lucian's AI Portfolio
      </h1>
      <div className="text-3xl mb-8 text-center max-w-3xl">
        Explore cutting-edge AI in LLM, Agents, speech recognition, and
        real-time translation. Discover the power of modern AI apps in one
        place.
      </div>
      <Button href="/demos" size="landing">
        View Demos
      </Button>
    </main>
  );
}
