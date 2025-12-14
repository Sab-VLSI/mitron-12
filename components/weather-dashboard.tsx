"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  CloudRain,
  Sun,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  TrendingUp,
} from "lucide-react"

interface WeatherData {
  location: string
  current: {
    temperature: number
    humidity: number
    windSpeed: number
    pressure: number
    condition: string
    soilMoisture: number
    rainfall: number
    uvIndex: number
    lastUpdated: string
  }
  forecast: Array<{
    date: string
    maxTemp: number
    minTemp: number
    precipitation: number
    windSpeed: number
    condition: string
  }>
  plowingConditions: {
    overall: string
    score: number
    recommendations: string[]
    nextWeekSuitability: Array<{
      date: string
      score: number
      status: string
      recommendations: string[]
      weather: any
    }>
    factors: {
      soilMoisture: { status: string; value: number; ideal: string }
      temperature: { status: string; value: number; ideal: string }
      rainfall: { status: string; value: number; ideal: string }
      windSpeed: { status: string; value: number; ideal: string }
    }
  }
  dataSources: {
    primary: string
    secondary: string | null
    lastUpdated: string
  }
}

interface WeatherDashboardProps {
  location: string
  latitude?: string
  longitude?: string
}

export function WeatherDashboard({ location, latitude, longitude }: WeatherDashboardProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWeatherData = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        location,
        ...(latitude && { lat: latitude }),
        ...(longitude && { lon: longitude }),
      })

      const response = await fetch(`/api/weather?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch weather data")
      }

      const data = await response.json()
      setWeatherData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeatherData()
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [location, latitude, longitude])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
      case "excellent":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "moderate":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "poor":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "good":
        return "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
      case "moderate":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
      case "poor":
        return "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <XCircle className="h-5 w-5" />
            <span>Error loading weather data: {error}</span>
          </div>
          <Button onClick={fetchWeatherData} className="mt-4 bg-transparent" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!weatherData) return null

  return (
    <div className="space-y-6">
      {/* Real-time Weather Box */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950 dark:to-sky-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Sun className="h-5 w-5 text-yellow-500" />
                <span>Real-time Weather</span>
                <Badge variant="default">Live</Badge>
              </CardTitle>
              <CardDescription>{weatherData.location}</CardDescription>
            </div>
            <Button onClick={fetchWeatherData} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-sm text-muted-foreground">Temperature</div>
                <div className="font-semibold">{weatherData.current.temperature}°C</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm text-muted-foreground">Humidity</div>
                <div className="font-semibold">{weatherData.current.humidity}%</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Wind className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-muted-foreground">Wind Speed</div>
                <div className="font-semibold">{weatherData.current.windSpeed} km/h</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Gauge className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-sm text-muted-foreground">Pressure</div>
                <div className="font-semibold">{weatherData.current.pressure} hPa</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm text-muted-foreground">Soil Moisture</div>
                <div className="font-semibold">{weatherData.current.soilMoisture}%</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CloudRain className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-sm text-muted-foreground">Rainfall</div>
                <div className="font-semibold">{weatherData.current.rainfall}mm</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="text-sm text-muted-foreground">Condition</div>
                <div className="font-semibold text-sm">{weatherData.current.condition}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            Last updated: {new Date(weatherData.current.lastUpdated).toLocaleString()}
            {weatherData.dataSources.secondary && (
              <span>
                {" "}
                • Sources: {weatherData.dataSources.primary}, {weatherData.dataSources.secondary}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 7-Day Forecast Box */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-green-500" />
            <span>7-Day Weather Forecast</span>
          </CardTitle>
          <CardDescription>Extended weather outlook for planning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weatherData.forecast.map((day, index) => (
              <div
                key={day.date}
                className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium w-16">
                    {index === 0 ? "Today" : new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className="text-sm text-muted-foreground w-24">{day.condition}</div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Thermometer className="h-3 w-3 text-orange-500" />
                    <span>
                      {day.maxTemp}°/{day.minTemp}°
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CloudRain className="h-3 w-3 text-blue-500" />
                    <span>{day.precipitation}mm</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Wind className="h-3 w-3 text-gray-500" />
                    <span>{day.windSpeed}km/h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plowing Conditions Analysis */}
      <Card className={`border-2 ${getStatusColor(weatherData.plowingConditions.overall)}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getStatusIcon(weatherData.plowingConditions.overall)}
            <span>Plowing Conditions Analysis</span>
            <Badge
              variant={
                weatherData.plowingConditions.overall === "excellent" ||
                weatherData.plowingConditions.overall === "good"
                  ? "default"
                  : "destructive"
              }
            >
              {weatherData.plowingConditions.overall.toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>Current suitability score: {weatherData.plowingConditions.score}/100</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={weatherData.plowingConditions.score} className="w-full" />

          {/* Current Conditions Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(weatherData.plowingConditions.factors).map(([key, factor]) => (
              <div key={key} className="p-3 border rounded-lg bg-white/70 dark:bg-black/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  {getStatusIcon(factor.status)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Current: {factor.value}
                  {key === "temperature"
                    ? "°C"
                    : key === "soilMoisture" || key === "humidity"
                      ? "%"
                      : key === "windSpeed"
                        ? " km/h"
                        : key === "rainfall"
                          ? "mm"
                          : ""}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">Ideal: {factor.ideal}</div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="space-y-2">
            <h4 className="font-semibold">Recommendations:</h4>
            <ul className="space-y-1">
              {weatherData.plowingConditions.recommendations.map((rec, index) => (
                <li key={index} className="text-sm flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Week Suitability */}
          <div className="space-y-3">
            <h4 className="font-semibold">Next 7 Days Plowing Suitability:</h4>
            <div className="space-y-2">
              {weatherData.plowingConditions.nextWeekSuitability.map((day, index) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between p-2 border rounded bg-white/50 dark:bg-black/20"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium w-16">
                      {index === 0 ? "Today" : new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    {getStatusIcon(day.status)}
                    <div className="text-sm">{day.weather.condition}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium">{day.score}/100</div>
                    <Progress value={day.score} className="w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
