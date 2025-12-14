"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sprout, User, MapPin, Ruler } from "lucide-react"
import { useRouter } from "next/navigation"
import { getTranslation, type Language } from "@/lib/translations"
import { districtsByState } from "@/lib/locations"

const countries = [
  { code: "IN", name: "India", key: "india" },
  { code: "LK", name: "Sri Lanka", key: "sriLanka" },
  { code: "BD", name: "Bangladesh", key: "bangladesh" },
  { code: "NP", name: "Nepal", key: "nepal" },
  { code: "PK", name: "Pakistan", key: "pakistan" },
  { code: "MM", name: "Myanmar", key: "myanmar" },
]

const statesByCountry = {
  IN: [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ],
  LK: [
    "Western",
    "Central",
    "Southern",
    "Northern",
    "Eastern",
    "North Western",
    "North Central",
    "Uva",
    "Sabaragamuwa",
  ],
  BD: ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh"],
  NP: ["Province 1", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"],
  PK: ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Gilgit-Baltistan"],
  MM: ["Yangon", "Mandalay", "Naypyidaw", "Shan", "Kachin", "Kayah", "Kayin", "Chin", "Mon", "Rakhine"],
}

export default function ProfileSetupPage() {
  const [fullName, setFullName] = useState("")
  const [country, setCountry] = useState("")
  const [state, setState] = useState("")
  const [district, setDistrict] = useState("")
  const [landType, setLandType] = useState("")
  const [measurementType, setMeasurementType] = useState("dimensions")
  const [length, setLength] = useState("")
  const [width, setWidth] = useState("")
  const [totalArea, setTotalArea] = useState("")
  const [areaUnit, setAreaUnit] = useState("acres")
  const [soilType, setSoilType] = useState("")
  const [soilPH, setSoilPH] = useState("")
  const [organicMatter, setOrganicMatter] = useState("")
  const [drainageCondition, setDrainageCondition] = useState("")
  const [irrigationAvailable, setIrrigationAvailable] = useState("")
  const [previousCrop, setPreviousCrop] = useState("")
  const [soilDepth, setSoilDepth] = useState("")
  const [error, setError] = useState("")
  const [language, setLanguage] = useState<Language>("en")
  const router = useRouter()

  const t = (key: keyof typeof import("@/lib/translations").translations.en) => {
    return getTranslation(language, key)
  }

  useEffect(() => {
    // Check if user is logged in
    const userEmail = localStorage.getItem("userEmail")
    if (!userEmail) {
      router.push("/")
    }

    const preferredLanguage = localStorage.getItem("preferredLanguage") as Language
    if (preferredLanguage) {
      setLanguage(preferredLanguage)
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!fullName || !country || !state || !district) {
      setError(t("fillAllFields"))
      return
    }

    if (measurementType === "dimensions" && (!length || !width)) {
      setError(t("provideLandDimensions"))
      return
    }

    if (measurementType === "area" && !totalArea) {
      setError(t("provideLandArea"))
      return
    }

    const profileData = {
      fullName,
      country,
      state,
      district,
      landType,
      measurementType,
      length: measurementType === "dimensions" ? length : null,
      width: measurementType === "dimensions" ? width : null,
      totalArea: measurementType === "area" ? totalArea : null,
      areaUnit: measurementType === "area" ? areaUnit : null,
      soilType,
      soilPH,
      organicMatter,
      drainageCondition,
      irrigationAvailable,
      previousCrop,
      soilDepth,
    }

    localStorage.setItem("userProfile", JSON.stringify(profileData))
    router.push("/dashboard")
  }

  const availableStates = country ? statesByCountry[country as keyof typeof statesByCountry] || [] : []
  
  // Debug: Log states to console
  useEffect(() => {
    if (country === 'IN' && typeof window !== 'undefined') {
      console.log('[DEBUG] India states:', availableStates)
      console.log('[DEBUG] Rajasthan in list?', availableStates.includes('Rajasthan'))
      console.log('[DEBUG] Total states:', availableStates.length)
      console.log('[DEBUG] States array:', JSON.stringify(availableStates))
    }
  }, [country, availableStates])
  
  // #region agent log
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const logData = {
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
        location: 'profile-setup/page.tsx:159',
        message: 'Available states calculation',
        data: {
          country,
          availableStatesCount: availableStates.length,
          hasRajasthan: availableStates.includes('Rajasthan'),
          allStates: availableStates,
          statesByCountryKeys: Object.keys(statesByCountry),
          indiaStatesCount: statesByCountry.IN?.length || 0,
          indiaStatesHasRajasthan: statesByCountry.IN?.includes('Rajasthan') || false,
          rajasthanIndex: availableStates.indexOf('Rajasthan'),
          firstFiveStates: availableStates.slice(0, 5),
          lastFiveStates: availableStates.slice(-5),
          statesByCountryIN: statesByCountry.IN
        },
        timestamp: Date.now()
      }
      fetch('http://127.0.0.1:7242/ingest/83eb5832-587c-4d7a-a726-1e83d575e523', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      }).catch(() => {})
    }
  }, [country, availableStates])
  
  useEffect(() => {
    if (typeof window !== 'undefined' && country === 'IN') {
      const logData = {
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'C',
        location: 'profile-setup/page.tsx:195',
        message: 'Component render with India selected',
        data: {
          country,
          availableStatesLength: availableStates.length,
          rajasthanInArray: availableStates.includes('Rajasthan'),
          statesArrayString: JSON.stringify(availableStates),
          statesByCountryINLength: statesByCountry.IN?.length,
          statesByCountryINString: JSON.stringify(statesByCountry.IN)
        },
        timestamp: Date.now()
      }
      fetch('http://127.0.0.1:7242/ingest/83eb5832-587c-4d7a-a726-1e83d575e523', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      }).catch(() => {})
    }
  }, [country])
  // #endregion

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sprout className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{t("appName")}</h1>
          </div>
          <h2 className="text-xl font-semibold">{t("profileSetup")}</h2>
          <p className="text-muted-foreground">{t("setupDescription")}</p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{t("profileSetup")}</span>
            </CardTitle>
            <CardDescription>{t("requiredFieldsNote")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t("fullName")} *</Label>
                  <Input
                    id="fullName"
                    placeholder={t("enterFullName")}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{t("locationDetails")}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">{t("country")} *</Label>
                    <Select
                      value={country}
                      onValueChange={(value) => {
                        setCountry(value)
                        setState("")
                        setDistrict("")
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectCountry")} />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {t(c.key as any)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">{t("state")} *</Label>
                    <Select
                      value={state}
                      onValueChange={(value) => {
                        setState(value)
                        setDistrict("")
                      }}
                      disabled={!country}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectState")} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStates.map((s, index) => {
                          // #region agent log
                          if (typeof window !== 'undefined') {
                            const isRajasthan = s === 'Rajasthan'
                            const logData = {
                              sessionId: 'debug-session',
                              runId: 'run1',
                              hypothesisId: isRajasthan ? 'B' : 'D',
                              location: 'profile-setup/page.tsx:271',
                              message: isRajasthan ? 'Rajasthan found in map' : 'State being mapped',
                              data: { 
                                state: s, 
                                index: index,
                                totalStates: availableStates.length,
                                isRajasthan,
                                allStatesInMap: availableStates,
                                rajasthanIndex: availableStates.indexOf('Rajasthan')
                              },
                              timestamp: Date.now()
                            }
                            if (isRajasthan || index < 3 || index >= availableStates.length - 3) {
                              fetch('http://127.0.0.1:7242/ingest/83eb5832-587c-4d7a-a726-1e83d575e523', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(logData)
                              }).catch(() => {})
                            }
                          }
                          // #endregion
                          return (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">{t("district")} *</Label>
                  {state && districtsByState[state] ? (
                    <Select value={district} onValueChange={setDistrict} disabled={!state}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectDistrict")} />
                      </SelectTrigger>
                      <SelectContent>
                        {districtsByState[state].map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="district"
                      placeholder={t("selectDistrict")}
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="bg-background"
                      disabled={!state}
                    />
                  )}
                </div>
              </div>

              {/* Land Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Ruler className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{t("landDetails")}</h3>
                </div>

                <div className="space-y-2">
                  <Label>{t("landTypeOptional")}</Label>
                  <RadioGroup value={landType} onValueChange={setLandType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="wetland" id="wetland" />
                      <Label htmlFor="wetland">{t("wetland")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dryland" id="dryland" />
                      <Label htmlFor="dryland">{t("dryland")}</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>{t("landAreaSpecification")}</Label>
                  <RadioGroup value={measurementType} onValueChange={setMeasurementType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dimensions" id="dimensions" />
                      <Label htmlFor="dimensions">{t("dimensionsOption")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="area" id="area" />
                      <Label htmlFor="area">{t("landArea")}</Label>
                    </div>
                  </RadioGroup>
                </div>

                {measurementType === "dimensions" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="length">{t("lengthMeters")}</Label>
                      <Input
                        id="length"
                        type="number"
                        placeholder="100"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="width">{t("widthMeters")}</Label>
                      <Input
                        id="width"
                        type="number"
                        placeholder="50"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                  </div>
                )}

                {measurementType === "area" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalArea">{t("landArea")}</Label>
                      <Input
                        id="totalArea"
                        type="number"
                        placeholder="2.5"
                        value={totalArea}
                        onChange={(e) => setTotalArea(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="areaUnit">{t("unit")}</Label>
                      <Select value={areaUnit} onValueChange={setAreaUnit}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="acres">{t("acres")}</SelectItem>
                          <SelectItem value="hectares">{t("hectares")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Soil Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Sprout className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{t("soilQuestions")}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="soilType">{t("soilColorQuestion")}</Label>
                    <Select value={soilType} onValueChange={setSoilType}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("chooseSoilColor")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="black">{t("blackSoil")}</SelectItem>
                        <SelectItem value="red">{t("redSoil")}</SelectItem>
                        <SelectItem value="yellow">{t("yellowSoil")}</SelectItem>
                        <SelectItem value="sandy">{t("sandySoil")}</SelectItem>
                        <SelectItem value="mixed">{t("mixedSoil")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="soilPH">{t("waterBehaviorQuestion")}</Label>
                    <Select value={soilPH} onValueChange={setSoilPH}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("waterBehaviorPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fast">{t("waterFast")}</SelectItem>
                        <SelectItem value="medium">{t("waterMedium")}</SelectItem>
                        <SelectItem value="slow">{t("waterSlow")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organicMatter">{t("soilFeelQuestion")}</Label>
                    <Select value={organicMatter} onValueChange={setOrganicMatter}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("touchAndFeel")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sticky">{t("soilSticky")}</SelectItem>
                        <SelectItem value="smooth">{t("soilSmooth")}</SelectItem>
                        <SelectItem value="rough">{t("soilRough")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="drainageCondition">{t("rainWaterQuestion")}</Label>
                    <Select value={drainageCondition} onValueChange={setDrainageCondition}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("waterLoggingCondition")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">{t("drainageNever")}</SelectItem>
                        <SelectItem value="sometimes">{t("drainageSometimes")}</SelectItem>
                        <SelectItem value="often">{t("drainageOften")}</SelectItem>
                        <SelectItem value="always">{t("drainageAlways")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="irrigationAvailable">{t("irrigationQuestion")}</Label>
                    <Select value={irrigationAvailable} onValueChange={setIrrigationAvailable}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("waterSource")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rain">{t("rainOnly")}</SelectItem>
                        <SelectItem value="well">{t("wellWater")}</SelectItem>
                        <SelectItem value="canal">{t("canalWater")}</SelectItem>
                        <SelectItem value="tank">{t("tankWater")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="soilDepth">{t("soilDepthQuestion")}</Label>
                    <Select value={soilDepth} onValueChange={setSoilDepth}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("diggingDepth")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shallow">{t("soilShallow")}</SelectItem>
                        <SelectItem value="medium">{t("soilMediumDepth")}</SelectItem>
                        <SelectItem value="deep">{t("soilDeep")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousCrop">{t("previousCropQuestion")}</Label>
                  <Input
                    id="previousCrop"
                    placeholder={t("previousCropPlaceholder")}
                    value={previousCrop}
                    onChange={(e) => setPreviousCrop(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">{error}</div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full">
                {t("completeSetup")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
