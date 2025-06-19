import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("https://api.ransomware.live/v2/recentvictims", {
      headers: {
        "User-Agent": "AF-SOC-Dashboard/1.0",
      },
      // Add cache control
      next: { revalidate: 300 }, // 5 minutes
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (error) {
    console.error("Error fetching ransomware data:", error)

    return NextResponse.json({ error: "Failed to fetch ransomware data" }, { status: 500 })
  }
}
