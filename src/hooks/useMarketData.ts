import { useState, useEffect } from 'react'

interface MarketQuote {
  symbol: string
  current_price: number
  price_change: number
  price_change_percent: number
  last_updated: string
}

interface HistoricalDataPoint {
  timestamp: string
  price: number
  volume: number
}

interface MarketDataHook {
  quotes: MarketQuote[]
  historicalData: { [symbol: string]: HistoricalDataPoint[] }
  loading: boolean
  error: string | null
  fetchQuotes: (symbols: string[]) => Promise<void>
  fetchHistoricalData: (symbols: string[], period?: string) => Promise<void>
  searchInvestments: (query: string) => Promise<any[]>
}

export const useMarketData = (): MarketDataHook => {
  const [quotes, setQuotes] = useState<MarketQuote[]>([])
  const [historicalData, setHistoricalData] = useState<{ [symbol: string]: HistoricalDataPoint[] }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuotes = async (symbols: string[]) => {
    if (symbols.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('https://geoyxneteubsrpasajll.functions.supabase.co/market-data?symbol=AAPL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols, type: 'quote' })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch market data')
      }

      const data = await response.json()
      setQuotes(data.quotes || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching quotes:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistoricalData = async (symbols: string[], period: string = '1M') => {
    if (symbols.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('https://geoyxneteubsrpasajll.functions.supabase.co/market-data?symbol=AAPL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols, type: 'historical', period })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch historical data')
      }

      const data = await response.json()
      const historicalMap: { [symbol: string]: HistoricalDataPoint[] } = {}
      
      data.historical?.forEach((item: any) => {
        historicalMap[item.symbol] = item.data
      })

      setHistoricalData(historicalMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching historical data:', err)
    } finally {
      setLoading(false)
    }
  }

  const searchInvestments = async (query: string): Promise<any[]> => {
    if (!query.trim()) return []

    try {
      const response = await fetch('/api/market-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'search', query })
      })

      if (!response.ok) {
        throw new Error('Failed to search investments')
      }

      const data = await response.json()
      return data.results || []
    } catch (err) {
      console.error('Error searching investments:', err)
      return []
    }
  }

  // Auto-refresh quotes every 30 seconds
  useEffect(() => {
    if (quotes.length > 0) {
      const interval = setInterval(() => {
        const symbols = quotes.map(q => q.symbol)
        fetchQuotes(symbols)
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [quotes.length])

  return {
    quotes,
    historicalData,
    loading,
    error,
    fetchQuotes,
    fetchHistoricalData,
    searchInvestments
  }
}