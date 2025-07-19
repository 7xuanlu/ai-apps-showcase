import Link from "next/link";
import Button from "@/app/components/Button";
import PageHeader from "@/app/components/PageHeader";

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center bg-white text-gray-900">
      <PageHeader>Welcome to Lucian's AI Portfolio</PageHeader>
      <div className="text-2xl mb-8 text-center max-w-3xl">
        Explore cutting-edge AI in LLM, Agents, speech recognition, and
        real-time translation. Discover the power of modern AI apps in one
        place.
      </div>
      <Button href="/demos" size="landing">
        View Showcase
      </Button>
    </main>
  );
}
