"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw, MessageCircle } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <WifiOff className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">You're Offline</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            No internet connection detected. The Agriculture Assistant can still provide basic farming advice using
            cached information.
          </p>

          <div className="space-y-2">
            <Button onClick={() => window.location.reload()} className="w-full" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            <Button onClick={() => (window.location.href = "/")} className="w-full">
              <MessageCircle className="h-4 w-4 mr-2" />
              Continue Offline
            </Button>
          </div>

          <div className="text-sm text-muted-foreground mt-6">
            <h3 className="font-medium mb-2">Available Offline:</h3>
            <ul className="text-left space-y-1">
              <li>• Basic crop advice</li>
              <li>• Farming best practices</li>
              <li>• Disease management tips</li>
              <li>• Fertilizer guidelines</li>
              <li>• Irrigation techniques</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
