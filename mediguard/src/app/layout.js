import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '../components/layout/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MediGuard | Anti-Counterfeit Platform',
  description: 'Multi-layered medicine verification using QR and AI Voice',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-50 min-h-screen`}>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
