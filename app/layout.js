import './globals.css'

import Navbar from './components/Navbar'

export const metadata = {
  title: 'Azure Speech Service Suite',
  description: 'A suite of Azure Speech Services',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center">
          {children}
        </main>
        <footer className="bg-gray-100 text-center py-6 mt-8 text-lg">
          By <a href="https://github.com/7xuanlu" className="text-blue-600 hover:underline">Lucian</a>
        </footer>
      </body>
    </html>
  )
} 