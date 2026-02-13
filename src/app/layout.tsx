import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PWAInstallPrompt, PWAInstallBanner, PWAInstallInstructions } from "@/components/pwa/PWAInstallPrompt";
import OfflineStatus from "@/components/offline/OfflineStatus";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ff6b35',
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://labournow.vercel.app'),
  title: "LabourNow - On-Demand Labour Booking Platform",
  description: "Connect with skilled workers instantly. Book helpers, masons, electricians, and more at just ₹99 per worker. Available across India with local pricing and support.",
  keywords: ["LabourNow", "labour booking", "skilled workers", "on-demand labour", "construction workers", "domestic help", "India", "mobile app"],
  authors: [{ name: "LabourNow Team" }],
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-96x96.png",
    apple: {
      url: "/icons/icon-152x152.png",
      sizes: "152x152"
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LabourNow",
  },
  openGraph: {
    title: "LabourNow - On-Demand Labour Booking Platform",
    description: "Connect with skilled workers instantly. Book helpers, masons, electricians, and more at just ₹99 per worker.",
    url: "https://labournow.vercel.app",
    siteName: "LabourNow",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/screenshots/mobile-home.png",
        width: 1280,
        height: 720,
        alt: "LabourNow Mobile App - Find Workers"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "LabourNow - On-Demand Labour Booking Platform",
    description: "Connect with skilled workers instantly. Book helpers, masons, electricians, and more at just ₹99 per worker.",
    images: ["/screenshots/mobile-home.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <meta name="theme-color" content="#ff6b35" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LabourNow" />
        <link rel="apple-touch-startup-image" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <PWAInstallBanner />
        {children}
        <Toaster />
        <OfflineStatus />
        <PWAInstallPrompt />
        <PWAInstallInstructions />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize PWA features
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                      console.log('SW registered: ', registration);
                      
                      // Initialize PWA features
                      if (window.pwaManager) {
                        window.pwaManager.init();
                      }
                    })
                    .catch((registrationError) => {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }

              // Initialize offline support
              if ('serviceWorker' in navigator && 'BackgroundSync' in window) {
                console.log('Background Sync supported');
              }

              // Check network status
              function updateNetworkStatus() {
                const isOnline = navigator.onLine;
                window.dispatchEvent(new CustomEvent('networkchange', {
                  detail: { isOnline }
                }));
              }

              window.addEventListener('online', updateNetworkStatus);
              window.addEventListener('offline', updateNetworkStatus);

              // Handle deep links
              function handleDeepLink() {
                const urlParams = new URLSearchParams(window.location.search);
                const deepLink = urlParams.get('deep_link');
                if (deepLink && window.deepLinkManager) {
                  window.deepLinkManager.handleDeepLink(deepLink);
                }
              }

              handleDeepLink();

              // Initialize app shortcuts
              if ('mediaSession' in navigator && window.appShortcutsManager) {
                window.appShortcutsManager.init();
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
