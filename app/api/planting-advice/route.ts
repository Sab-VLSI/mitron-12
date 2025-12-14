import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { location, soilType, weather, currentDate } = await request.json()

    const currentMonth = new Date(currentDate).getMonth() + 1
    const currentSeason = getCurrentSeason(currentMonth)

    const advice = {
      currentSeason,
      recommendedCrops: getRecommendedCrops(location, soilType, currentMonth, weather),
      seasonalAdvice: getSeasonalAdvice(currentSeason, soilType),
      weatherRecommendations: getWeatherRecommendations(weather),
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(advice)
  } catch (error) {
    console.error("Planting advice API error:", error)
    return NextResponse.json({ error: "Failed to generate planting advice" }, { status: 500 })
  }
}

function getCurrentSeason(month: number): string {
  if (month >= 6 && month <= 9) return "Kharif"
  if (month >= 10 && month <= 3) return "Rabi"
  return "Zaid"
}

function getRecommendedCrops(location: string, soilType: string, month: number, weather: any) {
  const crops = []

  // Kharif season (June-September)
  if (month >= 6 && month <= 9) {
    if (weather.rainfall > 20) {
      crops.push({
        name: "Rice",
        priority: "high",
        reason: "High rainfall and warm temperature ideal for rice cultivation",
        plantingWindow: "June-July",
      })
    }
    crops.push({
      name: "Cotton",
      priority: "medium",
      reason: "Suitable temperature and moderate water requirement",
      plantingWindow: "May-June",
    })
  }

  // Rabi season (October-March)
  if (month >= 10 || month <= 3) {
    crops.push({
      name: "Wheat",
      priority: "high",
      reason: "Cool weather perfect for wheat growth",
      plantingWindow: "November-December",
    })
    if (soilType?.toLowerCase().includes("clay") || soilType?.toLowerCase().includes("loam")) {
      crops.push({
        name: "Mustard",
        priority: "medium",
        reason: "Suitable soil type and cool weather",
        plantingWindow: "October-November",
      })
    }
  }

  return crops.length > 0
    ? crops
    : [
        {
          name: "Maize",
          priority: "medium",
          reason: "Versatile crop suitable for current conditions",
          plantingWindow: "Year-round with proper irrigation",
        },
      ]
}

function getSeasonalAdvice(season: string, soilType: string): string {
  const advice = {
    Kharif: `Focus on monsoon crops like rice, cotton, and sugarcane. Ensure proper drainage to prevent waterlogging. ${soilType} soil is suitable for water-intensive crops.`,
    Rabi: `Plant winter crops like wheat, barley, and mustard. Prepare for irrigation as rainfall is limited. ${soilType} soil retains moisture well for winter crops.`,
    Zaid: `Consider summer crops with adequate irrigation. Focus on quick-growing vegetables and fodder crops. Mulching recommended for ${soilType} soil.`,
  }
  return advice[season as keyof typeof advice] || "Monitor weather conditions and adjust planting schedule accordingly."
}

function getWeatherRecommendations(weather: any): string[] {
  const recommendations = []

  if (weather.temperature > 35) {
    recommendations.push("High temperature - provide shade for young plants and increase irrigation frequency")
  }

  if (weather.humidity > 80) {
    recommendations.push("High humidity - monitor for fungal diseases and ensure good air circulation")
  }

  if (weather.rainfall > 30) {
    recommendations.push("Heavy rainfall expected - ensure proper drainage and avoid field operations")
  } else if (weather.rainfall < 5) {
    recommendations.push("Low rainfall - plan for supplemental irrigation")
  }

  if (weather.soilMoisture < 30) {
    recommendations.push("Low soil moisture - increase irrigation or delay planting until moisture improves")
  }

  return recommendations.length > 0
    ? recommendations
    : ["Current weather conditions are favorable for farming activities"]
}
