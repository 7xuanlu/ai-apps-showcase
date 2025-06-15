export const metadata = {
  title: 'Azure Speech Service Suite',
  description: 'A suite of Azure Speech Services',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <header className="border-b bg-white">
          <nav className="container mx-auto flex gap-4 py-4 px-4">
            <a href="/speech-recognition" className="text-blue-600 hover:underline">Speech Recognition</a>
            <a href="/speech-translation" className="text-blue-600 hover:underline">Speech Translation</a>
            <a href="/text-to-speech" className="text-blue-600 hover:underline">Speech Synthesis</a>
          </nav>
        </header>
        <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center">
          {children}
        </main>
        <footer className="bg-gray-100 text-center py-6 mt-8 text-lg">
          Work by <a href="https://github.com/Mnemo7" className="text-blue-600 hover:underline">Mnemo7</a>
        </footer>
      </body>
    </html>
  )
} 