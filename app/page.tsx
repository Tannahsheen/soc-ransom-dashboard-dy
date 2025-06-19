"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, Shield, AlertTriangle, Globe, Calendar, Building } from "lucide-react"

interface Victim {
  victim: string
  group: string
  attackdate: string
  country: string
  infostealer?: any
  press?: string[]
  updates?: string[]
}

export default function RansomwareDashboard() {
  const [victims, setVictims] = useState<Victim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchVictims = async () => {
    try {
      setError(null)
      const response = await fetch("/api/ransomware-feed")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setVictims(data.slice(0, 20))
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
      console.error("Error fetching victims:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVictims()
    const interval = setInterval(fetchVictims, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [])

  const getCountryFlag = (countryCode: string) => {
    if (!countryCode || countryCode === "--") return "🌐"
    try {
      return String.fromCodePoint(...[...countryCode.toUpperCase()].map((char) => 127397 + char.charCodeAt(0)))
    } catch {
      return "🌐"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "N/A") return "Unknown"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const getGroupColor = (group: string) => {
    const colors = [
      "bg-red-500/20 text-red-300 border-red-500/30",
      "bg-orange-500/20 text-orange-300 border-orange-500/30",
      "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      "bg-pink-500/20 text-pink-300 border-pink-500/30",
      "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    ]
    const hash = group.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 border-b border-purple-500/30">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <Shield className="h-8 w-8 text-purple-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AF SOC | Ransomware Intelligence</h1>
                <p className="text-purple-200 mt-1">Real-time threat monitoring & victim tracking</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-purple-200">
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">
                  {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Loading..."}
                </span>
              </div>
              <div className="text-xs text-purple-300 mt-1">Auto-refresh: 5 minutes</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Status Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between bg-gray-900/50 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Live Feed Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-300">{victims.length} Recent Incidents</span>
              </div>
            </div>
            <div className="text-xs text-gray-400">Source: ransomware.live API v2</div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Alert className="mb-8 border-red-500/30 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-300">Failed to load ransomware data: {error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="bg-gray-900/50 border-purple-500/20">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 bg-gray-700" />
                  <Skeleton className="h-4 w-1/2 bg-gray-700" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full bg-gray-700" />
                    <Skeleton className="h-4 w-2/3 bg-gray-700" />
                    <Skeleton className="h-4 w-1/2 bg-gray-700" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Victims Grid */}
        {!loading && victims.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {victims.map((victim, index) => (
              <Card
                key={`${victim.victim}-${index}`}
                className="bg-gray-900/50 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg font-semibold flex items-start justify-between">
                    <span className="line-clamp-2">{victim.victim || "Unknown Organization"}</span>
                    <Building className="h-4 w-4 text-purple-400 mt-1 flex-shrink-0 ml-2" />
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={`w-fit text-xs font-medium border ${getGroupColor(victim.group || "unknown")}`}
                  >
                    {victim.group || "Unknown Group"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">{formatDate(victim.attackdate)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">
                      {getCountryFlag(victim.country)} {victim.country || "Unknown"}
                    </span>
                  </div>
                  {victim.infostealer && Object.keys(victim.infostealer).length > 0 && (
                    <div className="pt-2 border-t border-gray-700">
                      <div className="text-xs text-red-400 font-medium">Data Compromised</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && victims.length === 0 && !error && (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Recent Incidents</h3>
            <p className="text-gray-500">No ransomware victims reported in the recent feed.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-gray-900/30 mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div>
              <span className="font-semibold text-purple-300">Alias Cybersecurity</span> | SOC Intelligence Dashboard
            </div>
            <div className="flex items-center space-x-4">
              <span>Powered by ransomware.live</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
