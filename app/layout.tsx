import './globals.css'
import { Inter } from 'next/font/google'
import SupabaseProvider from './supabase-provider'
import { Toaster } from '@/app/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Elsa Quiz',
  description: 'Real-time quiz application built with Next.js and Supabase',
}

export default function RootLayout({
  children,
}: {
    children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>
          {children}
          <Toaster />
        </SupabaseProvider>
      </body>
    </html>
  )
}

