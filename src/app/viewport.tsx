import { Viewport } from 'next'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ff6b35',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}