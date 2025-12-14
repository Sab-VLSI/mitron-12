import { NextResponse } from "next/server"

// Mock API for demonstration - In production, this would fetch from AGMARKNET API
export async function GET() {
  try {
    // Simulate real-time market data
    const marketData = {
      lastUpdated: new Date().toISOString(),
      commodities: [
        {
          name: "Rice (Common)",
          market: "Delhi",
          modalPrice: 2850,
          minPrice: 2800,
          maxPrice: 2900,
          unit: "per quintal",
          trend: "stable",
        },
        {
          name: "Wheat",
          market: "Punjab",
          modalPrice: 2200,
          minPrice: 2150,
          maxPrice: 2250,
          unit: "per quintal",
          trend: "up",
        },
        {
          name: "Cotton",
          market: "Gujarat",
          modalPrice: 6800,
          minPrice: 6500,
          maxPrice: 7000,
          unit: "per quintal",
          trend: "down",
        },
        {
          name: "Sugarcane",
          market: "Uttar Pradesh",
          modalPrice: 350,
          minPrice: 340,
          maxPrice: 360,
          unit: "per quintal",
          trend: "stable",
        },
      ],
      source: "AGMARKNET Portal - Ministry of Agriculture & Farmers Welfare",
    }

    return NextResponse.json(marketData)
  } catch (error) {
    console.error("Market data fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 })
  }
}
