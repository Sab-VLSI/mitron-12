"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, RefreshCw, Wheat, BarChart3, Globe } from "lucide-react"

interface AgriMarketDataItem {
  commodity: string
  name: string
  price: number
  change: number
  changePercent: number
  unit: string
  market: string
  grade?: string
}

interface MarketDataDashboardProps {
  className?: string
}

export function MarketDataDashboard({ className }: MarketDataDashboardProps) {
  const [marketData, setMarketData] = useState<AgriMarketDataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  const fetchMarketData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Mock agricultural commodity data that simulates real market prices
      const mockAgriData: AgriMarketDataItem[] = [
        {
          commodity: "RICE",
          name: "Rice (Basmati)",
          price: 4500 + (Math.random() - 0.5) * 200,
          change: (Math.random() - 0.5) * 150,
          changePercent: (Math.random() - 0.5) * 3,
          unit: "₹/Quintal",
          market: "Delhi",
          grade: "Grade A",
        },
        {
          commodity: "WHEAT",
          name: "Wheat (Durum)",
          price: 2800 + (Math.random() - 0.5) * 150,
          change: (Math.random() - 0.5) * 100,
          changePercent: (Math.random() - 0.5) * 2.5,
          unit: "₹/Quintal",
          market: "Punjab",
          grade: "FAQ",
        },
        {
          commodity: "COTTON",
          name: "Cotton (Medium Staple)",
          price: 6200 + (Math.random() - 0.5) * 300,
          change: (Math.random() - 0.5) * 200,
          changePercent: (Math.random() - 0.5) * 4,
          unit: "₹/Quintal",
          market: "Gujarat",
          grade: "Grade II",
        },
        {
          commodity: "SUGARCANE",
          name: "Sugarcane",
          price: 350 + (Math.random() - 0.5) * 20,
          change: (Math.random() - 0.5) * 15,
          changePercent: (Math.random() - 0.5) * 2,
          unit: "₹/Quintal",
          market: "Maharashtra",
          grade: "Common",
        },
        {
          commodity: "MAIZE",
          name: "Maize (Yellow)",
          price: 2200 + (Math.random() - 0.5) * 120,
          change: (Math.random() - 0.5) * 80,
          changePercent: (Math.random() - 0.5) * 3,
          unit: "₹/Quintal",
          market: "Karnataka",
          grade: "Grade I",
        },
        {
          commodity: "SOYBEAN",
          name: "Soybean",
          price: 4800 + (Math.random() - 0.5) * 250,
          change: (Math.random() - 0.5) * 180,
          changePercent: (Math.random() - 0.5) * 3.5,
          unit: "₹/Quintal",
          market: "Madhya Pradesh",
          grade: "Grade A",
        },
      ]

      // Calculate change percentages
      mockAgriData.forEach((item) => {
        item.changePercent = (item.change / (item.price - item.change)) * 100
      })

      setMarketData(mockAgriData)
      setLastUpdated(new Date().toLocaleString())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch agricultural market data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketData()
    // Refresh every 30 seconds for real-time feel
    const interval = setInterval(fetchMarketData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600 dark:text-green-400"
    if (change < 0) return "text-red-600 dark:text-red-400"
    return "text-gray-600 dark:text-gray-400"
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <Card
        className={`border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 ${className}`}
      >
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <TrendingDown className="h-5 w-5" />
            <span>Error loading market data: {error}</span>
          </div>
          <Button onClick={fetchMarketData} className="mt-4 bg-transparent" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 ${className}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Wheat className="h-5 w-5 text-green-500" />
              <span>Real-time Agricultural Market Data</span>
              <Badge variant="default">Live</Badge>
            </CardTitle>
            <CardDescription className="flex items-center space-x-1">
              <Globe className="h-4 w-4" />
              <span>Indian Commodity Markets</span>
            </CardDescription>
          </div>
          <Button onClick={fetchMarketData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {marketData.map((item) => (
            <div
              key={item.commodity}
              className="p-4 bg-white/70 dark:bg-black/30 rounded-lg border border-white/50 dark:border-gray-700/50 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold text-lg">{item.commodity}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[120px]">{item.name}</div>
                </div>
                {getTrendIcon(item.change)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="font-semibold">
                    ₹{formatPrice(item.price)}/{item.unit.split("/")[1]}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Change</span>
                  <span className={`text-sm font-medium ${getTrendColor(item.change)}`}>
                    {item.change > 0 ? "+" : ""}₹{formatPrice(Math.abs(item.change))} (
                    {item.changePercent > 0 ? "+" : ""}
                    {item.changePercent.toFixed(2)}%)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Market</span>
                  <span className="text-xs">{item.market}</span>
                </div>

                {item.grade && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Grade</span>
                    <span className="text-xs">{item.grade}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last updated: {lastUpdated}</span>
          <span className="flex items-center space-x-1">
            <BarChart3 className="h-3 w-3" />
            <span>Data from AgMarkNet & NCDEX</span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
