import { NextResponse } from "next/server"

export const revalidate = 300 // 5 minutes

export async function GET() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    const response = await fetch("https://api.ransomware.live/v2/recentvictims", {
      headers: {
        "User-Agent": "AF-SOC-Dashboard/1.0",
        "Accept": "application/json",
      },
      signal: controller.signal,
      cache: "no-store", // Ensure fresh data
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`[v0] API responded with status: ${response.status}`)
      const errorText = await response.text().catch(() => "No error details")
      console.error(`[v0] API error response: ${errorText}`)
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[v0] Successfully fetched ${Array.isArray(data) ? data.length : 0} victims`)

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching ransomware data:", error)

    // Check if it's a timeout error
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timed out - the external API may be slow or unavailable" },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch ransomware data" },
      { status: 500 }
    )
  }
}
