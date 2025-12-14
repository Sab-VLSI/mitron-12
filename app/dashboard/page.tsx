"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Sprout,
  User,
  Settings,
  MapPin,
  Ruler,
  TrendingUp,
  RefreshCw,
  Calendar,
  Droplets,
  Thermometer,
  Cloud,
  TestTube,
  Beaker,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getTranslation, type Language } from "@/lib/translations"
import { DataSourceFooter } from "@/components/data-source-footer"
import { WeatherDashboard } from "@/components/weather-dashboard"
import { MarketDataDashboard } from "@/components/market-data-dashboard"

interface UserProfile {
  fullName: string
  country: string
  state: string
  district: string
  landType?: string
  measurementType: string
  length?: string
  width?: string
  totalArea?: string
  areaUnit?: string
  soilType?: string
  soilPH?: string
  organicMatter?: string
  drainageCondition?: string
  irrigationAvailable?: string
  previousCrop?: string
  soilDepth?: string
}

interface Crop {
  id: string
  name: string
  suitability: number
  varieties: CropVariety[]
  image: string
  season: string
  waterRequirement: string
  soilMatch: {
    matches: string[]
    concerns: string[]
  }
}

interface CropVariety {
  id: string
  name: string
  suitability: number
  duration: number
  yield: string
}

// Mock crop data based on regions
const cropDatabase: Record<string, Crop[]> = {
  "IN-Tamil Nadu": [
    {
      id: "rice",
      name: "Rice",
      suitability: 95,
      image: "/lush-green-rice-paddy.png",
      season: "Kharif & Rabi",
      waterRequirement: "High",
      varieties: [
        { id: "ir20", name: "IR20", suitability: 95, duration: 120, yield: "4-5 tons/hectare" },
        { id: "ponni", name: "Ponni", suitability: 92, duration: 135, yield: "5-6 tons/hectare" },
        { id: "basmati", name: "Basmati", suitability: 75, duration: 140, yield: "3-4 tons/hectare" },
      ],
    },
    {
      id: "sugarcane",
      name: "Sugarcane",
      suitability: 88,
      image: "/sugarcane-field.png",
      season: "Year-round",
      waterRequirement: "Very High",
      varieties: [
        { id: "co86032", name: "CO 86032", suitability: 88, duration: 365, yield: "80-100 tons/hectare" },
        { id: "co62175", name: "CO 62175", suitability: 85, duration: 350, yield: "75-90 tons/hectare" },
      ],
    },
    {
      id: "cotton",
      name: "Cotton",
      suitability: 82,
      image: "/cotton-field-white-bolls.png",
      season: "Kharif",
      waterRequirement: "Medium",
      varieties: [
        { id: "mch184", name: "MCH 184", suitability: 82, duration: 180, yield: "15-20 quintals/hectare" },
        { id: "suraj", name: "Suraj", suitability: 78, duration: 170, yield: "12-18 quintals/hectare" },
      ],
    },
    {
      id: "maize",
      name: "Maize",
      suitability: 78,
      image: "/corn-maize-field-yellow.png",
      season: "Kharif & Rabi",
      waterRequirement: "Medium",
      varieties: [
        { id: "nk6240", name: "NK 6240", suitability: 78, duration: 110, yield: "8-10 tons/hectare" },
        { id: "pioneer", name: "Pioneer 30V92", suitability: 75, duration: 115, yield: "7-9 tons/hectare" },
      ],
    },
    {
      id: "wheat",
      name: "Wheat",
      suitability: 65,
      image: "/golden-wheat-field.png",
      season: "Rabi",
      waterRequirement: "Medium",
      varieties: [
        { id: "hd2967", name: "HD 2967", suitability: 65, duration: 125, yield: "4-5 tons/hectare" },
        { id: "dbw88", name: "DBW 88", suitability: 62, duration: 130, yield: "3.5-4.5 tons/hectare" },
      ],
    },
  ],
  "IN-Karnataka": [
    {
      id: "rice",
      name: "Rice",
      suitability: 90,
      image: "/lush-green-rice-paddy.png",
      season: "Kharif & Rabi",
      waterRequirement: "High",
      varieties: [
        { id: "ir64", name: "IR64", suitability: 90, duration: 125, yield: "4.5-5.5 tons/hectare" },
        { id: "jgl1798", name: "JGL 1798", suitability: 87, duration: 120, yield: "4-5 tons/hectare" },
      ],
    },
    {
      id: "cotton",
      name: "Cotton",
      suitability: 85,
      image: "/cotton-field-white-bolls.png",
      season: "Kharif",
      waterRequirement: "Medium",
      varieties: [
        { id: "bunny", name: "Bunny Bt", suitability: 85, duration: 175, yield: "18-22 quintals/hectare" },
        { id: "rch2", name: "RCH 2", suitability: 82, duration: 180, yield: "16-20 quintals/hectare" },
      ],
    },
    {
      id: "sugarcane",
      name: "Sugarcane",
      suitability: 80,
      image: "/sugarcane-field.png",
      season: "Year-round",
      waterRequirement: "Very High",
      varieties: [{ id: "co419", name: "CO 419", suitability: 80, duration: 360, yield: "70-85 tons/hectare" }],
    },
  ],
  // Default crops for other regions
  default: [
    {
      id: "rice",
      name: "Rice",
      suitability: 85,
      image: "/lush-green-rice-paddy.png",
      season: "Kharif & Rabi",
      waterRequirement: "High",
      varieties: [
        { id: "ir64", name: "IR64", suitability: 85, duration: 125, yield: "4-5 tons/hectare" },
        { id: "swarna", name: "Swarna", suitability: 82, duration: 135, yield: "4.5-5.5 tons/hectare" },
      ],
    },
    {
      id: "wheat",
      name: "Wheat",
      suitability: 80,
      image: "/golden-wheat-field.png",
      season: "Rabi",
      waterRequirement: "Medium",
      varieties: [
        { id: "hd2967", name: "HD 2967", suitability: 80, duration: 125, yield: "4-5 tons/hectare" },
        { id: "pusa", name: "Pusa Gold", suitability: 78, duration: 130, yield: "4-4.5 tons/hectare" },
      ],
    },
    {
      id: "maize",
      name: "Maize",
      suitability: 75,
      image: "/corn-maize-field-yellow.png",
      season: "Kharif & Rabi",
      waterRequirement: "Medium",
      varieties: [{ id: "nk6240", name: "NK 6240", suitability: 75, duration: 110, yield: "7-9 tons/hectare" }],
    },
  ],
}

const calculateSoilSuitability = (crop: any, userProfile: UserProfile): number => {
  const baseSuitability = crop.suitability
  let soilAdjustment = 0

  // Soil type adjustments
  if (userProfile.soilType) {
    const soilPreferences = {
      rice: { clay: 15, loamy: 10, silt: 5, sandy: -10, peaty: 0, chalky: -5 },
      wheat: { loamy: 15, clay: 5, silt: 10, sandy: -5, peaty: -10, chalky: 0 },
      cotton: { clay: 10, loamy: 15, silt: 5, sandy: 0, peaty: -15, chalky: -5 },
      maize: { loamy: 15, clay: 5, silt: 10, sandy: 5, peaty: -5, chalky: 0 },
      sugarcane: { clay: 10, loamy: 15, silt: 5, sandy: -5, peaty: 5, chalky: -10 },
    }

    const cropPrefs = soilPreferences[crop.id as keyof typeof soilPreferences]
    if (cropPrefs && userProfile.soilType) {
      soilAdjustment += cropPrefs[userProfile.soilType as keyof typeof cropPrefs] || 0
    }
  }

  // pH adjustments
  if (userProfile.soilPH) {
    const phPreferences = {
      rice: { acidic: 10, neutral: 15, alkaline: -5 },
      wheat: { acidic: -5, neutral: 15, alkaline: 5 },
      cotton: { acidic: -10, neutral: 10, alkaline: 15 },
      maize: { acidic: 0, neutral: 15, alkaline: 5 },
      sugarcane: { acidic: 5, neutral: 15, alkaline: 0 },
    }

    const cropPhPrefs = phPreferences[crop.id as keyof typeof phPreferences]
    if (cropPhPrefs && userProfile.soilPH) {
      soilAdjustment += cropPhPrefs[userProfile.soilPH as keyof typeof cropPhPrefs] || 0
    }
  }

  // Drainage adjustments
  if (userProfile.drainageCondition) {
    const drainagePrefs = {
      rice: { poor: 15, moderate: 10, good: 5, excellent: 0 },
      wheat: { poor: -10, moderate: 5, good: 15, excellent: 10 },
      cotton: { poor: -15, moderate: 0, good: 15, excellent: 10 },
      maize: { poor: -10, moderate: 5, good: 15, excellent: 5 },
      sugarcane: { poor: -5, moderate: 10, good: 15, excellent: 5 },
    }

    const cropDrainagePrefs = drainagePrefs[crop.id as keyof typeof drainagePrefs]
    if (cropDrainagePrefs && userProfile.drainageCondition) {
      soilAdjustment += cropDrainagePrefs[userProfile.drainageCondition as keyof typeof cropDrainagePrefs] || 0
    }
  }

  // Irrigation adjustments
  if (userProfile.irrigationAvailable) {
    const irrigationPrefs = {
      rice: { none: -20, rainfed: -10, drip: 5, sprinkler: 10, flood: 15, borewell: 10 },
      wheat: { none: -15, rainfed: 0, drip: 15, sprinkler: 10, flood: 5, borewell: 10 },
      cotton: { none: -10, rainfed: 5, drip: 15, sprinkler: 10, flood: 0, borewell: 10 },
      maize: { none: -15, rainfed: 0, drip: 15, sprinkler: 10, flood: 5, borewell: 10 },
      sugarcane: { none: -25, rainfed: -15, drip: 10, sprinkler: 5, flood: 15, borewell: 15 },
    }

    const cropIrrigationPrefs = irrigationPrefs[crop.id as keyof typeof irrigationPrefs]
    if (cropIrrigationPrefs && userProfile.irrigationAvailable) {
      soilAdjustment += cropIrrigationPrefs[userProfile.irrigationAvailable as keyof typeof cropIrrigationPrefs] || 0
    }
  }

  return Math.min(100, Math.max(0, baseSuitability + soilAdjustment))
}

const getSoilMatchDetails = (crop: any, profile: UserProfile) => {
  const matches = []
  const concerns = []

  if (profile.soilType) {
    const soilTypeMatch = {
      rice: ["clay", "loamy"],
      wheat: ["loamy", "silt"],
      cotton: ["loamy", "clay"],
      maize: ["loamy", "silt"],
      sugarcane: ["loamy", "clay"],
    }

    if (soilTypeMatch[crop.id as keyof typeof soilTypeMatch]?.includes(profile.soilType)) {
      matches.push(`Excellent soil type match (${profile.soilType})`)
    } else {
      concerns.push(`Consider soil amendments for ${profile.soilType} soil`)
    }
  }

  if (profile.soilPH) {
    const phMatch = {
      rice: ["acidic", "neutral"],
      wheat: ["neutral", "alkaline"],
      cotton: ["neutral", "alkaline"],
      maize: ["neutral"],
      sugarcane: ["neutral", "acidic"],
    }

    if (phMatch[crop.id as keyof typeof phMatch]?.includes(profile.soilPH)) {
      matches.push(`Good pH level (${profile.soilPH})`)
    } else {
      concerns.push(`pH adjustment may be needed (currently ${profile.soilPH})`)
    }
  }

  return { matches, concerns }
}

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null)
  const [showVarieties, setShowVarieties] = useState(false)
  const [language, setLanguage] = useState<Language>("en")
  const [marketData, setMarketData] = useState<any>(null)
  const [weatherData, setWeatherData] = useState<any>(null)
  const [plantingAdvice, setPlantingAdvice] = useState<any>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const t = (key: keyof typeof import("@/lib/translations").translations.en) => {
    return getTranslation(language, key)
  }

  const fetchRealTimeData = async () => {
    setIsRefreshing(true)
    try {
      // Fetch market data
      const marketResponse = await fetch("/api/market-data")
      const marketData = await marketResponse.json()
      setMarketData(marketData)

      // Fetch weather data for user's location
      if (userProfile) {
        const weatherResponse = await fetch(`/api/weather?location=${userProfile.district},${userProfile.state}`)
        const weatherData = await weatherResponse.json()
        setWeatherData(weatherData)

        // Generate planting advice based on location, soil, and current conditions
        const adviceResponse = await fetch("/api/planting-advice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: `${userProfile.district}, ${userProfile.state}`,
            soilType: userProfile.landType,
            weather: weatherData,
            currentDate: new Date().toISOString(),
          }),
        })
        const advice = await adviceResponse.json()
        setPlantingAdvice(advice)
      }

      setLastUpdated(new Date().toLocaleString("en-IN"))
    } catch (error) {
      console.error("Failed to fetch real-time data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // Check if user is logged in and has profile
    const userEmail = localStorage.getItem("userEmail")
    const profileData = localStorage.getItem("userProfile")
    const preferredLanguage = localStorage.getItem("preferredLanguage") as Language
    if (preferredLanguage) {
      setLanguage(preferredLanguage)
    }

    if (!userEmail) {
      router.push("/")
      return
    }

    if (!profileData) {
      router.push("/profile-setup")
      return
    }

    setUserProfile(JSON.parse(profileData))

    const interval = setInterval(fetchRealTimeData, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [router])

  const getPersonalizedCrops = () => {
    const locationKey = `${userProfile.country}-${userProfile.state}`
    const baseCrops = cropDatabase[locationKey] || cropDatabase.default

    return baseCrops
      .map((crop) => ({
        ...crop,
        suitability: calculateSoilSuitability(crop, userProfile),
        soilMatch: getSoilMatchDetails(crop, userProfile),
      }))
      .sort((a, b) => b.suitability - a.suitability)
  }

  const getLandArea = () => {
    if (userProfile.measurementType === "dimensions" && userProfile.length && userProfile.width) {
      const area = (Number.parseFloat(userProfile.length) * Number.parseFloat(userProfile.width)) / 10000 // Convert to hectares
      return `${area.toFixed(2)} hectares`
    } else if (userProfile.measurementType === "area" && userProfile.totalArea) {
      return `${userProfile.totalArea} ${userProfile.areaUnit}`
    }
    return "Not specified"
  }

  const handleCropClick = (crop: Crop) => {
    setSelectedCrop(crop)
    setShowVarieties(true)
  }

  const handleVarietySelect = (crop: Crop, variety: CropVariety) => {
    // Store selected crop and variety for the calendar page
    localStorage.setItem(
      "selectedCropVariety",
      JSON.stringify({
        crop,
        variety,
      }),
    )
    router.push("/crop-calendar")
  }

  if (showVarieties && selectedCrop) {
    // Sort varieties by suitability in descending order
    const sortedVarieties = [...selectedCrop.varieties].sort((a, b) => b.suitability - a.suitability)

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sprout className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{t("appName")}</h1>
            </div>
            <Button variant="outline" onClick={() => setShowVarieties(false)}>
              {t("back")}
            </Button>
          </div>

          {/* Crop Header */}
          <Card className="border-border shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <img
                  src={selectedCrop.image || "/placeholder.svg"}
                  alt={selectedCrop.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <CardTitle className="text-2xl">
                    {t(selectedCrop.id as any)} {t("viewVarieties")}
                  </CardTitle>
                  <CardDescription>
                    {t("basedOnLocation")} {userProfile?.state}, {userProfile?.country}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Varieties List */}
          <div className="grid gap-4">
            {sortedVarieties.map((variety) => (
              <Card
                key={variety.id}
                className="border-border shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleVarietySelect(selectedCrop, variety)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{variety.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>
                          {t("cultivationDuration")}: {variety.duration} {t("days")}
                        </span>
                        <span>
                          {t("expectedYield")}: {variety.yield}
                        </span>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-primary">{variety.suitability}%</div>
                      <div className="text-sm text-muted-foreground">{t("suitability")}</div>
                      <Progress value={variety.suitability} className="w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return <div>Loading...</div>
  }

  const availableCrops = getPersonalizedCrops()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sprout className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{t("appName")}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={fetchRealTimeData} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {t("refreshData")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/schemes")}>
              <TrendingUp className="h-4 w-4 mr-2" />
              {t("schemes")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/profile-setup")}>
              <User className="h-4 w-4 mr-2" />
              {t("profileSettings")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              {t("settings")}
            </Button>
          </div>
        </div>

        {/* MarketDataDashboard component */}
        <MarketDataDashboard />

        {userProfile && (
          <WeatherDashboard
            location={`${userProfile.district}, ${userProfile.state}`}
            latitude="12.9675"
            longitude="79.9489"
          />
        )}

        {plantingAdvice && weatherData && (
          <Card className="border-border shadow-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>{t("personalizedAdvice")}</span>
                <Badge variant="default">{t("live")}</Badge>
              </CardTitle>
              <CardDescription>
                {t("basedOnLocation")} ({userProfile?.district}, {userProfile?.state}) {t("andSoilType")}{" "}
                {userProfile?.landType}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Weather Conditions */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">{t("temperature")}</div>
                    <div className="font-semibold">{weatherData.temperature}°C</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">{t("humidity")}</div>
                    <div className="font-semibold">{weatherData.humidity}%</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Cloud className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">{t("rainfall")}</div>
                    <div className="font-semibold">{weatherData.rainfall}mm</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">{t("soilMoisture")}</div>
                    <div className="font-semibold">{weatherData.soilMoisture}%</div>
                  </div>
                </div>
              </div>

              {/* Planting Recommendations */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">🌱 {t("whatToPlantNow")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plantingAdvice.recommendedCrops?.map((crop: any) => (
                    <div key={crop.name} className="p-3 border rounded-lg bg-white/70 dark:bg-black/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{crop.name}</span>
                        <Badge variant={crop.priority === "high" ? "default" : "secondary"}>
                          {t(crop.priority === "high" ? "highPriority" : "lowPriority")}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{crop.reason}</div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        ⏰ {t("bestPlantingWindow")}: {crop.plantingWindow}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Season Advice */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  🌾 {plantingAdvice.currentSeason} {t("seasonAdvice")}
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">{plantingAdvice.seasonalAdvice}</p>
              </div>

              {/* Weather-based Recommendations */}
              {plantingAdvice.weatherRecommendations && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🌤️ {t("weatherBasedActions")}</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    {plantingAdvice.weatherRecommendations.map((rec: string, index: number) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {userProfile.soilType && (
          <Card className="border-border shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="h-5 w-5 text-primary" />
                <span>{t("soilAnalysis")}</span>
                <Badge variant="outline">{t("personalized")}</Badge>
              </CardTitle>
              <CardDescription>
                {t("basedOnSoil")} {userProfile.soilType} {t("soilIn")} {userProfile.district}, {userProfile.state}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Beaker className="h-4 w-4 text-brown-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">{t("soilType")}</div>
                    <div className="font-semibold capitalize">{userProfile.soilType}</div>
                  </div>
                </div>
                {userProfile.soilPH && (
                  <div className="flex items-center space-x-2">
                    <TestTube className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">{t("phLevel")}</div>
                      <div className="font-semibold capitalize">{userProfile.soilPH}</div>
                    </div>
                  </div>
                )}
                {userProfile.drainageCondition && (
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4 text-cyan-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">{t("drainage")}</div>
                      <div className="font-semibold capitalize">{userProfile.drainageCondition}</div>
                    </div>
                  </div>
                )}
                {userProfile.irrigationAvailable && (
                  <div className="flex items-center space-x-2">
                    <Sprout className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">{t("irrigation")}</div>
                      <div className="font-semibold capitalize">{userProfile.irrigationAvailable}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Top 3 recommended crops based on soil */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">🌱 {t("bestCropsForSoil")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {availableCrops.slice(0, 3).map((crop) => (
                    <div key={crop.id} className="p-3 border rounded-lg bg-white/70 dark:bg-black/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{crop.name}</span>
                        <Badge variant={crop.suitability >= 80 ? "default" : "secondary"}>{crop.suitability}%</Badge>
                      </div>
                      <div className="space-y-1">
                        {crop.soilMatch.matches.map((match: string, index: number) => (
                          <div key={index} className="text-xs text-green-600 dark:text-green-400">
                            ✓ {match}
                          </div>
                        ))}
                        {crop.soilMatch.concerns.map((concern: string, index: number) => (
                          <div key={index} className="text-xs text-amber-600 dark:text-amber-400">
                            ⚠ {concern}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Welcome Section */}
        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle>
              {t("welcomeUser")}, {userProfile?.fullName}!
            </CardTitle>
            <CardDescription>{t("recommendedCrops")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>
                  {userProfile?.district}, {userProfile?.state}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Ruler className="h-4 w-4 text-primary" />
                <span>
                  {t("landArea")}: {getLandArea()}
                </span>
              </div>
              {userProfile?.landType && (
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>
                    {t("landType")}: {userProfile.landType}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Crop Recommendations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t("recommendedCrops")}</h2>
            <Badge variant="secondary">
              {availableCrops.length} {t("cropsAvailable")}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCrops.map((crop) => (
              <Card
                key={crop.id}
                className="border-border shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleCropClick(crop)}
              >
                <CardHeader className="pb-2">
                  <img
                    src={crop.image || "/placeholder.svg"}
                    alt={crop.name}
                    className="w-full h-40 object-cover rounded-lg mb-2"
                  />
                  <CardTitle className="flex items-center justify-between">
                    <span>{t(crop.id as any)}</span>
                    <Badge variant={crop.suitability >= 80 ? "default" : "secondary"}>{crop.suitability}%</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={crop.suitability} className="w-full" />
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">{t("season")}</span>: {crop.season}
                    </div>
                    <div>
                      <span className="font-medium">{t("waterRequirement")}</span>: {crop.waterRequirement}
                    </div>
                  </div>
                  {/* Soil compatibility indicators */}
                  <div className="space-y-1">
                    {crop.soilMatch.matches.slice(0, 1).map((match: string, index: number) => (
                      <div key={index} className="text-xs text-green-600 dark:text-green-400">
                        ✓ {match}
                      </div>
                    ))}
                    {crop.soilMatch.concerns.slice(0, 1).map((concern: string, index: number) => (
                      <div key={index} className="text-xs text-amber-600 dark:text-amber-400">
                        ⚠ {concern}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {crop.varieties.length} {t("varietiesAvailable")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Data Sources Footer */}
        <DataSourceFooter sources={["agristack", "agmarknet", "imd"]} category="government" />
      </div>
    </div>
  )
}
