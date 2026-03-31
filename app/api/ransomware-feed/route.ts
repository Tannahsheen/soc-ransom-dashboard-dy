import { NextResponse } from "next/server"

export const revalidate = 300 // 5 minutes
export const maxDuration = 60 // Allow up to 60 seconds for this route

// Fallback sample data when API is unavailable
const FALLBACK_DATA = [
  { victim: "Sample Corp A", group: "lockbit3", attackdate: "2024-03-15", country: "US", activity: "DLS" },
  { victim: "Sample Industries", group: "alphv", attackdate: "2024-03-14", country: "DE", activity: "DLS" },
  { victim: "Sample Tech Ltd", group: "clop", attackdate: "2024-03-13", country: "GB", activity: "DLS" },
  { victim: "Sample Healthcare", group: "play", attackdate: "2024-03-12", country: "CA", activity: "DLS" },
  { victim: "Sample Financial", group: "blackbasta", attackdate: "2024-03-11", country: "FR", activity: "DLS" },
  { victim: "Sample Manufacturing", group: "lockbit3", attackdate: "2024-03-10", country: "IT", activity: "DLS" },
  { victim: "Sample Retail Co", group: "8base", attackdate: "2024-03-09", country: "ES", activity: "DLS" },
  { victim: "Sample Logistics", group: "rhysida", attackdate: "2024-03-08", country: "NL", activity: "DLS" },
  { victim: "Sample Energy Inc", group: "akira", attackdate: "2024-03-07", country: "AU", activity: "DLS" },
  { victim: "Sample Education", group: "medusa", attackdate: "2024-03-06", country: "JP", activity: "DLS" },
]

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AF-SOC-Dashboard/1.0)",
        "Accept": "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

export async function GET() {
  try {
    // Try the primary API with a reasonable timeout
    const response = await fetchWithTimeout(
      "https://api.ransomware.live/v2/recentvictims",
      25000 // 25 second timeout
    )

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-Data-Source": "live",
      },
    })
  } catch (error) {
    // Return fallback data when the API is unavailable
    // This ensures the dashboard remains functional
    return NextResponse.json(FALLBACK_DATA, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        "X-Data-Source": "fallback",
      },
    })
  }
}
