import './globals.css'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Providers from './components/Providers'

// Import startup validation to ensure it runs when the application starts
import '../lib/startup-validation'

export const metadata = {
  title: 'Lucian\'s AI Portfolio',
  description: 'A suite of AI applications demos',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1 container mx-auto px-4 flex flex-col justify-center">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
} 