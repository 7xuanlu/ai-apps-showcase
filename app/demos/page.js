import Button from "@/app/components/Button";
import Link from "next/link";
import PageHeader from "@/app/components/PageHeader";
import SectionHeader from "@/app/components/SectionHeader";

export default function Demos() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <PageHeader>Showcase</PageHeader>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our cutting-edge AI demos featuring speech recognition, text-to-speech, and real-time translation capabilities.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="service-card flex flex-col">
            <div className="text-center flex-1 flex flex-col">
              <SectionHeader>Speech to Text</SectionHeader>
              <div className="mt-4 mb-6 text-gray-600 flex-1">
                Convert speech to text in real-time with high accuracy
              </div>
              <div className="mt-auto">
                <Button as={Link} href="/demos/speech-recognition" className="w-60 min-w-[100px]">
                  View Demo
                </Button>
              </div>
            </div>
          </div>
          
          <div className="service-card flex flex-col">
            <div className="text-center flex-1 flex flex-col">
              <SectionHeader>Text to Speech</SectionHeader>
              <div className="mt-4 mb-6 text-gray-600 flex-1">
                Convert text to natural-sounding speech
              </div>
              <div className="mt-auto">
                <Button as={Link} href="/demos/text-to-speech" className="w-60 min-w-[100px]">
                  View Demo
                </Button>
              </div>
            </div>
          </div>
          
          <div className="service-card flex flex-col md:col-span-2 lg:col-span-1">
            <div className="text-center flex-1 flex flex-col">
              <SectionHeader>Speech Translation</SectionHeader>
              <div className="mt-4 mb-6 text-gray-600 flex-1">
                Translate speech in real-time across languages
              </div>
              <div className="mt-auto">
                <Button as={Link} href="/demos/speech-translation" className="w-60 min-w-[100px]">
                  View Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
