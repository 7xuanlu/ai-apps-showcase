export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">
      <h1 className="text-4xl font-bold mt-24 mb-4">Welcome to Lucian's AI Portfolio</h1>
      <p className="text-lg mb-8 text-center max-w-xl">
        Explore cutting-edge AI demos for speech recognition, text-to-speech, and real-time translation. Discover the power of modern AI technologies in one place.
      </p>
      <a
        href="/demos"
        className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors text-lg font-medium"
      >
        View Demos
      </a>
    </main>
  );
}
