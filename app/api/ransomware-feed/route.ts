import { NextResponse } from "next/server"

export const revalidate = 300 // 5 minutes
export const maxDuration = 60 // Allow up to 60 seconds for this route

async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout per attempt

    try {
      console.log(`[v0] Attempt ${attempt}/${maxRetries} to fetch from ${url}`)
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": "AF-SOC-Dashboard/1.0",
          "Accept": "application/json",
        },
        signal: controller.signal,
        cache: "no-store",
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      return response
    } catch (error) {
      clearTimeout(timeoutId)
      lastError = error instanceof Error ? error : new Error(String(error))
      console.log(`[v0] Attempt ${attempt} failed: ${lastError.message}`)

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff: 1s, 2s, 4s)
        const delay = Math.pow(2, attempt - 1) * 1000
        console.log(`[v0] Waiting ${delay}ms before retry...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error("All retry attempts failed")
}

export async function GET() {
  try {
    const response = await fetchWithRetry("https://api.ransomware.live/v2/recentvictims")

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
