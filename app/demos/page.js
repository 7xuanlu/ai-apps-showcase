import Button from "@/app/components/Button";
import Link from "next/link";

export default function Demos() {
  return (
    <div className="container">
      <h1>Showcase</h1>
      <div className="services">
        <div className="service-card">
          <h2>Speech to Text</h2>
          <p>Convert speech to text in real-time</p>
          <Button as={Link} href="/demos/speech-recognition" className="mt-2">
            View
          </Button>
        </div>
        <div className="service-card">
          <h2>Text to Speech</h2>
          <p>Convert text to natural speech</p>
          <Button as={Link} href="/demos/text-to-speech" className="mt-2">
            View
          </Button>
        </div>
        <div className="service-card">
          <h2>Speech Translation</h2>
          <p>Translate speech in real-time</p>
          <Button as={Link} href="/demos/speech-translation" className="mt-2">
            View
          </Button>
        </div>
      </div>
    </div>
  );
}
