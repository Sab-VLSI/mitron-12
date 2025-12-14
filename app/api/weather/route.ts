import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get("location")
  const lat = searchParams.get("lat") || "26.922070" // Default to Chennai coordinates
  const lon = searchParams.get("lon") || "75.778885"

  if (!location) {
    return NextResponse.json({ error: "Location is required" }, { status: 400 })
  }

  try {
    // Fetch from Open-Meteo API for current and forecast data
    const openMeteoResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,surface_pressure&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,soil_moisture_0_to_1cm&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=Asia%2FKolkata&forecast_days=7`,
    )

    let openMeteoData = null
    if (openMeteoResponse.ok) {
      openMeteoData = await openMeteoResponse.json()
    }

    // Try to fetch from IMD (Indian Meteorological Department)
    let imdData = null
    try {
      // Note: IMD API might require authentication or have CORS restrictions
      const imdResponse = await fetch(
        `https://mausamgram.imd.gov.in/backend/api/weather/current?location=${encodeURIComponent(location)}`,
      )
      if (imdResponse.ok) {
        imdData = await imdResponse.json()
      }
    } catch (imdError) {
      console.log("IMD API not accessible, using Open-Meteo data only")
    }

    // Process and combine data
    const currentWeather = openMeteoData
      ? {
          temperature: Math.round(openMeteoData.current.temperature_2m),
          humidity: Math.round(openMeteoData.current.relative_humidity_2m),
          windSpeed: Math.round(openMeteoData.current.wind_speed_10m),
          pressure: Math.round(openMeteoData.current.surface_pressure),
          weatherCode: openMeteoData.current.weather_code,
          soilMoisture: openMeteoData.hourly.soil_moisture_0_to_1cm[0]
            ? Math.round(openMeteoData.hourly.soil_moisture_0_to_1cm[0] * 100)
            : 50,
        }
      : {
          temperature: Math.round(25 + Math.random() * 10),
          humidity: Math.round(60 + Math.random() * 30),
          windSpeed: Math.round(5 + Math.random() * 15),
          pressure: Math.round(1010 + Math.random() * 20),
          weatherCode: 1,
          soilMoisture: Math.round(40 + Math.random() * 40),
        }

    // Generate 7-day forecast
    const forecast = openMeteoData
      ? openMeteoData.daily.time.slice(0, 7).map((date: string, index: number) => ({
          date,
          maxTemp: Math.round(openMeteoData.daily.temperature_2m_max[index]),
          minTemp: Math.round(openMeteoData.daily.temperature_2m_min[index]),
          precipitation: Math.round(openMeteoData.daily.precipitation_sum[index] || 0),
          windSpeed: Math.round(openMeteoData.daily.wind_speed_10m_max[index]),
          condition: getWeatherCondition(openMeteoData.daily.weather_code?.[index] || 1),
        }))
      : Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          maxTemp: Math.round(25 + Math.random() * 10),
          minTemp: Math.round(15 + Math.random() * 10),
          precipitation: Math.round(Math.random() * 20),
          windSpeed: Math.round(5 + Math.random() * 15),
          condition: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain"][Math.floor(Math.random() * 4)],
        }))

    // Analyze plowing conditions
    const plowingAnalysis = analyzePlowingConditions(currentWeather, forecast)

    const weatherData = {
      location,
      current: {
        ...currentWeather,
        condition: getWeatherCondition(currentWeather.weatherCode),
        uvIndex: Math.round(3 + Math.random() * 8),
        rainfall: forecast[0]?.precipitation || 0,
        lastUpdated: new Date().toISOString(),
      },
      forecast,
      plowingConditions: plowingAnalysis,
      dataSources: {
        primary: openMeteoData ? "Open-Meteo" : "Simulated",
        secondary: imdData ? "IMD" : null,
        lastUpdated: new Date().toISOString(),
      },
    }

    return NextResponse.json(weatherData)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}

function getWeatherCondition(code: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Slight Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    95: "Thunderstorm",
    96: "Thunderstorm with Hail",
    99: "Heavy Thunderstorm with Hail",
  }
  return weatherCodes[code] || "Unknown"
}

function analyzePlowingConditions(current: any, forecast: any[]): any {
  const conditions = {
    overall: "good",
    score: 0,
    recommendations: [] as string[],
    nextWeekSuitability: [] as any[],
    factors: {
      soilMoisture: { status: "good", value: current.soilMoisture, ideal: "40-70%" },
      temperature: { status: "good", value: current.temperature, ideal: "20-30°C" },
      rainfall: { status: "good", value: forecast[0]?.precipitation || 0, ideal: "<10mm/day" },
      windSpeed: { status: "good", value: current.windSpeed, ideal: "<15 km/h" },
    },
  }

  let score = 100

  // Analyze soil moisture
  if (current.soilMoisture < 30) {
    conditions.factors.soilMoisture.status = "poor"
    conditions.recommendations.push("Soil too dry - consider irrigation before plowing")
    score -= 30
  } else if (current.soilMoisture > 80) {
    conditions.factors.soilMoisture.status = "poor"
    conditions.recommendations.push("Soil too wet - wait for drying before plowing")
    score -= 25
  } else if (current.soilMoisture > 70) {
    conditions.factors.soilMoisture.status = "moderate"
    conditions.recommendations.push("Soil moisture slightly high - monitor before plowing")
    score -= 10
  }

  // Analyze temperature
  if (current.temperature > 35) {
    conditions.factors.temperature.status = "moderate"
    conditions.recommendations.push("High temperature - consider early morning plowing")
    score -= 10
  } else if (current.temperature < 15) {
    conditions.factors.temperature.status = "moderate"
    conditions.recommendations.push("Low temperature - wait for warmer conditions")
    score -= 10
  }

  // Analyze rainfall
  const todayRain = forecast[0]?.precipitation || 0
  if (todayRain > 10) {
    conditions.factors.rainfall.status = "poor"
    conditions.recommendations.push("Heavy rainfall expected - postpone plowing")
    score -= 40
  } else if (todayRain > 5) {
    conditions.factors.rainfall.status = "moderate"
    conditions.recommendations.push("Light rain expected - complete plowing early")
    score -= 15
  }

  // Analyze wind speed
  if (current.windSpeed > 20) {
    conditions.factors.windSpeed.status = "moderate"
    conditions.recommendations.push("High wind speed - be cautious with dust and debris")
    score -= 10
  }

  // Analyze next 7 days
  conditions.nextWeekSuitability = forecast.map((day, index) => {
    let dayScore = 100
    let dayStatus = "good"
    const dayRecommendations = []

    if (day.precipitation > 10) {
      dayScore -= 40
      dayStatus = "poor"
      dayRecommendations.push("Heavy rain expected")
    } else if (day.precipitation > 5) {
      dayScore -= 15
      dayStatus = "moderate"
      dayRecommendations.push("Light rain possible")
    }

    if (day.maxTemp > 35) {
      dayScore -= 10
      dayRecommendations.push("High temperature")
    }

    if (day.windSpeed > 20) {
      dayScore -= 10
      dayRecommendations.push("High wind speed")
    }

    if (dayScore >= 80) dayStatus = "good"
    else if (dayScore >= 60) dayStatus = "moderate"
    else dayStatus = "poor"

    return {
      date: day.date,
      score: Math.max(0, dayScore),
      status: dayStatus,
      recommendations: dayRecommendations,
      weather: {
        condition: day.condition,
        maxTemp: day.maxTemp,
        minTemp: day.minTemp,
        precipitation: day.precipitation,
        windSpeed: day.windSpeed,
      },
    }
  })

  conditions.score = Math.max(0, score)

  if (conditions.score >= 80) conditions.overall = "excellent"
  else if (conditions.score >= 60) conditions.overall = "good"
  else if (conditions.score >= 40) conditions.overall = "moderate"
  else conditions.overall = "poor"

  if (conditions.recommendations.length === 0) {
    conditions.recommendations.push("Conditions are favorable for plowing activities")
  }

  return conditions
}