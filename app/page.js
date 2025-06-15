export default function Home() {
  return (
    <div className="container">
      <h1>Welcome to Azure Speech Service Suite</h1>
      <div className="services">
        <div className="service-card">
          <h2>Text to Speech</h2>
          <p>Convert text to natural-sounding speech</p>
          <a href="/text-to-speech" className="button">Try it now</a>
        </div>
        <div className="service-card">
          <h2>Speech to Text</h2>
          <p>Convert speech to text in real-time</p>
          <a href="/speech-to-text" className="button">Try it now</a>
        </div>
        <div className="service-card">
          <h2>Speech Translation</h2>
          <p>Translate speech in real-time</p>
          <a href="/speech-translation" className="button">Try it now</a>
        </div>
      </div>
    </div>
  )
} 