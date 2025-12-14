"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, X } from "lucide-react"
import { getTranslation, type Language } from "@/lib/translations"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: keyof typeof import("@/lib/translations").translations.en) => {
    return getTranslation(language, key)
  }

  useEffect(() => {
    const preferredLanguage = localStorage.getItem("preferredLanguage") || "en"
    setLanguage(preferredLanguage as Language)

    // Check if app is already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    const isInWebAppiOS = (window.navigator as any).standalone === true

    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show install prompt after a delay (don't be too aggressive)
      setTimeout(() => {
        const hasShownPrompt = localStorage.getItem("pwa-install-prompt-shown")
        if (!hasShownPrompt) {
          setShowInstallPrompt(true)
        }
      }, 10000) // Show after 10 seconds
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log("[PWA] App was installed")
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice

      if (choiceResult.outcome === "accepted") {
        console.log("[PWA] User accepted the install prompt")
      } else {
        console.log("[PWA] User dismissed the install prompt")
      }

      setDeferredPrompt(null)
      setShowInstallPrompt(false)
      localStorage.setItem("pwa-install-prompt-shown", "true")
    } catch (error) {
      console.error("[PWA] Error during installation:", error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem("pwa-install-prompt-shown", "true")
  }

  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null
  }

  return (
    <Card className="fixed bottom-20 left-4 right-4 z-40 shadow-lg border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-1">
            <h3 className="font-medium text-sm">{t("installApp")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("installDescription")}</p>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleInstallClick} className="h-8 px-3">
              <Download className="h-3 w-3 mr-1" />
              {t("install")}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-8 w-8 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
