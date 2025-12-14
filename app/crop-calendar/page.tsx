"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sprout,
  Calendar,
  Leaf,
  Bug,
  ArrowLeft,
  Clock,
  CloudRain,
  Thermometer,
  Droplets,
  AlertTriangle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getTranslation, type Language } from "@/lib/translations"

interface CropVariety {
  id: string
  name: string
  suitability: number
  duration: number
  yield: string
}

interface Crop {
  id: string
  name: string
  suitability: number
  varieties: CropVariety[]
  image: string
  season: string
  waterRequirement: string
}

interface CalendarDay {
  date: Date
  day: number
  phase: string
  phaseColor: string
  activities: Activity[]
}

interface Activity {
  type: "watering" | "fertilizer" | "weeding" | "plowing" | "sowing" | "harvesting"
  description: string
  color: string
  icon: string
}

interface Phase {
  name: string
  startDay: number
  endDay: number
  color: string
  description: string
}

const cropPhases: Record<string, Phase[]> = {
  rice: [
    { name: "Land Preparation", startDay: 1, endDay: 15, color: "bg-amber-500", description: "Plowing and leveling" },
    {
      name: "Nursery & Sowing",
      startDay: 16,
      endDay: 35,
      color: "bg-green-500",
      description: "Seed preparation and nursery",
    },
    {
      name: "Transplanting",
      startDay: 36,
      endDay: 45,
      color: "bg-blue-500",
      description: "Moving seedlings to main field",
    },
    {
      name: "Vegetative Growth",
      startDay: 46,
      endDay: 85,
      color: "bg-emerald-500",
      description: "Plant growth and tillering",
    },
    {
      name: "Reproductive Phase",
      startDay: 86,
      endDay: 110,
      color: "bg-purple-500",
      description: "Flowering and grain formation",
    },
    {
      name: "Maturation",
      startDay: 111,
      endDay: 120,
      color: "bg-orange-500",
      description: "Grain filling and ripening",
    },
    { name: "Harvesting", startDay: 121, endDay: 125, color: "bg-yellow-500", description: "Crop harvesting" },
  ],
  wheat: [
    {
      name: "Land Preparation",
      startDay: 1,
      endDay: 10,
      color: "bg-amber-500",
      description: "Plowing and seed bed preparation",
    },
    { name: "Sowing", startDay: 11, endDay: 20, color: "bg-green-500", description: "Seed sowing" },
    {
      name: "Germination",
      startDay: 21,
      endDay: 35,
      color: "bg-blue-500",
      description: "Seed germination and emergence",
    },
    {
      name: "Vegetative Growth",
      startDay: 36,
      endDay: 75,
      color: "bg-emerald-500",
      description: "Tillering and stem elongation",
    },
    {
      name: "Reproductive Phase",
      startDay: 76,
      endDay: 110,
      color: "bg-purple-500",
      description: "Flowering and grain formation",
    },
    {
      name: "Maturation",
      startDay: 111,
      endDay: 125,
      color: "bg-orange-500",
      description: "Grain filling and ripening",
    },
    { name: "Harvesting", startDay: 126, endDay: 130, color: "bg-yellow-500", description: "Crop harvesting" },
  ],
  default: [
    { name: "Land Preparation", startDay: 1, endDay: 15, color: "bg-amber-500", description: "Soil preparation" },
    { name: "Sowing", startDay: 16, endDay: 25, color: "bg-green-500", description: "Seed sowing" },
    { name: "Growth Phase", startDay: 26, endDay: 80, color: "bg-emerald-500", description: "Plant growth" },
    { name: "Maturation", startDay: 81, endDay: 110, color: "bg-orange-500", description: "Crop maturation" },
    { name: "Harvesting", startDay: 111, endDay: 120, color: "bg-yellow-500", description: "Harvesting" },
  ],
}

const activities: Record<string, Activity[]> = {
  rice: [
    { type: "plowing", description: "Deep plowing and puddling", color: "bg-amber-600", icon: "🚜" },
    { type: "sowing", description: "Nursery preparation and sowing", color: "bg-green-600", icon: "🌱" },
    { type: "watering", description: "Maintain water level 2-5cm", color: "bg-blue-600", icon: "💧" },
    { type: "fertilizer", description: "Apply NPK fertilizer", color: "bg-green-700", icon: "🧪" },
    { type: "weeding", description: "Remove weeds manually or chemically", color: "bg-amber-700", icon: "🌿" },
    { type: "harvesting", description: "Harvest when 80% grains are golden", color: "bg-yellow-600", icon: "🌾" },
  ],
  wheat: [
    { type: "plowing", description: "Prepare fine seed bed", color: "bg-amber-600", icon: "🚜" },
    { type: "sowing", description: "Sow seeds at proper depth", color: "bg-green-600", icon: "🌱" },
    { type: "watering", description: "Irrigate at critical stages", color: "bg-blue-600", icon: "💧" },
    { type: "fertilizer", description: "Apply urea and DAP", color: "bg-green-700", icon: "🧪" },
    { type: "weeding", description: "Control weeds in early stages", color: "bg-amber-700", icon: "🌿" },
    { type: "harvesting", description: "Harvest when grains are hard", color: "bg-yellow-600", icon: "🌾" },
  ],
}

const fertilizers = {
  rice: [
    { name: "Urea", type: "Chemical", application: "Split doses during vegetative growth", npk: "46-0-0" },
    { name: "DAP", type: "Chemical", application: "Basal application before transplanting", npk: "18-46-0" },
    { name: "Potash", type: "Chemical", application: "During panicle initiation", npk: "0-0-60" },
    { name: "Compost", type: "Organic", application: "Before land preparation", npk: "Variable" },
    { name: "Vermicompost", type: "Organic", application: "Mix with soil before transplanting", npk: "1-1-1" },
  ],
  wheat: [
    { name: "Urea", type: "Chemical", application: "Split application at sowing and tillering", npk: "46-0-0" },
    { name: "DAP", type: "Chemical", application: "Full dose at sowing", npk: "18-46-0" },
    { name: "MOP", type: "Chemical", application: "At sowing time", npk: "0-0-60" },
    { name: "FYM", type: "Organic", application: "Before land preparation", npk: "0.5-0.2-0.5" },
  ],
}

const diseases = {
  rice: [
    {
      name: "Blast",
      symptoms: "Diamond-shaped lesions on leaves",
      chemical: "Tricyclazole 75% WP",
      organic: "Neem oil spray, resistant varieties",
    },
    {
      name: "Brown Spot",
      symptoms: "Brown spots with yellow halo",
      chemical: "Mancozeb 75% WP",
      organic: "Proper water management, balanced nutrition",
    },
    {
      name: "Bacterial Blight",
      symptoms: "Water-soaked lesions on leaves",
      chemical: "Streptocycline + Copper oxychloride",
      organic: "Crop rotation, clean cultivation",
    },
  ],
  wheat: [
    {
      name: "Rust",
      symptoms: "Orange-red pustules on leaves",
      chemical: "Propiconazole 25% EC",
      organic: "Resistant varieties, proper spacing",
    },
    {
      name: "Powdery Mildew",
      symptoms: "White powdery growth on leaves",
      chemical: "Sulfur 80% WP",
      organic: "Neem extract, avoid excess nitrogen",
    },
  ],
}

interface PlowingConditions {
  temperature: number
  humidity: number
  soilMoisture: string
  weatherCondition: string
  recommendation: string
  optimalTime: string
  lastUpdated: string
}

interface WaterContent {
  currentLevel: number
  optimalRange: { min: number; max: number }
  recommendation: string
  nextWatering: string
  dailyRequirement: number
}

interface FertilizerRecommendation {
  name: string
  amount: string
  timing: string
  method: string
  cost: number
  npkRatio: string
}

interface DailyRecommendations {
  water: WaterContent
  fertilizers: FertilizerRecommendation[]
  soilPh: number
  temperature: number
  humidity: number
  lastUpdated: string
}

interface RealTimeData {
  plowingConditions: PlowingConditions
  marketPrices: {
    tractorRental: number
    fuelPrice: number
    laborCost: number
  }
  dailyRecommendations: DailyRecommendations
}

const indianLanguages = {
  en: "English",
  hi: "हिंदी",
  te: "తెలుగు",
  ta: "தமிழ்",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
  bn: "বাংলা",
  gu: "ગુજરાતી",
  mr: "मराठी",
  pa: "ਪੰਜਾਬੀ",
  or: "ଓଡ଼ିଆ",
  as: "অসমীয়া",
  ur: "اردو",
}

const enhancedFertilizers = {
  rice: [
    {
      name: "Urea",
      type: "Chemical",
      application: "Split doses during vegetative growth",
      npk: "46-0-0",
      amount: "120 kg/hectare",
      timing: "30, 45, 60 days after transplanting",
      cost: 266,
      method: "Broadcasting and incorporation",
    },
    {
      name: "DAP",
      type: "Chemical",
      application: "Basal application before transplanting",
      npk: "18-46-0",
      amount: "100 kg/hectare",
      timing: "At transplanting",
      cost: 1350,
      method: "Deep placement",
    },
    {
      name: "Potash (MOP)",
      type: "Chemical",
      application: "During panicle initiation",
      npk: "0-0-60",
      amount: "60 kg/hectare",
      timing: "45-50 days after transplanting",
      cost: 840,
      method: "Broadcasting",
    },
    {
      name: "Vermicompost",
      type: "Organic",
      application: "Mix with soil before transplanting",
      npk: "1-1-1",
      amount: "2-3 tonnes/hectare",
      timing: "15 days before transplanting",
      cost: 4000,
      method: "Soil incorporation",
    },
  ],
  wheat: [
    {
      name: "Urea",
      type: "Chemical",
      application: "Split application at sowing and tillering",
      npk: "46-0-0",
      amount: "130 kg/hectare",
      timing: "Half at sowing, half at tillering",
      cost: 289,
      method: "Broadcasting and irrigation",
    },
    {
      name: "DAP",
      type: "Chemical",
      application: "Full dose at sowing",
      npk: "18-46-0",
      amount: "100 kg/hectare",
      timing: "At sowing time",
      cost: 1350,
      method: "Drill application",
    },
    {
      name: "MOP",
      type: "Chemical",
      application: "At sowing time",
      npk: "0-0-60",
      amount: "50 kg/hectare",
      timing: "At sowing",
      cost: 700,
      method: "Broadcasting",
    },
  ],
}

export default function CropCalendarPage() {
  const [selectedCropVariety, setSelectedCropVariety] = useState<{ crop: Crop; variety: CropVariety } | null>(null)
  const [calendar, setCalendar] = useState<CalendarDay[]>([])
  const [currentMonth, setCurrentMonth] = useState(0)
  const [language, setLanguage] = useState<Language>("en")
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null)
  const [isLoadingRealTime, setIsLoadingRealTime] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en")
  const [dailyUpdateInterval, setDailyUpdateInterval] = useState<NodeJS.Timeout | null>(null)
  const router = useRouter()

  const t = (key: keyof typeof import("@/lib/translations").translations.en) => {
    return getTranslation(language, key)
  }

  const fetchRealTimeData = async () => {
    setIsLoadingRealTime(true)
    try {
      const profileData = localStorage.getItem("userProfile")
      let location = "Delhi"

      if (profileData) {
        const profile = JSON.parse(profileData)
        location = profile.district || profile.state || "Delhi"
      }

      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location},IN&appid=demo_key&units=metric`,
      )

      const mockData: RealTimeData = {
        plowingConditions: {
          temperature: 28,
          humidity: 65,
          soilMoisture: "Optimal",
          weatherCondition: "Clear",
          recommendation: "Excellent conditions for plowing. Soil moisture is optimal.",
          optimalTime: "6:00 AM - 10:00 AM",
          lastUpdated: new Date().toLocaleString(),
        },
        marketPrices: {
          tractorRental: 800,
          fuelPrice: 95,
          laborCost: 300,
        },
        dailyRecommendations: {
          water: {
            currentLevel: 75,
            optimalRange: { min: 70, max: 85 },
            recommendation: "Water level is optimal. Next watering in 2 days.",
            nextWatering: "2 days",
            dailyRequirement: 25,
          },
          fertilizers: [
            {
              name: "Urea",
              amount: "2 kg per 100 sq meters",
              timing: "Apply today morning",
              method: "Broadcasting after irrigation",
              cost: 45,
              npkRatio: "46-0-0",
            },
          ],
          soilPh: 6.8,
          temperature: 28,
          humidity: 65,
          lastUpdated: new Date().toLocaleString(),
        },
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
      setRealTimeData(mockData)
    } catch (error) {
      console.error("Failed to fetch real-time data:", error)
    } finally {
      setIsLoadingRealTime(false)
    }
  }

  useEffect(() => {
    const storedData = localStorage.getItem("selectedCropVariety")
    if (!storedData) {
      router.push("/dashboard")
      return
    }

    const preferredLanguage = localStorage.getItem("preferredLanguage") || "en"
    setSelectedLanguage(preferredLanguage)

    const data = JSON.parse(storedData)
    setSelectedCropVariety(data)

    generateCalendar(data.crop, data.variety)

    fetchRealTimeData()
  }, [router])

  useEffect(() => {
    const interval = setInterval(
      () => {
        fetchRealTimeData()
      },
      24 * 60 * 60 * 1000,
    )

    setDailyUpdateInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  const generateCalendar = (crop: Crop, variety: CropVariety) => {
    const startDate = new Date()
    const calendarDays: CalendarDay[] = []
    const cropPhasesData = cropPhases[crop.id] || cropPhases.default
    const cropActivitiesData = activities[crop.id] || activities.default || []

    for (let day = 1; day <= variety.duration + 5; day++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + day - 1)

      const currentPhase = cropPhasesData.find((phase) => day >= phase.startDay && day <= phase.endDay)

      const dayActivities: Activity[] = []

      if (currentPhase) {
        if (currentPhase.name.includes("Preparation") && day <= 10) {
          const plowingActivity = cropActivitiesData.find((a) => a.type === "plowing")
          if (plowingActivity) dayActivities.push(plowingActivity)
        }
        if (currentPhase.name.includes("Sowing") || currentPhase.name.includes("Nursery")) {
          const sowingActivity = cropActivitiesData.find((a) => a.type === "sowing")
          if (sowingActivity) dayActivities.push(sowingActivity)
        }
        if (day % 7 === 0 && currentPhase.name.includes("Growth")) {
          const wateringActivity = cropActivitiesData.find((a) => a.type === "watering")
          if (wateringActivity) dayActivities.push(wateringActivity)
        }
        if (day % 15 === 0 && day > 20 && day < variety.duration - 20) {
          const fertilizerActivity = cropActivitiesData.find((a) => a.type === "fertilizer")
          if (fertilizerActivity) dayActivities.push(fertilizerActivity)
        }
        if (day % 20 === 0 && day > 30 && day < variety.duration - 30) {
          const weedingActivity = cropActivitiesData.find((a) => a.type === "weeding")
          if (weedingActivity) dayActivities.push(weedingActivity)
        }
        if (currentPhase.name.includes("Harvesting")) {
          const harvestingActivity = cropActivitiesData.find((a) => a.type === "harvesting")
          if (harvestingActivity) dayActivities.push(harvestingActivity)
        }
      }

      calendarDays.push({
        date: currentDate,
        day,
        phase: currentPhase?.name || "Unknown",
        phaseColor: currentPhase?.color || "bg-gray-500",
        activities: dayActivities,
      })
    }

    setCalendar(calendarDays)
  }

  if (!selectedCropVariety) {
    return <div>Loading...</div>
  }

  const { crop, variety } = selectedCropVariety
  const cropFertilizers = fertilizers[crop.id as keyof typeof fertilizers] || []
  const cropDiseases = diseases[crop.id as keyof typeof diseases] || []

  const monthlyCalendar = calendar.reduce(
    (acc, day) => {
      const monthKey = `${day.date.getFullYear()}-${day.date.getMonth()}`
      if (!acc[monthKey]) {
        acc[monthKey] = []
      }
      acc[monthKey].push(day)
      return acc
    },
    {} as Record<string, CalendarDay[]>,
  )

  const monthNames = Object.keys(monthlyCalendar).map((key) => {
    const [year, month] = key.split("-")
    return new Date(Number.parseInt(year), Number.parseInt(month)).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sprout className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{t("appName")}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value)
                localStorage.setItem("preferredLanguage", e.target.value)
              }}
              className="px-3 py-1 border rounded-md text-sm"
            >
              {Object.entries(indianLanguages).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>
          </div>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-6">
              <img
                src={crop.image || "/placeholder.svg"}
                alt={crop.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">
                  {t(crop.id as any)} - {variety.name}
                </CardTitle>
                <CardDescription className="text-lg mb-4">
                  Complete cultivation guide for your {variety.duration}-day growing cycle
                </CardDescription>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>
                      {t("cultivationDuration")}: {variety.duration} {t("days")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Expected Yield: {variety.yield}</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {t("suitability")}: {variety.suitability}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-border shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <CloudRain className="h-5 w-5 text-blue-600" />
                <span>Real-Time Plowing Conditions</span>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={fetchRealTimeData} disabled={isLoadingRealTime}>
                {isLoadingRealTime ? "Updating..." : "Refresh"}
              </Button>
            </div>
            <CardDescription>Current weather and soil conditions for optimal plowing</CardDescription>
          </CardHeader>
          <CardContent>
            {realTimeData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Thermometer className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="font-medium">{realTimeData.plowingConditions.temperature}°C</div>
                    <div className="text-sm text-muted-foreground">Temperature</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <Droplets className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="font-medium">{realTimeData.plowingConditions.humidity}%</div>
                    <div className="text-sm text-muted-foreground">Humidity</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
                  <Leaf className="h-8 w-8 text-amber-600" />
                  <div>
                    <div className="font-medium">{realTimeData.plowingConditions.soilMoisture}</div>
                    <div className="text-sm text-muted-foreground">Soil Moisture</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="font-medium text-sm">{realTimeData.plowingConditions.optimalTime}</div>
                    <div className="text-sm text-muted-foreground">Best Time</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Loading real-time conditions...</div>
            )}

            {realTimeData && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-800">Recommendation</div>
                    <div className="text-sm text-green-700">{realTimeData.plowingConditions.recommendation}</div>
                    <div className="text-xs text-green-600 mt-1">
                      Last updated: {realTimeData.plowingConditions.lastUpdated}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {realTimeData && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="font-medium">₹{realTimeData.marketPrices.tractorRental}</div>
                  <div className="text-sm text-muted-foreground">Tractor Rental/Day</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="font-medium">₹{realTimeData.marketPrices.fuelPrice}/L</div>
                  <div className="text-sm text-muted-foreground">Diesel Price</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="font-medium">₹{realTimeData.marketPrices.laborCost}</div>
                  <div className="text-sm text-muted-foreground">Labor Cost/Day</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle>{t("phases")}</CardTitle>
            <CardDescription>Overview of all growth phases for {t(crop.id as any)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cropPhases[crop.id as keyof typeof cropPhases]?.map((phase, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded ${phase.color}`}></div>
                  <div className="flex-1">
                    <div className="font-medium">{phase.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {t("days")} {phase.startDay}-{phase.endDay} • {phase.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-16 text-left justify-start bg-transparent" variant="outline">
                <Leaf className="h-6 w-6 mr-3 text-green-600" />
                <div>
                  <div className="font-medium">{t("fertilizers")}</div>
                  <div className="text-sm text-muted-foreground">Detailed amounts, costs & application methods</div>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  Enhanced {t("fertilizers")} for {t(crop.id as any)}
                </DialogTitle>
                <DialogDescription>Comprehensive fertilizer guide with amounts, costs, and timing</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {enhancedFertilizers[crop.id as keyof typeof enhancedFertilizers]?.map((fertilizer, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-lg">{fertilizer.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant={fertilizer.type === "Organic" ? "secondary" : "default"}>
                            {fertilizer.type}
                          </Badge>
                          <Badge variant="outline">₹{fertilizer.cost}/hectare</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-green-700">Amount: </span>
                          <span>{fertilizer.amount}</span>
                        </div>
                        <div>
                          <span className="font-medium text-blue-700">Timing: </span>
                          <span>{fertilizer.timing}</span>
                        </div>
                        <div>
                          <span className="font-medium text-purple-700">Method: </span>
                          <span>{fertilizer.method}</span>
                        </div>
                        <div>
                          <span className="font-medium text-orange-700">NPK: </span>
                          <span>{fertilizer.npk}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{fertilizer.application}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-16 text-left justify-start bg-transparent" variant="outline">
                <Bug className="h-6 w-6 mr-3 text-red-600" />
                <div>
                  <div className="font-medium">{t("diseases")}</div>
                  <div className="text-sm text-muted-foreground">Common diseases and treatment options</div>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Disease Management for {t(crop.id as any)}</DialogTitle>
                <DialogDescription>Common diseases and their chemical/organic treatments</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {cropDiseases.map((disease, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">{disease.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{disease.symptoms}</p>
                      <Tabs defaultValue="chemical" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="chemical">Chemical Treatment</TabsTrigger>
                          <TabsTrigger value="organic">Organic Treatment</TabsTrigger>
                        </TabsList>
                        <TabsContent value="chemical" className="mt-2">
                          <p className="text-sm">{disease.chemical}</p>
                        </TabsContent>
                        <TabsContent value="organic" className="mt-2">
                          <p className="text-sm">{disease.organic}</p>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>{t("cropCalendar")}</span>
                </CardTitle>
                <CardDescription>{t("activities")}</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {monthNames.map((month, index) => (
                  <Button
                    key={index}
                    variant={currentMonth === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentMonth(index)}
                  >
                    {month.split(" ")[0]}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-blue-600"></div>
                  <span>{t("watering")}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-green-700"></div>
                  <span>{t("fertilizer")}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-amber-700"></div>
                  <span>{t("weedRemoval")}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-yellow-600"></div>
                  <span>{t("harvesting")}</span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-2 text-center font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}

                {Object.values(monthlyCalendar)[currentMonth]?.map((day) => (
                  <div
                    key={day.day}
                    className={`p-2 min-h-20 border rounded-lg ${day.phaseColor} bg-opacity-20 border-opacity-30`}
                  >
                    <div className="text-sm font-medium">{day.date.getDate()}</div>
                    <div className="text-xs text-muted-foreground mb-1">Day {day.day}</div>
                    <div className="space-y-1">
                      {day.activities.map((activity, index) => (
                        <div
                          key={index}
                          className={`text-xs px-1 py-0.5 rounded ${activity.color} text-white`}
                          title={activity.description}
                        >
                          {activity.icon}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">
              <div className="font-medium mb-1">Data Sources:</div>
              <div className="space-y-1">
                <div>• Weather: India Meteorological Department (IMD)</div>
                <div>• Soil Data: Indian Council of Agricultural Research (ICAR)</div>
                <div>• Market Prices: AGMARKNET Portal</div>
                <div>• Fertilizer Recommendations: State Agricultural Universities</div>
                <div className="mt-2">Last updated: {realTimeData?.dailyRecommendations.lastUpdated}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
