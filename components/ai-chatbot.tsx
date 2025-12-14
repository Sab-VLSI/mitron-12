"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MessageCircle,
  Mic,
  MicOff,
  Send,
  X,
  Minimize2,
  Wifi,
  WifiOff,
  Settings,
  Play,
  Pause,
  Globe,
} from "lucide-react"
import { offlineTranslations, offlineResponses } from "@/lib/offline-translations"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface VoiceSettings {
  rate: number
  pitch: number
  volume: number
  voiceIndex: number
}

export function AIChatbot() {
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/83eb5832-587c-4d7a-a726-1e83d575e523',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/ai-chatbot.tsx:40',message:'AIChatbot component mounted',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  }, []);
  // #endregion
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [voiceMode, setVoiceMode] = useState<"off" | "push-to-talk" | "continuous">("push-to-talk")
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)
  const [showLanguageSelection, setShowLanguageSelection] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(true)
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    rate: 0.9,
    pitch: 1,
    volume: 1,
    voiceIndex: 0,
  })
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [interimTranscript, setInterimTranscript] = useState("")
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "listening" | "processing" | "speaking">("idle")

  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionStateRef = useRef<"inactive" | "starting" | "active" | "stopping">("inactive")
  const shouldRestartRef = useRef(false)
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSpeechTimeRef = useRef<number>(0)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const languageMap: { [key: string]: string } = {
    en: "en-US",
    hi: "hi-IN",
    te: "te-IN",
    ta: "ta-IN",
    kn: "kn-IN",
    ml: "ml-IN",
    bn: "bn-IN",
    gu: "gu-IN",
  }

  const languageOptions = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिंदी" },
    { code: "te", name: "Telugu", nativeName: "తెలుగు" },
    { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
    { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
    { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
    { code: "bn", name: "Bengali", nativeName: "বাংলা" },
    { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  ]

  const detectLanguageFromText = (text: string): string => {
    const lowerText = text.toLowerCase()

    // Tamil detection
    if (
      /[\u0B80-\u0BFF]/.test(text) ||
      lowerText.includes("vanakkam") ||
      lowerText.includes("enna") ||
      lowerText.includes("naan") ||
      lowerText.includes("ullen") ||
      lowerText.includes("vaanilai") ||
      lowerText.includes("nilavaram")
    ) {
      return "ta"
    }

    // Hindi detection
    if (
      /[\u0900-\u097F]/.test(text) ||
      lowerText.includes("namaste") ||
      lowerText.includes("kaise") ||
      lowerText.includes("kya") ||
      lowerText.includes("mausam") ||
      lowerText.includes("fasal")
    ) {
      return "hi"
    }

    // Telugu detection
    if (
      /[\u0C00-\u0C7F]/.test(text) ||
      lowerText.includes("namaskaram") ||
      lowerText.includes("ela") ||
      lowerText.includes("vaatavaranam")
    ) {
      return "te"
    }

    // Kannada detection
    if (
      /[\u0C80-\u0CFF]/.test(text) ||
      lowerText.includes("namaskara") ||
      lowerText.includes("hege") ||
      lowerText.includes("havamana")
    ) {
      return "kn"
    }

    // Malayalam detection
    if (
      /[\u0D00-\u0D7F]/.test(text) ||
      lowerText.includes("namaskaram") ||
      lowerText.includes("engane") ||
      lowerText.includes("kalavasta")
    ) {
      return "ml"
    }

    // Bengali detection
    if (
      /[\u0980-\u09FF]/.test(text) ||
      lowerText.includes("namaskar") ||
      lowerText.includes("kemon") ||
      lowerText.includes("aabohawa")
    ) {
      return "bn"
    }

    // Gujarati detection
    if (
      /[\u0A80-\u0AFF]/.test(text) ||
      lowerText.includes("namaste") ||
      lowerText.includes("kem") ||
      lowerText.includes("havaman")
    ) {
      return "gu"
    }

    return "en" // Default to English
  }

  const detectLanguageCommand = (text: string): string | null => {
    const lowerText = text.toLowerCase()

    // English commands
    if (lowerText.includes("english") || lowerText.includes("speak english")) return "en"
    if (lowerText.includes("hindi") || lowerText.includes("speak hindi")) return "hi"
    if (lowerText.includes("telugu") || lowerText.includes("speak telugu")) return "te"
    if (lowerText.includes("tamil") || lowerText.includes("speak tamil")) return "ta"
    if (lowerText.includes("kannada") || lowerText.includes("speak kannada")) return "kn"
    if (lowerText.includes("malayalam") || lowerText.includes("speak malayalam")) return "ml"
    if (lowerText.includes("bengali") || lowerText.includes("speak bengali")) return "bn"
    if (lowerText.includes("gujarati") || lowerText.includes("speak gujarati")) return "gu"

    // Native language commands
    if (lowerText.includes("हिंदी") || lowerText.includes("हिंदी में बोलो")) return "hi"
    if (lowerText.includes("తెలుగు") || lowerText.includes("తెలుగులో మాట్లాడు")) return "te"
    if (lowerText.includes("தமிழ்") || lowerText.includes("தமிழில் பேசு")) return "ta"
    if (lowerText.includes("ಕನ್ನಡ") || lowerText.includes("ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡು")) return "kn"
    if (lowerText.includes("മലയാളം") || lowerText.includes("മലയാളത്തിൽ സംസാരിക്കുക")) return "ml"
    if (lowerText.includes("বাংলা") || lowerText.includes("বাংলায় কথা বলুন")) return "bn"
    if (lowerText.includes("ગુજરાતી") || lowerText.includes("ગુજરાતીમાં બોલો")) return "gu"

    return null
  }

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel()
      setIsSpeaking(false)
      setVoiceStatus("idle")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      sendMessage()
    }
  }

  const handleLanguageSelect = (langCode: string, isVoiceCommand = false) => {
    setCurrentLanguage(langCode)
    localStorage.setItem("selectedLanguage", langCode)
    localStorage.setItem("hasSelectedLanguage", "true")
    setShowLanguageSelection(false)
    setIsFirstTime(false)

    // Update speech recognition language
    if (recognitionRef.current) {
      recognitionRef.current.lang = languageMap[langCode] || "en-US"
      console.log("[v0] Updated speech recognition language to:", languageMap[langCode] || "en-US")
    }

    const langVoices = getLanguageVoicesForLang(langCode)
    if (langVoices.length > 0) {
      const voiceIndex = availableVoices.indexOf(langVoices[0])
      setVoiceSettings((prev) => ({ ...prev, voiceIndex }))
      console.log("[v0] Auto-selected voice for", langCode, ":", langVoices[0].name)
    } else {
      // Try to find any voice that supports the language
      const fallbackVoices = availableVoices.filter((voice) =>
        voice.lang.toLowerCase().includes(languageMap[langCode]?.toLowerCase().split("-")[0] || "en"),
      )
      if (fallbackVoices.length > 0) {
        const voiceIndex = availableVoices.indexOf(fallbackVoices[0])
        setVoiceSettings((prev) => ({ ...prev, voiceIndex }))
        console.log("[v0] Auto-selected fallback voice for", langCode, ":", fallbackVoices[0].name)
      }
    }

    // Speak confirmation in selected language
    if (voiceMode !== "off" && !isVoiceCommand) {
      const confirmationMessages = {
        en: "Language set to English. How can I help you with farming today?",
        hi: "भाषा हिंदी में सेट की गई। आज मैं आपकी खेती में कैसे मदद कर सकता हूं?",
        te: "భాష తెలుగులో సెట్ చేయబడింది. ఈరోజు వ్యవసాయంలో నేను మీకు ఎలా సహాయం చేయగలను?",
        ta: "மொழி தமிழில் அமைக்கப்பட்டது. இன்று விவசாயத்தில் நான் உங்களுக்கு எப்படி உதவ முடியும்?",
        kn: "ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಹೊಂದಿಸಲಾಗಿದೆ. ಇಂದು ಕೃಷಿಯಲ್ಲಿ ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
        ml: "ഭാഷ മലയാളത്തിലേക്ക് സജ്ജീകരിച്ചു. ഇന്ന് കൃഷിയിൽ ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?",
        bn: "ভাষা বাংলায় সেট করা হয়েছে। আজ কৃষিকাজে আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
        gu: "ભાષા ગુજરાતીમાં સેટ કરવામાં આવી છે. આજે ખેતીમાં હું તમારી કેવી રીતે મદદ કરી શકું?",
      }

      const message = confirmationMessages[langCode as keyof typeof confirmationMessages] || confirmationMessages.en
      setTimeout(() => speakText(message), 500)
    }
  }

  useEffect(() => {
    const handleOnline = () => {
      console.log("[v0] Network status: Online")
      setIsOnline(true)
    }
    const handleOffline = () => {
      console.log("[v0] Network status: Offline")
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    const checkOnlineStatus = async () => {
      try {
        const response = await fetch("/api/health", {
          method: "HEAD",
          cache: "no-cache",
          signal: AbortSignal.timeout(5000),
        })
        setIsOnline(response.ok)
      } catch {
        setIsOnline(false)
      }
    }

    // Initial check
    checkOnlineStatus()
    setIsOnline(navigator.onLine)

    const savedLanguage = localStorage.getItem("selectedLanguage") || "en"
    const hasSelectedLanguage = localStorage.getItem("hasSelectedLanguage")

    setCurrentLanguage(savedLanguage)
    setIsFirstTime(!hasSelectedLanguage)

    // Show language selection on first visit
    if (!hasSelectedLanguage) {
      setShowLanguageSelection(true)
    }

    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false // Changed to false for better control
        recognitionRef.current.interimResults = true
        recognitionRef.current.maxAlternatives = 1
        recognitionRef.current.lang = languageMap[savedLanguage] || "en-US"

        recognitionRef.current.onstart = () => {
          console.log("[v0] Speech recognition started")
          recognitionStateRef.current = "active"
          setIsListening(true)
          setVoiceStatus("listening")
        }

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          setInterimTranscript(interimTranscript)

          if (finalTranscript) {
            console.log("[v0] Final transcript:", finalTranscript)

            const languageCommand = detectLanguageCommand(finalTranscript)
            if (languageCommand && showLanguageSelection) {
              handleLanguageSelect(languageCommand, true)
              setInterimTranscript("")
              return
            }

            const hasExplicitLanguageSelection = localStorage.getItem("hasSelectedLanguage") === "true"
            if (!hasExplicitLanguageSelection) {
              const detectedLang = detectLanguageFromText(finalTranscript)
              if (detectedLang !== currentLanguage) {
                console.log("[v0] Language detected:", detectedLang)
                setCurrentLanguage(detectedLang)
                localStorage.setItem("selectedLanguage", detectedLang)
              }
            }

            setInputText((prev) => prev + finalTranscript)
            setInterimTranscript("")
            lastSpeechTimeRef.current = Date.now()

            if (voiceMode === "continuous") {
              if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
              }
              debounceTimeoutRef.current = setTimeout(() => {
                if (finalTranscript.trim()) {
                  setVoiceStatus("processing")
                  sendMessage()
                }
              }, 2000) // Wait 2 seconds after final speech
            }
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("[v0] Speech recognition error:", event.error)

          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            recognitionStateRef.current = "inactive"
            setIsListening(false)
            setVoiceStatus("idle")
            setInterimTranscript("")
            shouldRestartRef.current = false
            alert("Microphone access denied. Please allow microphone access and try again.")
            return
          }

          recognitionStateRef.current = "inactive"
          setIsListening(false)
          setVoiceStatus("idle")
          setInterimTranscript("")
          shouldRestartRef.current = false
        }

        recognitionRef.current.onend = () => {
          console.log("[v0] Speech recognition ended")
          recognitionStateRef.current = "inactive"
          setIsListening(false)

          if (voiceMode === "continuous" && shouldRestartRef.current && voiceStatus !== "processing") {
            setVoiceStatus("idle")
            scheduleRestart()
          } else {
            setVoiceStatus("idle")
          }
        }

        recognitionRef.current.onspeechstart = () => {
          console.log("[v0] Speech detected")
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current)
          }
        }

        recognitionRef.current.onspeechend = () => {
          console.log("[v0] Speech ended")
          if (voiceMode === "push-to-talk") {
            setTimeout(() => {
              if (recognitionStateRef.current === "active") {
                stopListening()
              }
            }, 1500) // Increased timeout for better user experience
          }
        }
      } else {
        console.warn("[v0] Speech recognition not supported in this browser")
      }
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthesisRef.current = window.speechSynthesis

      const loadVoices = () => {
        const voices = synthesisRef.current?.getVoices() || []
        setAvailableVoices(voices)

        const langVoices = voices.filter((voice) =>
          voice.lang.startsWith(languageMap[currentLanguage]?.split("-")[0] || "en"),
        )
        if (langVoices.length > 0) {
          const voiceIndex = voices.indexOf(langVoices[0])
          setVoiceSettings((prev) => ({ ...prev, voiceIndex }))
        }
      }

      loadVoices()
      if (synthesisRef.current) {
        synthesisRef.current.onvoiceschanged = loadVoices
      }
    }

    const savedMessages = localStorage.getItem("chatHistory")
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }

    const savedVoiceSettings = localStorage.getItem("voiceSettings")
    if (savedVoiceSettings) {
      setVoiceSettings(JSON.parse(savedVoiceSettings))
    }

    const savedVoiceMode = localStorage.getItem("voiceMode") as "off" | "push-to-talk" | "continuous"
    if (savedVoiceMode) {
      setVoiceMode(savedVoiceMode)
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      if (recognitionRef.current && recognitionStateRef.current !== "inactive") {
        shouldRestartRef.current = false
        recognitionRef.current.stop()
        recognitionStateRef.current = "inactive"
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("voiceSettings", JSON.stringify(voiceSettings))
  }, [voiceSettings])

  useEffect(() => {
    localStorage.setItem("voiceMode", voiceMode)
  }, [voiceMode])

  useEffect(() => {
    if (voiceMode === "continuous" && !isListening && recognitionStateRef.current === "inactive") {
      startListening()
    } else if (voiceMode !== "continuous" && isListening) {
      stopListening()
    }
  }, [voiceMode])

  const scheduleRestart = () => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
    }

    restartTimeoutRef.current = setTimeout(() => {
      if (voiceMode === "continuous" && shouldRestartRef.current && recognitionStateRef.current === "inactive") {
        startListening()
      }
    }, 3000) // Increased from 1000ms to 3000ms for better stability
  }

  const startListening = () => {
    if (!recognitionRef.current) {
      console.log("[v0] Speech recognition not available")
      alert("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.")
      return
    }

    if (recognitionStateRef.current !== "inactive") {
      console.log("[v0] Speech recognition not ready, current state:", recognitionStateRef.current)
      return
    }

    const now = Date.now()
    if (now - lastSpeechTimeRef.current < 2000) {
      console.log("[v0] Debouncing speech recognition start")
      return
    }

    try {
      console.log("[v0] Starting speech recognition")
      recognitionStateRef.current = "starting"
      shouldRestartRef.current = voiceMode === "continuous"
      recognitionRef.current.lang = languageMap[currentLanguage] || "en-US"
      recognitionRef.current.start()
    } catch (error) {
      console.error("[v0] Failed to start speech recognition:", error)
      recognitionStateRef.current = "inactive"
      setIsListening(false)
      setVoiceStatus("idle")
      shouldRestartRef.current = false
      alert("Failed to start voice recognition. Please check your microphone permissions.")
    }
  }

  const stopListening = () => {
    shouldRestartRef.current = false

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    if (recognitionRef.current && recognitionStateRef.current !== "inactive") {
      console.log("[v0] Stopping speech recognition")
      recognitionStateRef.current = "stopping"
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.error("[v0] Error stopping speech recognition:", error)
        recognitionStateRef.current = "inactive"
      }
      setIsListening(false)
      setVoiceStatus("idle")
      setInterimTranscript("")
    }
  }

  const getLanguageVoicesForLang = (langCode: string) => {
    const targetLang = languageMap[langCode]?.split("-")[0] || "en"
    console.log("[v0] Looking for voices for language code:", langCode, "mapped to:", targetLang)
    console.log(
      "[v0] All available voices:",
      availableVoices.map((v) => `${v.name} (${v.lang})`),
    )

    const matchedVoices = availableVoices.filter((voice) => {
      const voiceLang = voice.lang.toLowerCase()
      const voiceName = voice.name.toLowerCase()
      const targetLangLower = targetLang.toLowerCase()

      // Enhanced detection patterns for regional languages
      const regionalPatterns = {
        ta: ["tamil", "ta-", "ta_", "தமிழ்"],
        hi: ["hindi", "hi-", "hi_", "हिंदी", "devanagari"],
        te: ["telugu", "te-", "te_", "తెలుగు"],
        kn: ["kannada", "kn-", "kn_", "ಕನ್ನಡ"],
        ml: ["malayalam", "ml-", "ml_", "മലയാളം"],
        bn: ["bengali", "bangla", "bn-", "bn_", "বাংলা"],
        gu: ["gujarati", "gu-", "gu_", "ગુજરાતી"],
      }

      // Check for exact language match
      if (voiceLang.startsWith(targetLangLower + "-") || voiceLang === targetLangLower) {
        console.log("[v0] Exact language match found:", voice.name, voice.lang)
        return true
      }

      // Check for regional patterns in voice name or language
      const patterns = regionalPatterns[langCode as keyof typeof regionalPatterns] || []
      for (const pattern of patterns) {
        if (voiceName.includes(pattern) || voiceLang.includes(pattern)) {
          console.log("[v0] Regional pattern match found:", voice.name, voice.lang, "pattern:", pattern)
          return true
        }
      }

      // Partial match for similar languages
      if (voiceLang.includes(targetLangLower)) {
        console.log("[v0] Partial match found:", voice.name, voice.lang)
        return true
      }

      return false
    })

    console.log(
      "[v0] Matched voices for",
      langCode,
      ":",
      matchedVoices.map((v) => `${v.name} (${v.lang})`),
    )
    return matchedVoices
  }

  const TTS_API_KEY = "d51db941ebfa49185d2610b4110638a5c4f906ff"

  const speakWithExternalTTS = async (text: string, language: string): Promise<boolean> => {
    try {
      console.log("[v0] Attempting external TTS for language:", language)

      // Map language codes to API format
      const languageMapping = {
        ta: "ta-IN",
        te: "te-IN",
        hi: "hi-IN",
        kn: "kn-IN",
        ml: "ml-IN",
        bn: "bn-IN",
        gu: "gu-IN",
        en: "en-IN",
      }

      const apiLanguage = languageMapping[language as keyof typeof languageMapping] || "en-IN"

      // Try ElevenLabs API first (supports Tamil)
      try {
        console.log("[v0] Trying ElevenLabs API for", language)
        const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": TTS_API_KEY,
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        })

        if (response.ok) {
          const audioBlob = await response.blob()
          const audioUrl = URL.createObjectURL(audioBlob)
          const audio = new Audio(audioUrl)

          audio.onplay = () => {
            console.log("[v0] ElevenLabs TTS playback started")
            setIsSpeaking(true)
            setVoiceStatus("speaking")
          }

          audio.onended = () => {
            console.log("[v0] ElevenLabs TTS playback ended")
            setIsSpeaking(false)
            setVoiceStatus("idle")
            URL.revokeObjectURL(audioUrl)
          }

          audio.onerror = () => {
            console.error("[v0] ElevenLabs TTS audio playback error")
            setIsSpeaking(false)
            setVoiceStatus("idle")
            URL.revokeObjectURL(audioUrl)
          }

          await audio.play()
          console.log("[v0] Successfully used ElevenLabs TTS for", language)
          return true
        }
      } catch (error) {
        console.log("[v0] ElevenLabs API failed:", error)
      }

      // Try Resemble AI with correct endpoint
      try {
        console.log("[v0] Trying Resemble AI for", language)
        const response = await fetch("https://f.cluster.resemble.ai/synthesize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TTS_API_KEY}`,
          },
          body: JSON.stringify({
            voice_uuid: "default",
            data: text,
            sample_rate: 22050,
            output_format: "mp3",
          }),
        })

        if (response.ok) {
          const audioBlob = await response.blob()
          const audioUrl = URL.createObjectURL(audioBlob)
          const audio = new Audio(audioUrl)

          audio.onplay = () => {
            console.log("[v0] Resemble AI TTS playback started")
            setIsSpeaking(true)
            setVoiceStatus("speaking")
          }

          audio.onended = () => {
            console.log("[v0] Resemble AI TTS playback ended")
            setIsSpeaking(false)
            setVoiceStatus("idle")
            URL.revokeObjectURL(audioUrl)
          }

          audio.onerror = () => {
            console.error("[v0] Resemble AI TTS audio playback error")
            setIsSpeaking(false)
            setVoiceStatus("idle")
            URL.revokeObjectURL(audioUrl)
          }

          await audio.play()
          console.log("[v0] Successfully used Resemble AI TTS for", language)
          return true
        }
      } catch (error) {
        console.log("[v0] Resemble AI failed:", error)
      }

      return false
    } catch (error) {
      console.error("[v0] External TTS error:", error)
      return false
    }
  }

  const speakText = async (text: string, responseLanguage?: string) => {
    if (voiceMode === "off" || !text.trim()) return

    try {
      const targetLanguage = responseLanguage || currentLanguage
      console.log("[v0] Attempting to speak in language:", targetLanguage)

      const regionalLanguages = ["ta", "te", "hi", "kn", "ml", "bn", "gu"]
      if (regionalLanguages.includes(targetLanguage)) {
        console.log("[v0] Trying external TTS for regional language:", targetLanguage)
        const externalSuccess = await speakWithExternalTTS(text, targetLanguage)
        if (externalSuccess) {
          return // Successfully used external TTS
        }
        console.log("[v0] External TTS failed, falling back to Web Speech API")
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = voiceSettings.rate
      utterance.pitch = voiceSettings.pitch
      utterance.volume = voiceSettings.volume

      const languageVoices = getLanguageVoicesForLang(targetLanguage)
      let selectedVoice = null
      let selectedLang = languageMap[targetLanguage] || "en-US"

      if (languageVoices.length > 0) {
        // Prioritize Microsoft voices over Google for better quality
        const microsoftVoices = languageVoices.filter((voice) => voice.name.toLowerCase().includes("microsoft"))
        selectedVoice = microsoftVoices.length > 0 ? microsoftVoices[0] : languageVoices[0]
        selectedLang = selectedVoice.lang
        console.log("[v0] Using native language voice:", selectedVoice.name, "for language:", targetLanguage)
      } else {
        // Enhanced fallback logic for regional languages
        const regionalFallbacks = {
          ta: ["en-in", "india", "heera", "ravi"],
          te: ["en-in", "india", "heera", "ravi"],
          hi: ["en-in", "india", "heera", "ravi"],
          kn: ["en-in", "india", "heera", "ravi"],
          ml: ["en-in", "india", "heera", "ravi"],
          bn: ["en-in", "india", "heera", "ravi"],
          gu: ["en-in", "india", "heera", "ravi"],
        }

        const fallbackPatterns = regionalFallbacks[targetLanguage as keyof typeof regionalFallbacks] || [
          "en-us",
          "en-gb",
        ]

        for (const pattern of fallbackPatterns) {
          const candidateVoices = availableVoices.filter(
            (voice) => voice.lang.toLowerCase().includes(pattern) || voice.name.toLowerCase().includes(pattern),
          )

          if (candidateVoices.length > 0) {
            // Prioritize Microsoft voices
            const microsoftCandidates = candidateVoices.filter((voice) =>
              voice.name.toLowerCase().includes("microsoft"),
            )
            selectedVoice = microsoftCandidates.length > 0 ? microsoftCandidates[0] : candidateVoices[0]

            // Set appropriate language for Indian English voices
            if (pattern.includes("in") || pattern.includes("india")) {
              selectedLang = "en-IN"
            } else {
              selectedLang = selectedVoice.lang
            }

            console.log("[v0] Using regional fallback voice:", selectedVoice.name, "for language:", targetLanguage)
            break
          }
        }

        // Final fallback to any available voice
        if (!selectedVoice && availableVoices.length > 0) {
          const microsoftVoices = availableVoices.filter((voice) => voice.name.toLowerCase().includes("microsoft"))
          selectedVoice = microsoftVoices.length > 0 ? microsoftVoices[0] : availableVoices[0]
          selectedLang = selectedVoice.lang || "en-US"
          console.log("[v0] Using final fallback voice:", selectedVoice.name)
        }

        // Show user guidance for missing regional voices
        if (["ta", "te", "hi", "kn", "ml", "bn", "gu"].includes(targetLanguage) && selectedVoice) {
          const languageNames = {
            ta: "Tamil",
            te: "Telugu",
            hi: "Hindi",
            kn: "Kannada",
            ml: "Malayalam",
            bn: "Bengali",
            gu: "Gujarati",
          }

          const langName = languageNames[targetLanguage as keyof typeof languageNames]
          console.log(
            `[v0] 🔊 Using ${selectedVoice.name} for ${langName} text. External TTS failed, using browser fallback.`,
          )
        }
      }

      utterance.lang = selectedLang
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }

      console.log(
        "[v0] Speaking text in language:",
        utterance.lang,
        "with voice:",
        utterance.voice?.name || "browser default",
      )

      utterance.onstart = () => {
        console.log("[v0] Speech synthesis started")
        setIsSpeaking(true)
        setVoiceStatus("speaking")
      }

      utterance.onend = () => {
        console.log("[v0] Speech synthesis ended")
        setIsSpeaking(false)
        setVoiceStatus("idle")
      }

      utterance.onerror = (event) => {
        console.error("[v0] Speech synthesis error:", event.error)
        setIsSpeaking(false)
        setVoiceStatus("idle")

        // Provide helpful error messages
        if (event.error === "not-allowed") {
          console.log("[v0] 🚫 Speech synthesis not allowed. Please check browser permissions.")
        } else if (event.error === "network") {
          console.log("[v0] 🌐 Network error in speech synthesis. Check internet connection.")
        }
      }

      speechSynthesis.speak(utterance)
    } catch (error) {
      console.error("[v0] Error in speakText:", error)
      setIsSpeaking(false)
      setVoiceStatus("idle")
    }
  }

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const messageToSend = inputText
    setInputText("")
    setInterimTranscript("")
    setIsLoading(true)
    setVoiceStatus("processing")

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    try {
      if (!isOnline) {
        throw new Error("Offline mode")
      }

      console.log("[v0] Sending message with language:", currentLanguage)

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageToSend,
          chatHistory: messages.slice(-5),
          language: currentLanguage, // Use detected language
          requestRealTimeData: true,
          userLocation: await getCurrentLocation(),
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        console.error("[v0] API response not ok:", response.status, response.statusText)
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Received response in language:", currentLanguage)

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])

      if (voiceMode !== "off") {
        speakText(data.response)
      } else {
        setVoiceStatus("idle")
      }
    } catch (error) {
      console.error("[v0] Chat error:", error)
      const offlineResponse = getEnhancedOfflineResponse(messageToSend)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: offlineResponse,
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      if (voiceMode !== "off") {
        speakText(offlineResponse)
      } else {
        setVoiceStatus("idle")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        () => {
          resolve(null)
        },
        { timeout: 5000, maximumAge: 300000 },
      )
    })
  }

  const getEnhancedOfflineResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase()
    const responses = offlineResponses[currentLanguage as keyof typeof offlineResponses] || offlineResponses.en

    if (
      lowerMessage.includes("rice") ||
      lowerMessage.includes("धान") ||
      lowerMessage.includes("వరి") ||
      lowerMessage.includes("நெல்")
    ) {
      return `${responses.rice}\n\n📊 Current Season Tips:\n• Monitor water levels daily\n• Apply fertilizer in split doses\n• Watch for brown plant hopper\n• Harvest when 80% grains are golden`
    } else if (
      lowerMessage.includes("wheat") ||
      lowerMessage.includes("गेहूं") ||
      lowerMessage.includes("గోధుమ") ||
      lowerMessage.includes("கோதுமை")
    ) {
      return `${responses.wheat}\n\n📊 Current Season Tips:\n• Optimal sowing: November-December\n• Apply nitrogen in 3 splits\n• Monitor for rust diseases\n• Harvest when moisture is 20-25%`
    } else if (
      lowerMessage.includes("cotton") ||
      lowerMessage.includes("कपास") ||
      lowerMessage.includes("पత్తి") ||
      lowerMessage.includes("பருத்தி")
    ) {
      return `${responses.cotton}\n\n📊 Current Season Tips:\n• Plant spacing: 90x45 cm\n• Monitor for bollworm\n• Apply potash during flowering\n• Pick cotton in dry weather`
    } else if (
      lowerMessage.includes("weather") ||
      lowerMessage.includes("मौसम") ||
      lowerMessage.includes("వాతావరణం") ||
      lowerMessage.includes("வானிலை")
    ) {
      return `${responses.weather}\n\n🌤️ General Weather Guidance:\n• Check local weather daily\n• Plan irrigation based on rainfall\n• Protect crops during extreme weather\n• Use weather apps for 7-day forecasts`
    } else if (
      lowerMessage.includes("price") ||
      lowerMessage.includes("market") ||
      lowerMessage.includes("मंडी") ||
      lowerMessage.includes("మార్కెట్") ||
      lowerMessage.includes("சந்தை")
    ) {
      return `📈 Market Information:\n• Check daily mandi prices\n• Compare prices across markets\n• Consider transportation costs\n• Sell during peak demand periods\n• Use government price support schemes`
    } else if (
      lowerMessage.includes("disease") ||
      lowerMessage.includes("रोग") ||
      lowerMessage.includes("వ్యాధి") ||
      lowerMessage.includes("நோய்")
    ) {
      return `${responses.disease}\n\n🔬 Disease Management:\n• Early detection is key\n• Use resistant varieties\n• Maintain field hygiene\n• Consult agricultural extension officer\n• Follow integrated pest management`
    } else if (
      lowerMessage.includes("fertilizer") ||
      lowerMessage.includes("उर्वरक") ||
      lowerMessage.includes("ఎరువు") ||
      lowerMessage.includes("உரம்")
    ) {
      return `${responses.fertilizer}\n\n🌱 Fertilizer Guidelines:\n• Soil test before application\n• Use balanced NPK ratios\n• Apply organic matter regularly\n• Time application with crop needs\n• Follow recommended dosages`
    } else if (
      lowerMessage.includes("irrigation") ||
      lowerMessage.includes("सिंचाई") ||
      lowerMessage.includes("నీటిపారుదల") ||
      lowerMessage.includes("நீர்ப்பாசனம்")
    ) {
      return `${responses.irrigation}\n\n💧 Water Management:\n• Monitor soil moisture\n• Use drip irrigation for efficiency\n• Irrigate during cool hours\n• Maintain proper drainage\n• Conserve rainwater`
    } else if (
      lowerMessage.includes("loan") ||
      lowerMessage.includes("credit") ||
      lowerMessage.includes("ऋण") ||
      lowerMessage.includes("రుణం") ||
      lowerMessage.includes("கடன்")
    ) {
      return `💰 Agricultural Finance:\n• KCC (Kisan Credit Card) available\n• PM-KISAN scheme benefits\n• Crop insurance options\n• Self-help group loans\n• Contact nearest bank branch\n• Maintain proper documentation`
    } else if (
      lowerMessage.includes("subsidy") ||
      lowerMessage.includes("सब्सिडी") ||
      lowerMessage.includes("సబ్సిడీ") ||
      lowerMessage.includes("மானியம்")
    ) {
      return `🎯 Government Subsidies:\n• Fertilizer subsidies available\n• Seed subsidies for certified varieties\n• Equipment purchase subsidies\n• Solar pump subsidies\n• Check with agriculture department\n• Apply through online portals`
    } else {
      return `${responses.default}\n\n🌾 I can help you with:\n• Crop cultivation advice\n• Weather and market information\n• Disease and pest management\n• Fertilizer recommendations\n• Government schemes and subsidies\n• Irrigation techniques\n\nPlease ask specific questions for better assistance!`
    }
  }

  const handleVoiceModeChange = (mode: "off" | "push-to-talk" | "continuous") => {
    if (recognitionStateRef.current !== "inactive") {
      stopListening()
    }
    setVoiceMode(mode)
    setVoiceStatus("idle")
    if (mode === "off") {
      stopSpeaking()
      shouldRestartRef.current = false
    } else if (mode === "continuous") {
      // Start continuous listening after a short delay
      setTimeout(() => {
        if (recognitionStateRef.current === "inactive") {
          startListening()
        }
      }, 1000)
    }
  }

  const getLanguageVoices = () => {
    const langCode = languageMap[currentLanguage]?.split("-")[0] || "en"
    return availableVoices.filter((voice) => voice.lang.startsWith(langCode) || voice.lang.startsWith("en"))
  }

  const t = offlineTranslations[currentLanguage as keyof typeof offlineTranslations] || offlineTranslations.en

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <>
      {showLanguageSelection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <Card className="w-80 max-w-[90vw] shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-2">
                <Globe className="h-8 w-8 text-primary mr-2" />
                <CardTitle className="text-lg">Choose Your Language</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Select your preferred language for the agriculture assistant
              </p>
              {voiceMode !== "off" && (
                <p className="text-xs text-primary mt-2">
                  🎤 You can also say "Speak [Language]" or use voice commands
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                {languageOptions.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={currentLanguage === lang.code ? "default" : "outline"}
                    className="justify-start h-12 text-left"
                    onClick={() => handleLanguageSelect(lang.code)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{lang.name}</span>
                      <span className="text-xs opacity-70">{lang.nativeName}</span>
                    </div>
                  </Button>
                ))}
              </div>

              {voiceMode !== "off" && (
                <div className="border-t pt-3">
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`${voiceStatus === "listening" ? "bg-green-100 border-green-300 animate-pulse" : ""}`}
                      onMouseDown={startListening}
                      onMouseUp={stopListening}
                      onTouchStart={startListening}
                      onTouchEnd={stopListening}
                    >
                      {voiceStatus === "listening" ? (
                        <>
                          <MicOff className="h-4 w-4 mr-2 text-red-500" />
                          Listening...
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2 text-blue-500" />
                          Hold to Speak
                        </>
                      )}
                    </Button>
                  </div>
                  {interimTranscript && (
                    <p className="text-xs text-center mt-2 text-muted-foreground">"{interimTranscript}"</p>
                  )}
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setShowLanguageSelection(false)
                  setIsFirstTime(false)
                  localStorage.setItem("hasSelectedLanguage", "true")
                }}
              >
                Skip for now (English)
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <Card
        className={`fixed bottom-6 right-6 w-80 shadow-xl z-50 transition-all duration-300 ${
          isMinimized ? "h-14" : "h-96"
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="text-sm font-medium">{t.chatTitle}</CardTitle>
          <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-1 mr-2">
              {isOnline ? <Wifi className="h-3 w-3 text-green-400" /> : <WifiOff className="h-3 w-3 text-red-400" />}
              <span className="text-xs">{isOnline ? "" : t.offlineMode}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setShowLanguageSelection(true)}
              title="Change Language"
            >
              <Globe className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            {showVoiceSettings && (
              <div className="border-b p-3 bg-muted/50 space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Voice Mode</label>
                  <Select value={voiceMode} onValueChange={handleVoiceModeChange}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">Off</SelectItem>
                      <SelectItem value="push-to-talk">Push to Talk</SelectItem>
                      <SelectItem value="continuous">Continuous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Current Language</label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {languageOptions.find((l) => l.code === currentLanguage)?.nativeName || "English"}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setShowLanguageSelection(true)}>
                      Change
                    </Button>
                  </div>
                </div>

                {voiceMode !== "off" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Voice</label>
                      <Select
                        value={voiceSettings.voiceIndex.toString()}
                        onValueChange={(value) =>
                          setVoiceSettings((prev) => ({ ...prev, voiceIndex: Number.parseInt(value) }))
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getLanguageVoices().map((voice, index) => (
                            <SelectItem key={index} value={availableVoices.indexOf(voice).toString()}>
                              {voice.name} ({voice.lang})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* ... existing voice settings sliders ... */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs">Speed</label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={voiceSettings.rate}
                          onChange={(e) =>
                            setVoiceSettings((prev) => ({ ...prev, rate: Number.parseFloat(e.target.value) }))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs text-muted-foreground">{voiceSettings.rate}x</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs">Pitch</label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={voiceSettings.pitch}
                          onChange={(e) =>
                            setVoiceSettings((prev) => ({ ...prev, pitch: Number.parseFloat(e.target.value) }))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs text-muted-foreground">{voiceSettings.pitch}</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs">Volume</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={voiceSettings.volume}
                          onChange={(e) =>
                            setVoiceSettings((prev) => ({ ...prev, volume: Number.parseFloat(e.target.value) }))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs text-muted-foreground">{Math.round(voiceSettings.volume * 100)}%</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{t.welcomeMessage}</p>
                  <p className="text-xs mt-1">{t.welcomeSubtext}</p>
                  <p className="text-xs mt-2 text-primary">
                    🌐 Language: {languageOptions.find((l) => l.code === currentLanguage)?.nativeName || "English"}
                  </p>
                  {voiceMode !== "off" && (
                    <p className="text-xs mt-1 text-primary">
                      🎤 {voiceMode === "continuous" ? "Continuous listening active" : "Push to talk ready"}
                    </p>
                  )}
                </div>
              ) : (
                // ... existing messages display code ...
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          message.isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {message.text}
                        {!message.isUser && voiceMode !== "off" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-2 opacity-60 hover:opacity-100"
                            onClick={() => (isSpeaking ? stopSpeaking() : speakText(message.text))}
                          >
                            {isSpeaking ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-current rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-current rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* ... existing input and voice controls ... */}
            <div className="border-t p-3 space-y-2">
              {voiceMode === "continuous" && (
                <div className="flex items-center justify-center space-x-2 text-xs">
                  {voiceStatus === "listening" ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>🎤 Listening... Speak naturally!</span>
                    </div>
                  ) : voiceStatus === "processing" ? (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-spin"></div>
                      <span>🤔 Processing your message...</span>
                    </div>
                  ) : voiceStatus === "speaking" ? (
                    <div className="flex items-center space-x-2 text-purple-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span>🗣️ Speaking response...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-orange-600">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>🔄 Ready to listen...</span>
                    </div>
                  )}
                </div>
              )}

              {voiceMode === "push-to-talk" && (
                <div className="flex items-center justify-center space-x-2 text-xs">
                  {voiceStatus === "listening" ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>🎤 Listening... Release when done</span>
                    </div>
                  ) : (
                    <div className="text-blue-600">
                      <span>🎤 Hold mic button and speak</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Input
                  value={inputText + interimTranscript}
                  onChange={(e) => setInputText(e.target.value.replace(interimTranscript, ""))}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    voiceMode === "continuous"
                      ? "Speak naturally or type..."
                      : voiceMode === "push-to-talk"
                        ? "Hold mic and speak or type..."
                        : t.placeholder
                  }
                  className="flex-1 text-sm"
                  disabled={isLoading}
                />

                {voiceMode === "push-to-talk" && (
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-8 w-8 ${voiceStatus === "listening" ? "bg-red-100 border-red-300 animate-pulse" : "bg-transparent hover:bg-blue-50"}`}
                    onMouseDown={startListening}
                    onMouseUp={stopListening}
                    onTouchStart={startListening}
                    onTouchEnd={stopListening}
                    disabled={isLoading}
                    title="Hold to speak"
                  >
                    {voiceStatus === "listening" ? (
                      <MicOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Mic className="h-4 w-4 text-blue-500" />
                    )}
                  </Button>
                )}

                {voiceMode === "continuous" && (
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-8 w-8 ${voiceStatus === "listening" ? "bg-green-100 border-green-300" : "bg-transparent hover:bg-green-50"}`}
                    onClick={voiceStatus === "listening" ? stopListening : startListening}
                    disabled={isLoading || voiceStatus === "processing" || voiceStatus === "speaking"}
                    title={voiceStatus === "listening" ? "Stop listening" : "Start continuous listening"}
                  >
                    {voiceStatus === "listening" ? (
                      <MicOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Mic className="h-4 w-4 text-green-500" />
                    )}
                  </Button>
                )}

                <Button onClick={sendMessage} disabled={!inputText.trim() || isLoading} size="icon" className="h-8 w-8">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </>
  )
}
