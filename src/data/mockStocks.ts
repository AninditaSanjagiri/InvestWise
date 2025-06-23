export interface Stock {
  symbol: string
  company: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: string
  sector: string
}

export const mockStocks: Stock[] = [
  {
    symbol: 'AAPL',
    company: 'Apple Inc.',
    price: 182.52,
    change: 2.45,
    changePercent: 1.36,
    volume: 45672000,
    marketCap: '2.85T',
    sector: 'Technology'
  },
  {
    symbol: 'GOOGL',
    company: 'Alphabet Inc.',
    price: 134.85,
    change: -1.23,
    changePercent: -0.90,
    volume: 28934000,
    marketCap: '1.67T',
    sector: 'Technology'
  },
  {
    symbol: 'MSFT',
    company: 'Microsoft Corporation',
    price: 378.91,
    change: 5.67,
    changePercent: 1.52,
    volume: 23456000,
    marketCap: '2.81T',
    sector: 'Technology'
  },
  {
    symbol: 'TSLA',
    company: 'Tesla, Inc.',
    price: 251.34,
    change: -8.92,
    changePercent: -3.43,
    volume: 67834000,
    marketCap: '800B',
    sector: 'Automotive'
  },
  {
    symbol: 'AMZN',
    company: 'Amazon.com Inc.',
    price: 145.73,
    change: 3.21,
    changePercent: 2.25,
    volume: 34567000,
    marketCap: '1.51T',
    sector: 'E-commerce'
  },
  {
    symbol: 'NVDA',
    company: 'NVIDIA Corporation',
    price: 467.89,
    change: 12.45,
    changePercent: 2.73,
    volume: 45678000,
    marketCap: '1.15T',
    sector: 'Technology'
  },
  {
    symbol: 'META',
    company: 'Meta Platforms Inc.',
    price: 334.56,
    change: -2.34,
    changePercent: -0.69,
    volume: 19876000,
    marketCap: '848B',
    sector: 'Technology'
  },
  {
    symbol: 'JPM',
    company: 'JPMorgan Chase & Co.',
    price: 156.78,
    change: 1.89,
    changePercent: 1.22,
    volume: 8765000,
    marketCap: '453B',
    sector: 'Financial'
  },
  {
    symbol: 'JNJ',
    company: 'Johnson & Johnson',
    price: 162.45,
    change: 0.87,
    changePercent: 0.54,
    volume: 6543000,
    marketCap: '427B',
    sector: 'Healthcare'
  },
  {
    symbol: 'V',
    company: 'Visa Inc.',
    price: 234.67,
    change: 2.11,
    changePercent: 0.91,
    volume: 4321000,
    marketCap: '495B',
    sector: 'Financial'
  }
]

// Simulate price updates
export const getUpdatedPrice = (currentPrice: number): number => {
  const changePercent = (Math.random() - 0.5) * 0.1 // -5% to +5% change
  return Number((currentPrice * (1 + changePercent)).toFixed(2))
}

export const searchStocks = (query: string): Stock[] => {
  return mockStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
    stock.company.toLowerCase().includes(query.toLowerCase())
  )
}