import { NextRequest, NextResponse } from 'next/server'
import { fetchWeather, getWeatherAlerts } from '@/lib/weather'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'Missing required query parameters: lat, lon' },
      { status: 400 },
    )
  }

  const latitude = parseFloat(lat)
  const longitude = parseFloat(lon)

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json(
      { error: 'lat and lon must be valid numbers' },
      { status: 400 },
    )
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json(
      { error: 'lat must be between -90 and 90, lon between -180 and 180' },
      { status: 400 },
    )
  }

  try {
    const weather = await fetchWeather(latitude, longitude)
    const alerts = getWeatherAlerts(weather)

    return NextResponse.json({ weather, alerts })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 502 },
    )
  }
}
