import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  TrendingUp, 
  BarChart3, 
  DollarSign,
  Building,
  Info,
  Star,
  Eye,
  Calendar
} from 'lucide-react'
import { useMarketData } from '../hooks/useMarketData'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'
import { Line } from 'react-chartjs-2'

interface InvestmentOption {
  id: string
  name: string
  symbol: string
  type: string
  risk_category: string
  description: string
  sector: string
  current_price: number
  price_change: number
  price_change_percent: number
  market_cap: string
  pe_ratio: number
  volume: number
}

const Research: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentOption | null>(null)
  const [investments, setInvestments] = useState<InvestmentOption[]>([])
  const [loading, setLoading] = useState(true)
  const [chartPeriod, setChartPeriod] = useState('1M')
  
  const { historicalData, fetchHistoricalData, searchInvestments } = useMarketData()

  useEffect(() => {
    fetchInvestments()
  }, [])

  useEffect(() => {
    if (selectedInvestment) {
      fetchHistoricalData([selectedInvestment.symbol], chartPeriod)
    }
  }, [selectedInvestment, chartPeriod])

  const fetchInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from('investment_options')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setInvestments(data || [])
    } catch (error) {
      console.error('Error fetching investments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchTerm(query)
    if (query.trim()) {
      const results = await searchInvestments(query)
      setInvestments(results)
    } else {
      fetchInvestments()
    }
  }

  const getChartData = () => {
    if (!selectedInvestment || !historicalData[selectedInvestment.symbol]) {
      return null
    }

    const data = historicalData[selectedInvestment.symbol]
    return {
      labels: data.map(point => new Date(point.timestamp).toLocaleDateString()),
      datasets: [
        {
          label: selectedInvestment.symbol,
          data: data.map(point => point.price),
          borderColor: selectedInvestment.price_change >= 0 ? '#10B981' : '#EF4444',
          backgroundColor: selectedInvestment.price_change >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    }
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(0, 0, 0, 0.1)' }
      },
      x: {
        grid: { display: false }
      }
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Conservative': return 'bg-green-100 text-green-800'
      case 'Moderate': return 'bg-blue-100 text-blue-800'
      case 'Aggressive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Stock': return Building
      case 'ETF': case 'Mutual Fund': return BarChart3
      case 'Bond': return DollarSign
      default: return TrendingUp
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading research data..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investment Research</h1>
          <p className="text-gray-600">Analyze investments with detailed data and insights</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
        >
          <BarChart3 className="h-6 w-6 text-white" />
        </motion.div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="relative">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search investments by name or symbol..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Investment List */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Investment Options</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {investments.map((investment, index) => {
                const TypeIcon = getTypeIcon(investment.type)
                return (
                  <motion.div
                    key={investment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedInvestment(investment)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedInvestment?.id === investment.id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <TypeIcon className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{investment.symbol}</h3>
                          <p className="text-sm text-gray-600 line-clamp-1">{investment.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${investment.current_price.toFixed(2)}
                        </p>
                        <p className={`text-sm ${
                          investment.price_change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {investment.price_change >= 0 ? '+' : ''}
                          {investment.price_change_percent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(investment.risk_category)}`}>
                        {investment.risk_category}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {investment.type}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Research Details */}
        <div className="lg:col-span-2">
          {selectedInvestment ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Investment Header */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedInvestment.name}</h1>
                    <p className="text-lg text-gray-600">{selectedInvestment.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">
                      ${selectedInvestment.current_price.toFixed(2)}
                    </p>
                    <div className="flex items-center space-x-2">
                      {selectedInvestment.price_change >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />
                      )}
                      <span className={`font-medium ${
                        selectedInvestment.price_change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedInvestment.price_change >= 0 ? '+' : ''}
                        {selectedInvestment.price_change.toFixed(2)} ({selectedInvestment.price_change_percent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold text-gray-900">{selectedInvestment.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Risk Level</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(selectedInvestment.risk_category)}`}>
                      {selectedInvestment.risk_category}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sector</p>
                    <p className="font-semibold text-gray-900">{selectedInvestment.sector || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Volume</p>
                    <p className="font-semibold text-gray-900">
                      {selectedInvestment.volume ? selectedInvestment.volume.toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Price Chart</h2>
                  <div className="flex space-x-2">
                    {['1D', '1W', '1M', '3M', '1Y'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setChartPeriod(period)}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          chartPeriod === period
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-64">
                  {getChartData() ? (
                    <Line data={getChartData()!} options={chartOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <LoadingSpinner text="Loading chart data..." />
                    </div>
                  )}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {selectedInvestment.market_cap && (
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Market Cap</p>
                      <p className="text-xl font-bold text-gray-900">{selectedInvestment.market_cap}</p>
                    </div>
                  )}
                  {selectedInvestment.pe_ratio && (
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">P/E Ratio</p>
                      <p className="text-xl font-bold text-gray-900">{selectedInvestment.pe_ratio}</p>
                    </div>
                  )}
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">24h Volume</p>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedInvestment.volume ? selectedInvestment.volume.toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">
                  {selectedInvestment.description || 'No description available for this investment.'}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-12 text-center"
            >
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Select an Investment</h2>
              <p className="text-gray-600">
                Choose an investment from the list to view detailed research and analysis.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Research