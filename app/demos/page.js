import Link from "next/link";

export default function Demos() {
  return (
    <div className="container">
      <h1>Welcome to Lucian's AI Portofolio Showcase</h1>
      <div className="services">
        <div className="service-card">
          <h2>Speech to Text</h2>
          <p>Convert speech to text in real-time</p>
          <Link href="/demos/speech-recognition" className="button">
            Try it now
          </Link>
        </div>
        <div className="service-card">
          <h2>Text to Speech</h2>
          <p>Convert text to natural-sounding speech</p>
          <Link href="/demos/text-to-speech" className="button">
            Try it now
          </Link>
        </div>
        <div className="service-card">
          <h2>Speech Translation</h2>
          <p>Translate speech in real-time</p>
          <Link href="/demos/speech-translation" className="button">
            Try it now
          </Link>
        </div>
      </div>
    </div>
  );
}
