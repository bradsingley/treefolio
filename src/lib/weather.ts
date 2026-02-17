// ─── Open-Meteo Weather Types ─────────────────────────────────

export interface CurrentWeather {
  temperature: number      // °C
  humidity: number          // %
  precipitation: number    // mm
  windSpeed: number        // km/h
  uvIndex: number
}

export interface DailyForecast {
  date: string             // ISO date
  tempMax: number          // °C
  tempMin: number          // °C
  precipitationSum: number // mm
  uvIndexMax: number
}

export interface WeatherData {
  current: CurrentWeather
  daily: DailyForecast[]
  latitude: number
  longitude: number
  timezone: string
}

// ─── Fetch from Open-Meteo ────────────────────────────────────

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast'

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,uv_index',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max',
    timezone: 'auto',
    forecast_days: '7',
  })

  const res = await fetch(`${OPEN_METEO_BASE}?${params}`, { next: { revalidate: 1800 } })

  if (!res.ok) {
    throw new Error(`Open-Meteo API error: ${res.status} ${res.statusText}`)
  }

  const raw = await res.json()

  return {
    latitude: raw.latitude,
    longitude: raw.longitude,
    timezone: raw.timezone,
    current: {
      temperature: raw.current.temperature_2m,
      humidity: raw.current.relative_humidity_2m,
      precipitation: raw.current.precipitation,
      windSpeed: raw.current.wind_speed_10m,
      uvIndex: raw.current.uv_index,
    },
    daily: raw.daily.time.map((date: string, i: number) => ({
      date,
      tempMax: raw.daily.temperature_2m_max[i],
      tempMin: raw.daily.temperature_2m_min[i],
      precipitationSum: raw.daily.precipitation_sum[i],
      uvIndexMax: raw.daily.uv_index_max[i],
    })),
  }
}

// ─── Weather Alerts ───────────────────────────────────────────

export interface WeatherAlert {
  type: 'frost' | 'heat' | 'high-uv' | 'heavy-rain' | 'wind' | 'low-humidity' | 'high-humidity'
  severity: 'info' | 'warning' | 'danger'
  message: string
}

export function getWeatherAlerts(weather: WeatherData): WeatherAlert[] {
  const alerts: WeatherAlert[] = []

  // Check forecast for frost
  for (const day of weather.daily) {
    if (day.tempMin <= 0) {
      alerts.push({
        type: 'frost',
        severity: 'danger',
        message: `Frost expected on ${day.date} — low of ${day.tempMin}°C. Protect tender species.`,
      })
      break // one alert is enough
    }
  }

  // Current heat
  if (weather.current.temperature >= 35) {
    alerts.push({
      type: 'heat',
      severity: 'danger',
      message: `Extreme heat: ${weather.current.temperature}°C. Increase watering, provide afternoon shade.`,
    })
  } else if (weather.current.temperature >= 30) {
    alerts.push({
      type: 'heat',
      severity: 'warning',
      message: `High temperature: ${weather.current.temperature}°C. Monitor watering closely.`,
    })
  }

  // UV
  const maxUV = Math.max(...weather.daily.map((d) => d.uvIndexMax))
  if (maxUV > 7) {
    alerts.push({
      type: 'high-uv',
      severity: 'warning',
      message: `High UV index (${maxUV}) forecast. Shade sensitive species like maples and azaleas.`,
    })
  }

  // Heavy rain
  const totalPrecip = weather.daily.reduce((sum, d) => sum + d.precipitationSum, 0)
  if (totalPrecip > 50) {
    alerts.push({
      type: 'heavy-rain',
      severity: 'warning',
      message: `Heavy rain expected this week (${totalPrecip.toFixed(0)}mm total). Ensure drainage, skip watering.`,
    })
  }

  // Humidity
  if (weather.current.humidity > 80) {
    alerts.push({
      type: 'high-humidity',
      severity: 'info',
      message: `High humidity (${weather.current.humidity}%). Watch for fungal issues, reduce watering.`,
    })
  } else if (weather.current.humidity < 30) {
    alerts.push({
      type: 'low-humidity',
      severity: 'info',
      message: `Low humidity (${weather.current.humidity}%). Mist foliage, use humidity trays.`,
    })
  }

  // Wind
  if (weather.current.windSpeed > 50) {
    alerts.push({
      type: 'wind',
      severity: 'warning',
      message: `Strong winds (${weather.current.windSpeed} km/h). Secure tall and cascade-style trees.`,
    })
  }

  return alerts
}

// ─── Helpers ──────────────────────────────────────────────────

export function celsiusToFahrenheit(c: number): number {
  return Math.round(c * 9 / 5 + 32)
}
