import { useState } from 'react'
import './App.css'

// Weather condition to emoji mapping
const weatherIcons = {
  0: '☀️', // Clear sky
  1: '🌤️', // Mainly clear
  2: '⛅', // Partly cloudy
  3: '☁️', // Overcast
  45: '🌫️', // Fog
  48: '🌫️', // Depositing rime fog
  51: '🌦️', // Light drizzle
  53: '🌦️', // Moderate drizzle
  55: '🌦️', // Dense drizzle
  56: '🌨️', // Light freezing drizzle
  57: '🌨️', // Dense freezing drizzle
  61: '🌧️', // Slight rain
  63: '🌧️', // Moderate rain
  65: '🌧️', // Heavy rain
  66: '🌨️', // Light freezing rain
  67: '🌨️', // Heavy freezing rain
  71: '❄️', // Slight snow fall
  73: '❄️', // Moderate snow fall
  75: '❄️', // Heavy snow fall
  77: '❄️', // Snow grains
  80: '🌦️', // Slight rain showers
  81: '🌧️', // Moderate rain showers
  82: '🌧️', // Violent rain showers
  85: '🌨️', // Slight snow showers
  86: '🌨️', // Heavy snow showers
  95: '⛈️', // Thunderstorm
  96: '⛈️', // Thunderstorm with slight hail
  99: '⛈️', // Thunderstorm with heavy hail
}

// Weather condition descriptions
const weatherDescriptions = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
}

function App() {
  const [city, setCity] = useState('')
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Function to get coordinates for a city using Geocoding API
  const getCoordinates = async (cityName) => {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      )
      const data = await response.json()
      
      if (!data.results || data.results.length === 0) {
        throw new Error('City not found. Please check the spelling and try again.')
      }
      
      return {
        lat: data.results[0].latitude,
        lon: data.results[0].longitude,
        name: data.results[0].name,
        country: data.results[0].country
      }
    } catch (err) {
      throw new Error('Unable to find city. Please check your internet connection and try again.')
    }
  }

  // Function to get weather data using Open-Meteo API
  const getWeatherData = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=auto&forecast_days=1`
      )
      
      if (!response.ok) {
        throw new Error('Weather service temporarily unavailable')
      }
      
      return await response.json()
    } catch (err) {
      throw new Error('Unable to fetch weather data. Please try again later.')
    }
  }

  // Function to handle weather search
  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!city.trim()) {
      setError('Please enter a city name')
      return
    }

    setLoading(true)
    setError('')
    setWeatherData(null)

    try {
      // Get coordinates for the city
      const coordinates = await getCoordinates(city.trim())
      
      // Get weather data for the coordinates
      const weather = await getWeatherData(coordinates.lat, coordinates.lon)
      
      // Combine location and weather data
      const combinedData = {
        ...weather,
        location: coordinates
      }
      
      setWeatherData(combinedData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Function to format wind direction
  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  }

  // Function to get current time for the location
  const getCurrentTime = () => {
    return new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const resetSearch = () => {
    setWeatherData(null)
    setCity('')
    setError('')
  }

  return (
    <div className="weather-app">
      {!weatherData ? (
        <>
          <div className="app-header">
            <h1 className="app-title">Weather Now</h1>
            <p className="app-subtitle">Your outdoor companion for quick weather checks</p>
          </div>

          <div className="search-section">
            <form onSubmit={handleSearch}>
              <div className="search-container">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city name..."
                  className="search-input"
                  disabled={loading}
                />
              </div>
              <button 
                type="submit" 
                className="search-button"
                disabled={loading || !city.trim()}
              >
                {loading ? 'Searching...' : 'Get Weather'}
              </button>
            </form>
          </div>
        </>
      ) : null}

      {loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Getting weather data...</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {weatherData && (
        <div className="weather-display">
          <div className="weather-header">
            <h2 className="city-name">
              {weatherData.location.name}, {weatherData.location.country}
            </h2>
            <p className="current-time">{getCurrentTime()}</p>
          </div>

          <div className="weather-main">
            <div className="weather-icon">
              {weatherIcons[weatherData.current.weather_code] || '❓'}
            </div>
            <div className="temperature">
              {Math.round(weatherData.current.temperature_2m)}°C
            </div>
            <div className="weather-description">
              {weatherDescriptions[weatherData.current.weather_code] || 'Unknown'}
            </div>
            <div className="feels-like">
              Feels like {Math.round(weatherData.current.apparent_temperature)}°C
            </div>
          </div>

          <div className="weather-details">
            <div className="detail-item">
              <div className="detail-label">Humidity</div>
              <div className="detail-value">{weatherData.current.relative_humidity_2m}%</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Wind Speed</div>
              <div className="detail-value">{Math.round(weatherData.current.wind_speed_10m)} km/h</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Wind Direction</div>
              <div className="detail-value">
                {getWindDirection(weatherData.current.wind_direction_10m)}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Pressure</div>
              <div className="detail-value">{Math.round(weatherData.current.pressure_msl)} hPa</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Cloud Cover</div>
              <div className="detail-value">{weatherData.current.cloud_cover}%</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Precipitation</div>
              <div className="detail-value">{weatherData.current.precipitation} mm</div>
            </div>
          </div>

          <div className="search-again">
            <button onClick={resetSearch} className="search-again-button">
              Search Another City
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App