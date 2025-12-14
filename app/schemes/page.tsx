"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sprout,
  ArrowLeft,
  IndianRupee,
  Shield,
  Zap,
  Users,
  Building,
  Phone,
  Globe,
  ExternalLink,
  RefreshCw,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { DataSourceFooter } from "@/components/data-source-footer"
import { getTranslation, type Language } from "@/lib/translations"

interface Scheme {
  id: string
  name: string
  description: string
  provider: string
  type: "subsidy" | "loan" | "insurance" | "training" | "technology"
  eligibility: string[]
  benefits: string[]
  applicationProcess: string
  contactInfo: string
  website?: string
  amount?: string
  duration?: string
}

const governmentSchemes: Scheme[] = [
  {
    id: "pmkisan",
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    description: "Direct income support to farmers providing ₹6,000 per year in three equal installments",
    provider: "Government of India",
    type: "subsidy",
    eligibility: ["Small and marginal farmers", "Land holding up to 2 hectares", "Valid Aadhaar card required"],
    benefits: ["₹2,000 every 4 months", "Direct bank transfer", "No paperwork required after registration"],
    applicationProcess: "Apply online at pmkisan.gov.in or visit nearest Common Service Center",
    contactInfo: "Toll-free: 155261 / 1800115526",
    website: "https://pmkisan.gov.in",
    amount: "₹6,000/year",
    duration: "Ongoing",
  },
  {
    id: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    description: "Crop insurance scheme providing financial support to farmers in case of crop failure",
    provider: "Government of India",
    type: "insurance",
    eligibility: [
      "All farmers including sharecroppers and tenant farmers",
      "Applicable for notified crops in notified areas",
      "Premium payment required",
    ],
    benefits: [
      "Coverage against natural calamities",
      "Low premium rates (2% for Kharif, 1.5% for Rabi)",
      "Quick claim settlement",
    ],
    applicationProcess: "Apply through banks, insurance companies, or online portal",
    contactInfo: "Toll-free: 14447",
    website: "https://pmfby.gov.in",
    amount: "Up to sum insured",
    duration: "Seasonal",
  },
  {
    id: "kcc",
    name: "Kisan Credit Card (KCC)",
    description: "Credit facility for farmers to meet their agricultural and allied activities",
    provider: "Government of India",
    type: "loan",
    eligibility: ["All farmers including tenant farmers", "Valid land documents", "Good credit history preferred"],
    benefits: ["Low interest rates (7% per annum)", "Flexible repayment", "Insurance coverage included"],
    applicationProcess: "Apply at any bank branch with required documents",
    contactInfo: "Contact nearest bank branch",
    amount: "Based on crop and area",
    duration: "5 years renewable",
  },
  {
    id: "pmksy",
    name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
    description: "Irrigation scheme to improve water use efficiency and expand cultivated area",
    provider: "Government of India",
    type: "subsidy",
    eligibility: ["All categories of farmers", "Water source availability", "Technical feasibility"],
    benefits: [
      "75% subsidy for SC/ST farmers",
      "50% subsidy for general category",
      "Drip and sprinkler irrigation support",
    ],
    applicationProcess: "Apply through state agriculture departments",
    contactInfo: "Contact District Collector office",
    website: "https://pmksy.gov.in",
    amount: "Up to ₹5 lakh",
    duration: "Project-based",
  },
  {
    id: "smam",
    name: "Sub-Mission on Agricultural Mechanization (SMAM)",
    description: "Financial assistance for purchase of agricultural machinery and equipment",
    provider: "Government of India",
    type: "subsidy",
    eligibility: ["Individual farmers", "Farmer groups and cooperatives", "Custom Hiring Centers"],
    benefits: ["40-50% subsidy on machinery", "Priority to SC/ST/Women farmers", "Training and demonstration support"],
    applicationProcess: "Apply through state agriculture departments or online portal",
    contactInfo: "Contact District Agriculture Officer",
    amount: "Up to ₹10 lakh",
    duration: "Annual scheme",
  },
]

const ngoSchemes: Scheme[] = [
  {
    id: "iffco",
    name: "IFFCO Kisan Agriculture Training Program",
    description: "Comprehensive training program for modern farming techniques and organic agriculture",
    provider: "Indian Farmers Fertiliser Cooperative Limited",
    type: "training",
    eligibility: ["All farmers", "Preference to small and marginal farmers", "Basic literacy preferred"],
    benefits: ["Free training on modern farming", "Organic farming certification", "Market linkage support"],
    applicationProcess: "Contact nearest IFFCO center or apply online",
    contactInfo: "1800-103-1551",
    website: "https://iffco.in",
    duration: "15-30 days",
  },
  {
    id: "tata_trust",
    name: "Tata Trusts Rural Development Program",
    description: "Integrated rural development focusing on agriculture, water, and livelihood",
    provider: "Tata Trusts",
    type: "technology",
    eligibility: ["Farmers in program areas", "Community participation required", "Sustainable farming interest"],
    benefits: ["Technology transfer", "Capacity building", "Market access support"],
    applicationProcess: "Contact local Tata Trusts office",
    contactInfo: "Contact regional offices",
    website: "https://tatatrusts.org",
    duration: "Multi-year",
  },
  {
    id: "azim_premji",
    name: "Azim Premji Foundation Agriculture Initiative",
    description: "Supporting smallholder farmers with sustainable agriculture practices",
    provider: "Azim Premji Foundation",
    type: "training",
    eligibility: ["Small and marginal farmers", "Focus on women farmers", "Sustainable farming commitment"],
    benefits: ["Sustainable farming training", "Women empowerment programs", "Community development"],
    applicationProcess: "Contact foundation field offices",
    contactInfo: "080-6614-9000",
    website: "https://azimpremjifoundation.org",
    duration: "Ongoing",
  },
  {
    id: "mahindra_rise",
    name: "Mahindra RISE Agriculture Program",
    description: "Technology-driven solutions for improving farm productivity and income",
    provider: "Mahindra Group",
    type: "technology",
    eligibility: ["Progressive farmers", "Technology adoption willingness", "Minimum land holding"],
    benefits: ["Smart farming solutions", "Equipment financing", "Technical support"],
    applicationProcess: "Contact Mahindra dealerships or online registration",
    contactInfo: "1800-419-1999",
    website: "https://mahindrarise.com",
    duration: "Ongoing",
  },
  {
    id: "reliance_foundation",
    name: "Reliance Foundation Rural Transformation",
    description: "Comprehensive rural development program focusing on agriculture and allied sectors",
    provider: "Reliance Foundation",
    type: "training",
    eligibility: ["Farmers in program villages", "Youth interested in agriculture", "Women farmers priority"],
    benefits: ["Modern farming techniques", "Value chain development", "Digital literacy programs"],
    applicationProcess: "Contact foundation field teams",
    contactInfo: "Contact local offices",
    website: "https://reliancefoundation.org",
    duration: "Multi-year",
  },
]

const getSchemeIcon = (type: string) => {
  switch (type) {
    case "subsidy":
      return <IndianRupee className="h-5 w-5" />
    case "loan":
      return <Building className="h-5 w-5" />
    case "insurance":
      return <Shield className="h-5 w-5" />
    case "training":
      return <Users className="h-5 w-5" />
    case "technology":
      return <Zap className="h-5 w-5" />
    default:
      return <Sprout className="h-5 w-5" />
  }
}

const getSchemeColor = (type: string) => {
  switch (type) {
    case "subsidy":
      return "bg-green-100 text-green-800"
    case "loan":
      return "bg-blue-100 text-blue-800"
    case "insurance":
      return "bg-purple-100 text-purple-800"
    case "training":
      return "bg-orange-100 text-orange-800"
    case "technology":
      return "bg-cyan-100 text-cyan-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function SchemesPage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: keyof typeof import("@/lib/translations").translations.en) => {
    return getTranslation(language, key)
  }

  useEffect(() => {
    // Check if user is logged in
    const userEmail = localStorage.getItem("userEmail")
    const profileData = localStorage.getItem("userProfile")

    if (!userEmail) {
      router.push("/")
      return
    }

    if (profileData) {
      setUserProfile(JSON.parse(profileData))
    }

    const preferredLanguage = localStorage.getItem("preferredLanguage") || "en"
    setLanguage(preferredLanguage as Language)

    setLastUpdated(
      new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    )
  }, [router])

  const SchemeCard = ({ scheme }: { scheme: Scheme }) => (
    <Card className="border-border shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getSchemeColor(scheme.type)}`}>{getSchemeIcon(scheme.type)}</div>
            <div>
              <CardTitle className="text-lg">{scheme.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">{scheme.provider}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {scheme.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{scheme.description}</p>

        {scheme.amount && (
          <div className="flex items-center space-x-2">
            <IndianRupee className="h-4 w-4 text-primary" />
            <span className="font-medium">{scheme.amount}</span>
            {scheme.duration && <span className="text-muted-foreground">({scheme.duration})</span>}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Eligibility:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            {scheme.eligibility.map((item, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Benefits:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            {scheme.benefits.map((item, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">How to Apply:</h4>
          <p className="text-xs text-muted-foreground">{scheme.applicationProcess}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{scheme.contactInfo}</span>
          </div>
          {scheme.website && (
            <Button variant="outline" size="sm" asChild>
              <a href={scheme.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Visit
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToDashboard")}
            </Button>
            <div className="flex items-center space-x-2">
              <Sprout className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{t("governmentSchemes")}</h1>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 inline mr-1" />
            {t("updated")}: {lastUpdated}
          </div>
        </div>

        {/* Welcome Section */}
        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle>{t("financialSupport")}</CardTitle>
            <CardDescription>{t("exploreSchemes")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="space-y-2">
                <div className="bg-green-100 p-3 rounded-lg mx-auto w-fit">
                  <IndianRupee className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-sm font-medium">{t("subsidies")}</div>
              </div>
              <div className="space-y-2">
                <div className="bg-blue-100 p-3 rounded-lg mx-auto w-fit">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-sm font-medium">{t("loans")}</div>
              </div>
              <div className="space-y-2">
                <div className="bg-purple-100 p-3 rounded-lg mx-auto w-fit">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-sm font-medium">{t("insurance")}</div>
              </div>
              <div className="space-y-2">
                <div className="bg-orange-100 p-3 rounded-lg mx-auto w-fit">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-sm font-medium">{t("training")}</div>
              </div>
              <div className="space-y-2">
                <div className="bg-cyan-100 p-3 rounded-lg mx-auto w-fit">
                  <Zap className="h-6 w-6 text-cyan-600" />
                </div>
                <div className="text-sm font-medium">{t("technology")}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schemes Tabs */}
        <Tabs defaultValue="government" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="government" className="flex items-center space-x-2">
              <Building className="h-4 w-4" />
              <span>
                {t("governmentSchemes")} ({governmentSchemes.length})
              </span>
            </TabsTrigger>
            <TabsTrigger value="ngo" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>
                {t("ngoPrograms")} ({ngoSchemes.length})
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="government" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {governmentSchemes.map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ngo" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ngoSchemes.map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle>{t("needHelp")}</CardTitle>
            <CardDescription>{t("contactAssistance")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <Phone className="h-8 w-8 text-primary mx-auto" />
                <div className="font-medium">{t("kisanCallCenter")}</div>
                <div className="text-sm text-muted-foreground">1800-180-1551</div>
                <a href="tel:18001801551" className="text-xs text-primary hover:underline">
                  {t("callNow")}
                </a>
              </div>
              <div className="text-center space-y-2">
                <Globe className="h-8 w-8 text-primary mx-auto" />
                <div className="font-medium">{t("agriculturePortal")}</div>
                <div className="text-sm text-muted-foreground">farmer.gov.in</div>
                <a
                  href="https://farmer.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  {t("visitPortal")}
                </a>
              </div>
              <div className="text-center space-y-2">
                <Users className="h-8 w-8 text-primary mx-auto" />
                <div className="font-medium">{t("localAgricultureOffice")}</div>
                <div className="text-sm text-muted-foreground">{t("contactDistrictCollector")}</div>
                <a
                  href="https://www.india.gov.in/my-government/whos-who/district-collectors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  {t("findOffice")}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <DataSourceFooter sources={["farmonaut", "pmkisan", "pmfby"]} category="schemes" />
      </div>
    </div>
  )
}
