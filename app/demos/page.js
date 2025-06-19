import Button from "@/app/components/Button";
import Link from "next/link";
import PageHeader from "@/app/components/PageHeader";
import SectionHeader from "@/app/components/SectionHeader";

export default function Demos() {
  return (
    <div className="container">
      <PageHeader>Showcase</PageHeader>
      <div className="services">
        <div className="service-card">
          <SectionHeader>Speech to Text</SectionHeader>
          <div className="mb-3">Convert speech to text in real-time</div>
          <Button as={Link} href="/demos/speech-recognition" className="mt-2">
            View
          </Button>
        </div>
        <div className="service-card">
          <SectionHeader>Text to Speech</SectionHeader>
          <div className="mb-3">Convert text to natural speech</div>
          <Button as={Link} href="/demos/text-to-speech" className="mt-2">
            View
          </Button>
        </div>
        <div className="service-card">
          <SectionHeader>Speech Translation</SectionHeader>
          <div className="mb-3  ">Translate speech in real-time</div>
          <Button as={Link} href="/demos/speech-translation" className="mt-2">
            View
          </Button>
        </div>
      </div>
    </div>
  );
}
