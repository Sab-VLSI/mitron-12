"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { translations, type Language, type TranslationKey, getTranslation } from "@/lib/translations"

interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem("preferredLanguage") as Language
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("preferredLanguage", lang)
  }

  const t = (key: TranslationKey): string => {
    return getTranslation(language, key)
  }

  return <TranslationContext.Provider value={{ language, setLanguage, t }}>{children}</TranslationContext.Provider>
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}
