import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { AIChatbot } from "@/components/ai-chatbot"
import { PWAInstall } from "@/components/pwa-install"

export const metadata: Metadata = {
  title: "KrishiMitra - Agriculture App",
  description: "Your agriculture companion for personalized farming guidance",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KrishiMitra",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "KrishiMitra",
    title: "KrishiMitra - Agriculture App",
    description: "Your agriculture companion for personalized farming guidance",
  },
  twitter: {
    card: "summary",
    title: "KrishiMitra - Agriculture App",
    description: "Your agriculture companion for personalized farming guidance",
  },
}

export const viewport: Viewport = {
  themeColor: "#22c55e",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="KrishiMitra" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KrishiMitra" />
        <meta name="description" content="Your agriculture companion for personalized farming guidance" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#22c55e" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#22c55e" />

        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icon-192x192.png" />

        <link rel="icon" type="image/png" sizes="32x32" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icon-192x192.png" color="#22c55e" />
        <link rel="shortcut icon" href="/favicon.ico" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://yourdomain.com" />
        <meta name="twitter:title" content="KrishiMitra" />
        <meta name="twitter:description" content="Your agriculture companion for personalized farming guidance" />
        <meta name="twitter:image" content="https://yourdomain.com/icon-192x192.png" />
        <meta name="twitter:creator" content="@yourtwitterhandle" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="KrishiMitra" />
        <meta property="og:description" content="Your agriculture companion for personalized farming guidance" />
        <meta property="og:site_name" content="KrishiMitra" />
        <meta property="og:url" content="https://yourdomain.com" />
        <meta property="og:image" content="https://yourdomain.com/icon-192x192.png" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              // #region agent log - Global error handler
              window.addEventListener('error', function(e) {
                try {
                  fetch('http://127.0.0.1:7242/ingest/83eb5832-587c-4d7a-a726-1e83d575e523', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                      location: 'app/layout.tsx:error-handler',
                      message: 'Global error caught',
                      data: {
                        message: e.message,
                        filename: e.filename,
                        lineno: e.lineno,
                        colno: e.colno,
                        error: e.error ? String(e.error) : null,
                        stack: e.error?.stack || null
                      },
                      timestamp: Date.now(),
                      sessionId: 'debug-session',
                      runId: 'run1',
                      hypothesisId: 'G'
                    })
                  }).catch(() => {});
                } catch(err) {}
              });
              window.addEventListener('unhandledrejection', function(e) {
                try {
                  fetch('http://127.0.0.1:7242/ingest/83eb5832-587c-4d7a-a726-1e83d575e523', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                      location: 'app/layout.tsx:unhandled-rejection',
                      message: 'Unhandled promise rejection',
                      data: {
                        reason: String(e.reason),
                        stack: e.reason?.stack || null
                      },
                      timestamp: Date.now(),
                      sessionId: 'debug-session',
                      runId: 'run1',
                      hypothesisId: 'G'
                    })
                  }).catch(() => {});
                } catch(err) {}
              });
              // #endregion
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('[PWA] Service Worker registered successfully:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('[PWA] Service Worker registration failed:', error);
                    });
                });
              }
            `,
          }}
        />

        <style
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `html{font-family:${JSON.stringify(GeistSans.style.fontFamily)};--font-sans:${GeistSans.variable};--font-mono:${GeistMono.variable}}`,
          }}
        />
      </head>
      <body className={GeistSans.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <AIChatbot />
          <PWAInstall />
        </ThemeProvider>
      </body>
    </html>
  )
}
