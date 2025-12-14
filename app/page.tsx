"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sprout, Globe, Mic, MicOff, Volume2, ArrowRight, HelpCircle, Phone, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import { getTranslation, type Language } from "@/lib/translations"

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
]

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

export default function LoginPage() {
  const [mobileNumber, setMobileNumber] = useState("")
  const [aadhaarNumber, setAadhaarNumber] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en")
  const [error, setError] = useState("")
  const [isListeningMobile, setIsListeningMobile] = useState(false)
  const [isListeningAadhaar, setIsListeningAadhaar] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState("")
  const [activeField, setActiveField] = useState<"mobile" | "aadhaar" | null>(null)
  const router = useRouter()
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem("preferredLanguage") as Language
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage)
    }

    // Initialize speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.maxAlternatives = 1
        recognitionRef.current.lang = languageMap[selectedLanguage] || "en-US"

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = ""
          let interim = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interim += transcript
            }
          }

          setInterimTranscript(interim)

          if (finalTranscript) {
            const cleanedText = finalTranscript.trim().toLowerCase()
            const originalText = finalTranscript.trim()
            
            // Handle mobile number input
            if (activeField === "mobile") {
              let mobileText = cleanedText
              
              // Handle regional language number words
              const numberMap: { [key: string]: string } = {
                // English
                "one": "1", "two": "2", "three": "3", "four": "4", "five": "5",
                "six": "6", "seven": "7", "eight": "8", "nine": "9", "zero": "0",
                // Hindi
                "एक": "1", "दो": "2", "तीन": "3", "चार": "4", "पांच": "5",
                "छह": "6", "सात": "7", "आठ": "8", "नौ": "9", "शून्य": "0",
                // Tamil
                "ஒன்று": "1", "இரண்டு": "2", "மூன்று": "3", "நான்கு": "4", "ஐந்து": "5",
                "ஆறு": "6", "ஏழு": "7", "எட்டு": "8", "ஒன்பது": "9", "பூஜ்யம்": "0",
                // Telugu
                "ఒకటి": "1", "రెండు": "2", "మూడు": "3", "నాలుగు": "4", "ఐదు": "5",
                "ఆరు": "6", "ఏడు": "7", "ఎనిమిది": "8", "తొమ్మిది": "9", "సున్నా": "0",
                // Kannada
                "ಒಂದು": "1", "ಎರಡು": "2", "ಮೂರು": "3", "ನಾಲ್ಕು": "4", "ಐದು": "5",
                "ಆರು": "6", "ಏಳು": "7", "ಎಂಟು": "8", "ಒಂಬತ್ತು": "9", "ಸೊನ್ನೆ": "0",
                // Malayalam
                "ഒന്ന്": "1", "രണ്ട്": "2", "മൂന്ന്": "3", "നാല്": "4", "അഞ്ച്": "5",
                "ആറ്": "6", "ഏഴ്": "7", "എട്ട്": "8", "ഒൻപത്": "9", "പൂജ്യം": "0",
                // Bengali
                "এক": "1", "দুই": "2", "তিন": "3", "চার": "4", "পাঁচ": "5",
                "ছয়": "6", "সাত": "7", "আট": "8", "নয়": "9", "শূন্য": "0",
                // Gujarati
                "એક": "1", "બે": "2", "ત્રણ": "3", "ચાર": "4", "પાંચ": "5",
                "છ": "6", "સાત": "7", "આઠ": "8", "નવ": "9", "શૂન્ય": "0",
              }
              
              // Replace number words with digits
              Object.keys(numberMap).forEach(word => {
                const regex = new RegExp(`\\s*${word}\\s*`, "gi")
                mobileText = mobileText.replace(regex, numberMap[word])
              })
              
              // Remove all non-digit characters except + for country code
              mobileText = mobileText.replace(/[^\d+]/g, "")
              
              // Limit to 10 digits (Indian mobile number) or 13 with country code
              if (mobileText.startsWith("+91")) {
                mobileText = mobileText.substring(0, 13)
              } else if (mobileText.startsWith("91") && mobileText.length > 10) {
                mobileText = mobileText.substring(2, 12)
              } else {
                mobileText = mobileText.substring(0, 10)
              }
              
              setMobileNumber(mobileText)
              setIsListeningMobile(false)
              setActiveField(null)
            }
            
            // Handle Aadhaar number input
            if (activeField === "aadhaar") {
              let aadhaarText = cleanedText
              
              // Handle regional language number words (same as mobile)
              const numberMap: { [key: string]: string } = {
                "one": "1", "two": "2", "three": "3", "four": "4", "five": "5",
                "six": "6", "seven": "7", "eight": "8", "nine": "9", "zero": "0",
                "एक": "1", "दो": "2", "तीन": "3", "चार": "4", "पांच": "5",
                "छह": "6", "सात": "7", "आठ": "8", "नौ": "9", "शून्य": "0",
                "ஒன்று": "1", "இரண்டு": "2", "மூன்று": "3", "நான்கு": "4", "ஐந்து": "5",
                "ஆறு": "6", "ஏழு": "7", "எட்டு": "8", "ஒன்பது": "9", "பூஜ்யம்": "0",
                "ఒకటి": "1", "రెండు": "2", "మూడు": "3", "నాలుగు": "4", "ఐదు": "5",
                "ఆరు": "6", "ఏడు": "7", "ఎనిమిది": "8", "తొమ్మిది": "9", "సున్నా": "0",
                "ಒಂದು": "1", "ಎರಡು": "2", "ಮೂರು": "3", "ನಾಲ್ಕು": "4", "ಐದು": "5",
                "ಆರು": "6", "ಏಳು": "7", "ಎಂಟು": "8", "ಒಂಬತ್ತು": "9", "ಸೊನ್ನೆ": "0",
                "ഒന്ന്": "1", "രണ്ട്": "2", "മൂന്ന്": "3", "നാല്": "4", "അഞ്ച്": "5",
                "ആറ്": "6", "ഏഴ്": "7", "എട്ട്": "8", "ഒൻപത്": "9", "പൂജ്യം": "0",
                "এক": "1", "দুই": "2", "তিন": "3", "চার": "4", "পাঁচ": "5",
                "ছয়": "6", "সাত": "7", "আট": "8", "নয়": "9", "শূন্য": "0",
                "એક": "1", "બે": "2", "ત્રણ": "3", "ચાર": "4", "પાંચ": "5",
                "છ": "6", "સાત": "7", "આઠ": "8", "નવ": "9", "શૂન્ય": "0",
              }
              
              // Replace number words with digits
              Object.keys(numberMap).forEach(word => {
                const regex = new RegExp(`\\s*${word}\\s*`, "gi")
                aadhaarText = aadhaarText.replace(regex, numberMap[word])
              })
              
              // Remove all non-digit characters and spaces
              aadhaarText = aadhaarText.replace(/[^\d]/g, "")
              
              // Limit to 12 digits (Aadhaar number)
              aadhaarText = aadhaarText.substring(0, 12)
              
              setAadhaarNumber(aadhaarText)
              setIsListeningAadhaar(false)
              setActiveField(null)
            }
            
            setInterimTranscript("")
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          setIsListeningMobile(false)
          setIsListeningAadhaar(false)
          setActiveField(null)
          setInterimTranscript("")
          
          if (event.error === "not-allowed") {
            const errorMsg = selectedLanguage === "en"
              ? "Please allow microphone access to use voice input"
              : selectedLanguage === "hi"
              ? "कृपया आवाज इनपुट का उपयोग करने के लिए माइक्रोफोन एक्सेस की अनुमति दें"
              : selectedLanguage === "ta"
              ? "குரல் உள்ளீட்டைப் பயன்படுத்த மைக்ரோஃபோன் அனுமதியை வழங்கவும்"
              : "Please allow microphone access"
            alert(errorMsg)
          }
        }

        recognitionRef.current.onend = () => {
          setIsListeningMobile(false)
          setIsListeningAadhaar(false)
          setActiveField(null)
          setInterimTranscript("")
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    }
  }, [selectedLanguage, activeField])

  const t = (key: keyof typeof import("@/lib/translations").translations.en) => {
    return getTranslation(selectedLanguage, key)
  }

  const startListening = (field: "mobile" | "aadhaar") => {
    if (!recognitionRef.current) {
      const errorMsg = selectedLanguage === "en"
        ? "Voice input is not supported in your browser. Please use Chrome, Edge, or Safari."
        : selectedLanguage === "hi"
        ? "आपके ब्राउज़र में आवाज इनपुट समर्थित नहीं है। कृपया Chrome, Edge, या Safari का उपयोग करें।"
        : selectedLanguage === "ta"
        ? "உங்கள் உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை. Chrome, Edge அல்லது Safari பயன்படுத்தவும்."
        : "Voice input not supported. Please use Chrome, Edge, or Safari."
      alert(errorMsg)
      return
    }

    setActiveField(field)
    
    if (field === "mobile") {
      setIsListeningMobile(true)
      setIsListeningAadhaar(false)
    } else {
      setIsListeningAadhaar(true)
      setIsListeningMobile(false)
    }

    try {
      recognitionRef.current.lang = languageMap[selectedLanguage] || "en-US"
      recognitionRef.current.start()
    } catch (error) {
      console.error("Failed to start speech recognition:", error)
      setIsListeningMobile(false)
      setIsListeningAadhaar(false)
      setActiveField(null)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        // Ignore errors
      }
    }
    setIsListeningMobile(false)
    setIsListeningAadhaar(false)
    setActiveField(null)
    setInterimTranscript("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    stopListening()

    if (!selectedLanguage) {
      setError(t("selectLanguageError"))
      return
    }

    if (!mobileNumber || !aadhaarNumber) {
      const errorMsg = selectedLanguage === "en"
        ? "Please fill in both mobile number and Aadhaar number"
        : selectedLanguage === "hi"
        ? "कृपया मोबाइल नंबर और आधार नंबर दोनों भरें"
        : selectedLanguage === "ta"
        ? "தயவுசெய்து மொபைல் எண் மற்றும் ஆதார் எண் இரண்டையும் நிரப்பவும்"
        : selectedLanguage === "te"
        ? "దయచేసి మొబైల్ నంబర్ మరియు ఆధార్ నంబర్ రెండింటినీ నింపండి"
        : selectedLanguage === "kn"
        ? "ದಯವಿಟ್ಟು ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮತ್ತು ಆಧಾರ್ ಸಂಖ್ಯೆ ಎರಡನ್ನೂ ನಮೂದಿಸಿ"
        : selectedLanguage === "ml"
        ? "ദയവായി മൊബൈൽ നമ്പറും ആധാർ നമ്പറും നൽകുക"
        : selectedLanguage === "bn"
        ? "অনুগ্রহ করে মোবাইল নম্বর এবং আধার নম্বর উভয়ই পূরণ করুন"
        : selectedLanguage === "gu"
        ? "કૃપા કરીને મોબાઇલ નંબર અને આધાર નંબર બંને ભરો"
        : "Please fill all fields"
      setError(errorMsg)
      return
    }

    // Validate mobile number (10 digits)
    const cleanMobile = mobileNumber.replace(/[^\d]/g, "")
    if (cleanMobile.length !== 10) {
      const errorMsg = selectedLanguage === "en"
        ? "Mobile number must be 10 digits"
        : selectedLanguage === "hi"
        ? "मोबाइल नंबर 10 अंकों का होना चाहिए"
        : selectedLanguage === "ta"
        ? "மொபைல் எண் 10 இலக்கங்களாக இருக்க வேண்டும்"
        : "Invalid mobile number"
      setError(errorMsg)
      return
    }

    // Validate Aadhaar number (12 digits)
    const cleanAadhaar = aadhaarNumber.replace(/[^\d]/g, "")
    if (cleanAadhaar.length !== 12) {
      const errorMsg = selectedLanguage === "en"
        ? "Aadhaar number must be 12 digits"
        : selectedLanguage === "hi"
        ? "आधार नंबर 12 अंकों का होना चाहिए"
        : selectedLanguage === "ta"
        ? "ஆதார் எண் 12 இலக்கங்களாக இருக்க வேண்டும்"
        : "Invalid Aadhaar number"
      setError(errorMsg)
      return
    }

    // Store language preference and user data
    localStorage.setItem("preferredLanguage", selectedLanguage)
    localStorage.setItem("userMobile", cleanMobile)
    localStorage.setItem("userAadhaar", cleanAadhaar)
    localStorage.setItem("userEmail", `${cleanMobile}@krishimitra.com`) // Generate email from mobile
    
    // In real app, verify mobile + Aadhaar linkage via API
    // For demo, accept any valid format
    router.push("/profile-setup")
  }

  const handleSkip = () => {
    stopListening()
    // Set default values for skip
    localStorage.setItem("preferredLanguage", selectedLanguage)
    localStorage.setItem("userMobile", "9999999999")
    localStorage.setItem("userAadhaar", "999999999999")
    localStorage.setItem("userEmail", "guest@krishimitra.com")
    
    // Check if profile exists, if yes go to dashboard, else profile-setup
    const profileData = localStorage.getItem("userProfile")
    if (profileData) {
      router.push("/dashboard")
    } else {
      router.push("/profile-setup")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Large Header with Icon */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Sprout className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">{t("appName")}</h1>
          </div>
          <p className="text-lg text-muted-foreground">{t("tagline")}</p>
        </div>

        <Card className="border-2 border-primary/20 shadow-2xl">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Volume2 className="h-6 w-6 text-primary" />
              {t("welcomeBack")}
            </CardTitle>
            <CardDescription className="text-center text-base">
              {t("signInDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Language Selection - Large and Prominent */}
              <div className="space-y-3">
                <Label htmlFor="language" className="flex items-center space-x-2 text-lg font-semibold">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>{t("preferredLanguage")}</span>
                </Label>
                <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as Language)}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder={t("selectLanguage")} />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} className="text-base py-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{lang.nativeName}</span>
                          <span className="text-muted-foreground">({lang.name})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile Number Input with Voice Button */}
              <div className="space-y-3">
                <Label htmlFor="mobile" className="text-lg font-semibold flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>{t("mobileNumber")}</span>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" title="You can type or speak your mobile number" />
                </Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder={selectedLanguage === "en" ? "9876543210" : "9876543210"}
                      value={mobileNumber + (activeField === "mobile" ? interimTranscript : "")}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, "").substring(0, 10)
                        setMobileNumber(value)
                      }}
                      className="bg-background h-12 text-base pr-12"
                      maxLength={10}
                    />
                    {isListeningMobile && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                          {selectedLanguage === "en" 
                            ? "Listening..."
                            : selectedLanguage === "hi"
                            ? "सुन रहे हैं..."
                            : selectedLanguage === "ta"
                            ? "கேட்கிறது..."
                            : selectedLanguage === "te"
                            ? "వింటున్నారు..."
                            : selectedLanguage === "kn"
                            ? "ಕೇಳುತ್ತಿದೆ..."
                            : selectedLanguage === "ml"
                            ? "കേൾക്കുന്നു..."
                            : selectedLanguage === "bn"
                            ? "শুনছি..."
                            : selectedLanguage === "gu"
                            ? "સાંભળી રહ્યા છે..."
                            : "Listening..."}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant={isListeningMobile ? "destructive" : "outline"}
                    size="icon"
                    className="h-12 w-12 shrink-0"
                    onClick={() => {
                      if (isListeningMobile) {
                        stopListening()
                      } else {
                        startListening("mobile")
                      }
                    }}
                    title={selectedLanguage === "en" ? "Click to speak your mobile number" : "Click to speak your mobile number"}
                  >
                    {isListeningMobile ? (
                      <MicOff className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-2">
                    <Mic className="h-4 w-4" />
                    {selectedLanguage === "en" 
                      ? "Voice Instructions:"
                      : selectedLanguage === "hi"
                      ? "आवाज निर्देश:"
                      : selectedLanguage === "ta"
                      ? "குரல் வழிமுறைகள்:"
                      : selectedLanguage === "te"
                      ? "వాయిస్ సూచనలు:"
                      : selectedLanguage === "kn"
                      ? "ಧ್ವನಿ ಸೂಚನೆಗಳು:"
                      : selectedLanguage === "ml"
                      ? "വോയ്‌സ് നിർദ്ദേശങ്ങൾ:"
                      : selectedLanguage === "bn"
                      ? "ভয়েস নির্দেশনা:"
                      : selectedLanguage === "gu"
                      ? "વૉઇસ સૂચનાઓ:"
                      : "Voice Instructions:"}
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    {selectedLanguage === "en" 
                      ? "Click 🎤 button, then say your 10-digit mobile number (e.g., 'nine eight seven six five four three two one zero')"
                      : selectedLanguage === "hi"
                      ? "🎤 बटन दबाएं, फिर अपना 10 अंकों का मोबाइल नंबर बोलें (जैसे, 'नौ आठ सात छह पांच चार तीन दो एक शून्य')"
                      : selectedLanguage === "ta"
                      ? "🎤 பொத்தானைக் கிளிக் செய்யவும், பிறகு உங்கள் 10 இலக்க மொபைல் எண்ணைச் சொல்லுங்கள்"
                      : selectedLanguage === "te"
                      ? "🎤 బటన్ నొక్కండి, తర్వాత మీ 10 అంకెల మొబైల్ నంబర్ చెప్పండి"
                      : selectedLanguage === "kn"
                      ? "🎤 ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ, ನಂತರ ನಿಮ್ಮ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ಹೇಳಿ"
                      : selectedLanguage === "ml"
                      ? "🎤 ബട്ടൺ ക്ലിക്ക് ചെയ്യുക, തുടർന്ന് നിങ്ങളുടെ 10 അക്ക മൊബൈൽ നമ്പർ പറയുക"
                      : selectedLanguage === "bn"
                      ? "🎤 বোতাম টিপুন, তারপর আপনার 10 অঙ্কের মোবাইল নম্বর বলুন"
                      : selectedLanguage === "gu"
                      ? "🎤 બટન ક્લિક કરો, પછી તમારો 10 અંકનો મોબાઇલ નંબર કહો"
                      : "Click 🎤 button and speak your mobile number"}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {selectedLanguage === "en" 
                      ? "Or simply type: 9876543210"
                      : selectedLanguage === "hi"
                      ? "या बस टाइप करें: 9876543210"
                      : selectedLanguage === "ta"
                      ? "அல்லது வெறுமனே தட்டச்சு செய்யுங்கள்: 9876543210"
                      : selectedLanguage === "te"
                      ? "లేదా కేవలం టైప్ చేయండి: 9876543210"
                      : selectedLanguage === "kn"
                      ? "ಅಥವಾ ಸರಳವಾಗಿ ಟೈಪ್ ಮಾಡಿ: 9876543210"
                      : selectedLanguage === "ml"
                      ? "അല്ലെങ്കിൽ ലളിതമായി ടൈപ്പ് ചെയ്യുക: 9876543210"
                      : selectedLanguage === "bn"
                      ? "অথবা শুধু টাইপ করুন: 9876543210"
                      : selectedLanguage === "gu"
                      ? "અથવા ફક્ત ટાઇપ કરો: 9876543210"
                      : "Or type your mobile number"}
                  </p>
                </div>
              </div>

              {/* Aadhaar Number Input with Voice Button */}
              <div className="space-y-3">
                <Label htmlFor="aadhaar" className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span>{t("aadhaarNumber")}</span>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" title="You can type or speak your Aadhaar number" />
                </Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id="aadhaar"
                      type="text"
                      placeholder={selectedLanguage === "en" ? "1234 5678 9012" : "1234 5678 9012"}
                      value={aadhaarNumber + (activeField === "aadhaar" ? interimTranscript : "")}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, "").substring(0, 12)
                        setAadhaarNumber(value)
                      }}
                      className="bg-background h-12 text-base pr-12"
                      maxLength={12}
                    />
                    {isListeningAadhaar && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                          {selectedLanguage === "en" 
                            ? "Listening..."
                            : selectedLanguage === "hi"
                            ? "सुन रहे हैं..."
                            : selectedLanguage === "ta"
                            ? "கேட்கிறது..."
                            : selectedLanguage === "te"
                            ? "వింటున్నారు..."
                            : selectedLanguage === "kn"
                            ? "ಕೇಳುತ್ತಿದೆ..."
                            : selectedLanguage === "ml"
                            ? "കേൾക്കുന്നു..."
                            : selectedLanguage === "bn"
                            ? "শুনছি..."
                            : selectedLanguage === "gu"
                            ? "સાંભળી રહ્યા છે..."
                            : "Listening..."}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant={isListeningAadhaar ? "destructive" : "outline"}
                    size="icon"
                    className="h-12 w-12 shrink-0"
                    onClick={() => {
                      if (isListeningAadhaar) {
                        stopListening()
                      } else {
                        startListening("aadhaar")
                      }
                    }}
                    title={selectedLanguage === "en" ? "Click to speak your Aadhaar number" : "Click to speak your Aadhaar number"}
                  >
                    {isListeningAadhaar ? (
                      <MicOff className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs font-medium text-green-900 dark:text-green-100 flex items-center gap-2 mb-2">
                    <Mic className="h-4 w-4" />
                    {selectedLanguage === "en" 
                      ? "Voice Instructions:"
                      : selectedLanguage === "hi"
                      ? "आवाज निर्देश:"
                      : selectedLanguage === "ta"
                      ? "குரல் வழிமுறைகள்:"
                      : selectedLanguage === "te"
                      ? "వాయిస్ సూచనలు:"
                      : selectedLanguage === "kn"
                      ? "ಧ್ವನಿ ಸೂಚನೆಗಳು:"
                      : selectedLanguage === "ml"
                      ? "വോയ്‌സ് നിർദ്ദേശങ്ങൾ:"
                      : selectedLanguage === "bn"
                      ? "ভয়েস নির্দেশনা:"
                      : selectedLanguage === "gu"
                      ? "વૉઇસ સૂચનાઓ:"
                      : "Voice Instructions:"}
                  </p>
                  <p className="text-xs text-green-800 dark:text-green-200">
                    {selectedLanguage === "en" 
                      ? "Click 🎤 button, then say your 12-digit Aadhaar number (e.g., 'one two three four five six seven eight nine zero one two')"
                      : selectedLanguage === "hi"
                      ? "🎤 बटन दबाएं, फिर अपना 12 अंकों का आधार नंबर बोलें (जैसे, 'एक दो तीन चार पांच छह सात आठ नौ शून्य एक दो')"
                      : selectedLanguage === "ta"
                      ? "🎤 பொத்தானைக் கிளிக் செய்யவும், பிறகு உங்கள் 12 இலக்க ஆதார் எண்ணைச் சொல்லுங்கள்"
                      : selectedLanguage === "te"
                      ? "🎤 బటన్ నొక్కండి, తర్వాత మీ 12 అంకెల ఆధార్ నంబర్ చెప్పండి"
                      : selectedLanguage === "kn"
                      ? "🎤 ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ, ನಂತರ ನಿಮ್ಮ 12 ಅಂಕಿಯ ಆಧಾರ್ ಸಂಖ್ಯೆಯನ್ನು ಹೇಳಿ"
                      : selectedLanguage === "ml"
                      ? "🎤 ബട്ടൺ ക്ലിക്ക് ചെയ്യുക, തുടർന്ന് നിങ്ങളുടെ 12 അക്ക ആധാർ നമ്പർ പറയുക"
                      : selectedLanguage === "bn"
                      ? "🎤 বোতাম টিপুন, তারপর আপনার 12 অঙ্কের আধার নম্বর বলুন"
                      : selectedLanguage === "gu"
                      ? "🎤 બટન ક્લિક કરો, પછી તમારો 12 અંકનો આધાર નંબર કહો"
                      : "Click 🎤 button and speak your Aadhaar number"}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    {selectedLanguage === "en" 
                      ? "Or simply type: 123456789012"
                      : selectedLanguage === "hi"
                      ? "या बस टाइप करें: 123456789012"
                      : selectedLanguage === "ta"
                      ? "அல்லது வெறுமனே தட்டச்சு செய்யுங்கள்: 123456789012"
                      : selectedLanguage === "te"
                      ? "లేదా కేవలం టైప్ చేయండి: 123456789012"
                      : selectedLanguage === "kn"
                      ? "ಅಥವಾ ಸರಳವಾಗಿ ಟೈಪ್ ಮಾಡಿ: 123456789012"
                      : selectedLanguage === "ml"
                      ? "അല്ലെങ്കിൽ ലളിതമായി ടൈപ്പ് ചെയ്യുക: 123456789012"
                      : selectedLanguage === "bn"
                      ? "অথবা শুধু টাইপ করুন: 123456789012"
                      : selectedLanguage === "gu"
                      ? "અથવા ફક્ત ટાઇપ કરો: 123456789012"
                      : "Or type your Aadhaar number"}
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  {error}
                </div>
              )}

              {/* Large Login Button */}
              <Button 
                type="submit" 
                className="w-full h-16 text-xl font-bold flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 shadow-lg"
                disabled={!mobileNumber || !aadhaarNumber || mobileNumber.length !== 10 || aadhaarNumber.length !== 12}
              >
                <span>{t("signIn")}</span>
                <ArrowRight className="h-6 w-6" />
              </Button>
              
              {/* Visual Feedback */}
              {(!mobileNumber || !aadhaarNumber || mobileNumber.length !== 10 || aadhaarNumber.length !== 12) && (
                <p className="text-xs text-center text-muted-foreground">
                  {selectedLanguage === "en"
                    ? "Please fill in both mobile number (10 digits) and Aadhaar number (12 digits) to continue"
                    : selectedLanguage === "hi"
                    ? "कृपया जारी रखने के लिए मोबाइल नंबर (10 अंक) और आधार नंबर (12 अंक) दोनों भरें"
                    : selectedLanguage === "ta"
                    ? "தயவுசெய்து தொடர மொபைல் எண் (10 இலக்கங்கள்) மற்றும் ஆதார் எண் (12 இலக்கங்கள்) இரண்டையும் நிரப்பவும்"
                    : selectedLanguage === "te"
                    ? "దయచేసి కొనసాగించడానికి మొబైల్ నంబర్ (10 అంకెలు) మరియు ఆధార్ నంబర్ (12 అంకెలు) రెండింటినీ నింపండి"
                    : selectedLanguage === "kn"
                    ? "ದಯವಿಟ್ಟು ಮುಂದುವರಿಸಲು ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (10 ಅಂಕೆಗಳು) ಮತ್ತು ಆಧಾರ್ ಸಂಖ್ಯೆ (12 ಅಂಕೆಗಳು) ಎರಡನ್ನೂ ನಮೂದಿಸಿ"
                    : selectedLanguage === "ml"
                    ? "ദയവായി തുടരാൻ മൊബൈൽ നമ്പർ (10 അക്കങ്ങൾ) ഉം ആധാർ നമ്പർ (12 അക്കങ്ങൾ) ഉം നൽകുക"
                    : selectedLanguage === "bn"
                    ? "অনুগ্রহ করে চালিয়ে যেতে মোবাইল নম্বর (10 অঙ্ক) এবং আধার নম্বর (12 অঙ্ক) উভয়ই পূরণ করুন"
                    : selectedLanguage === "gu"
                    ? "કૃપા કરીને આગળ વધવા માટે મોબાઇલ નંબર (10 અંકો) અને આધાર નંબર (12 અંકો) બંને ભરો"
                    : "Please fill all fields"}
                </p>
              )}

              {/* Skip Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base"
                onClick={handleSkip}
              >
                {t("skipLogin")}
              </Button>

              {/* Demo Credentials - More Visual and Helpful */}
              <div className="text-sm text-muted-foreground text-center space-y-3 mt-6 p-5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/30 shadow-md">
                <div className="flex items-center justify-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <p className="font-bold text-lg text-foreground">
                    {selectedLanguage === "en"
                      ? "Quick Login (Demo)"
                      : selectedLanguage === "hi"
                      ? "त्वरित लॉगिन (डेमो)"
                      : selectedLanguage === "ta"
                      ? "விரைவு உள்நுழைவு (டெமோ)"
                      : selectedLanguage === "te"
                      ? "త్వరిత లాగిన్ (డెమో)"
                      : selectedLanguage === "kn"
                      ? "ತ್ವರಿತ ಲಾಗಿನ್ (ಡೆಮೋ)"
                      : selectedLanguage === "ml"
                      ? "ദ്രുത ലോഗിൻ (ഡെമോ)"
                      : selectedLanguage === "bn"
                      ? "দ্রুত লগইন (ডেমো)"
                      : selectedLanguage === "gu"
                      ? "ઝડપી લૉગિન (ડેમો)"
                      : t("demoCredentials")}
                  </p>
                </div>
                <div className="space-y-2 text-left bg-background/80 p-4 rounded-lg border-2 border-primary/20">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-primary text-base">📱 Mobile:</span>
                    <span className="font-mono font-semibold text-base">9876543210</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-primary text-base">🆔 Aadhaar:</span>
                    <span className="font-mono font-semibold text-base">123456789012</span>
                  </div>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="w-full mt-2 h-10 font-semibold"
                    onClick={() => {
                      setMobileNumber("9876543210")
                      setAadhaarNumber("123456789012")
                    }}
                  >
                    {selectedLanguage === "en"
                      ? "✨ Click Here to Auto-Fill Login Details"
                      : selectedLanguage === "hi"
                      ? "✨ लॉगिन विवरण स्वचालित रूप से भरने के लिए यहां क्लिक करें"
                      : selectedLanguage === "ta"
                      ? "✨ உள்நுழைவு விவரங்களை தானாக நிரப்ப இங்கே கிளிக் செய்யவும்"
                      : selectedLanguage === "te"
                      ? "✨ లాగిన్ వివరాలను స్వయంచాలకంగా నింపడానికి ఇక్కడ క్లిక్ చేయండి"
                      : selectedLanguage === "kn"
                      ? "✨ ಲಾಗಿನ್ ವಿವರಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಭರ್ತಿ ಮಾಡಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ"
                      : selectedLanguage === "ml"
                      ? "✨ ലോഗിൻ വിവരങ്ങൾ സ്വയമേവ പൂരിപ്പിക്കാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക"
                      : selectedLanguage === "bn"
                      ? "✨ লগইন বিবরণ স্বয়ংক্রিয়ভাবে পূরণ করতে এখানে ক্লিক করুন"
                      : selectedLanguage === "gu"
                      ? "✨ લૉગિન વિગતો સ્વચાલિત રીતે ભરવા માટે અહીં ક્લિક કરો"
                      : "✨ Click to Auto-Fill"}
                  </Button>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                    {selectedLanguage === "en"
                      ? "💡 Tip: Use Voice Input"
                      : selectedLanguage === "hi"
                      ? "💡 सुझाव: आवाज इनपुट का उपयोग करें"
                      : selectedLanguage === "ta"
                      ? "💡 உதவிக்குறிப்பு: குரல் உள்ளீட்டைப் பயன்படுத்தவும்"
                      : selectedLanguage === "te"
                      ? "💡 చిట్కా: వాయిస్ ఇన్పుట్ ఉపయోగించండి"
                      : selectedLanguage === "kn"
                      ? "💡 ಸಲಹೆ: ಧ್ವನಿ ಇನ್ಪುಟ್ ಬಳಸಿ"
                      : selectedLanguage === "ml"
                      ? "💡 നുറുങ്ങ്: വോയ്‌സ് ഇൻപുട്ട് ഉപയോഗിക്കുക"
                      : selectedLanguage === "bn"
                      ? "💡 টিপ: ভয়েস ইনপুট ব্যবহার করুন"
                      : selectedLanguage === "gu"
                      ? "💡 ટિપ્સ: વૉઇસ ઇનપુટ વાપરો"
                      : "💡 Tip: Use Voice Input"}
                  </p>
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    {selectedLanguage === "en"
                      ? "Click the 🎤 microphone button next to each field and speak in your language. The app will understand!"
                      : selectedLanguage === "hi"
                      ? "प्रत्येक फ़ील्ड के बगल में 🎤 माइक्रोफ़ोन बटन पर क्लिक करें और अपनी भाषा में बोलें। ऐप समझ जाएगा!"
                      : selectedLanguage === "ta"
                      ? "ஒவ்வொரு புலத்திற்கும் அடுத்துள்ள 🎤 மைக்ரோஃபோன் பொத்தானைக் கிளிக் செய்து உங்கள் மொழியில் பேசுங்கள். ஆப் புரிந்து கொள்ளும்!"
                      : selectedLanguage === "te"
                      ? "ప్రతి ఫీల్డ్ పక్కన ఉన్న 🎤 మైక్రోఫోన్ బటన్‌ను క్లిక్ చేసి మీ భాషలో మాట్లాడండి. యాప్ అర్థం చేసుకుంటుంది!"
                      : selectedLanguage === "kn"
                      ? "ಪ್ರತಿ ಫೀಲ್ಡ್ ಪಕ್ಕದಲ್ಲಿರುವ 🎤 ಮೈಕ್ರೋಫೋನ್ ಬಟನ್ ಅನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ. ಆಪ್ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತದೆ!"
                      : selectedLanguage === "ml"
                      ? "ഓരോ ഫീൽഡിനും അടുത്തുള്ള 🎤 മൈക്രോഫോൺ ബട്ടൺ ക്ലിക്ക് ചെയ്ത് നിങ്ങളുടെ ഭാഷയിൽ സംസാരിക്കുക. ആപ്പ് മനസ്സിലാക്കും!"
                      : selectedLanguage === "bn"
                      ? "প্রতিটি ক্ষেত্রের পাশে 🎤 মাইক্রোফোন বোতামে ক্লিক করুন এবং আপনার ভাষায় কথা বলুন। অ্যাপ বুঝতে পারবে!"
                      : selectedLanguage === "gu"
                      ? "દરેક ફીલ્ડની બાજુમાં 🎤 માઇક્રોફોન બટન ક્લિક કરો અને તમારી ભાષામાં બોલો. એપ સમજશે!"
                      : "Click 🎤 button and speak in your language"}
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
