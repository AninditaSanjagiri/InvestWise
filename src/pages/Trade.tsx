import React, { useState, useEffect } from 'react'
import { Search, TrendingUp, TrendingDown, ShoppingCart, Minus, Filter, BarChart3 } from 'lucide-react'
import { usePortfolio } from '../hooks/usePortfolio'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import RiskAlignmentModal from '../components/RiskAlignmentModal'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from '../components/LoadingSpinner'

interface InvestmentOption {
  id: string
  name: string
  symbol: string
  type: string
  risk_category: 'Conservative' | 'Moderate' | 'Aggressive'
  description: string
  sector: string
  current_price: number
  price_change: number
  price_change_percent: number
  market_cap: string
  pe_ratio: number
  volume: number
}

const Trade: React.FC = () => {
  const { user } = useAuth()
  const { portfolio, holdings, buyStock, sellStock } = usePortfolio()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStock, setSelectedStock] = useState<InvestmentOption | null>(null)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [shares, setShares] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [investments, setInvestments] = useState<InvestmentOption[]>([])
  const [filteredInvestments, setFilteredInvestments] = useState<InvestmentOption[]>([])
  const [selectedType, setSelectedType] = useState('All')
  const [selectedRisk, setSelectedRisk] = useState('All')
  const [userRiskProfile, setUserRiskProfile] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate')
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [pendingTrade, setPendingTrade] = useState<{stock: InvestmentOption, shares: number} | null>(null)

  useEffect(() => {
    fetchInvestments()
    fetchUserProfile()
  }, [])

  useEffect(() => {
    filterInvestments()
  }, [searchTerm, selectedType, selectedRisk, investments])

  const fetchUserProfile = async () => {
    if (!user) return
    
    try {
      const { data } = await supabase
        .from('users')
        .select('risk_profile')
        .eq('id', user.id)
        .single()
      
      if (data?.risk_profile) {
        setUserRiskProfile(data.risk_profile)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

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
    }
  }

  const filterInvestments = () => {
    let filtered = investments

    if (searchTerm) {
      filtered = filtered.filter(investment =>
        investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investment.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investment.sector.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedType !== 'All') {
      filtered = filtered.filter(investment => investment.type === selectedType)
    }

    if (selectedRisk !== 'All') {
      filtered = filtered.filter(investment => investment.risk_category === selectedRisk)
    }

    setFilteredInvestments(filtered)
  }

  const checkRiskAlignment = (investment: InvestmentOption): boolean => {
    const userRisk = userRiskProfile.toLowerCase()
    const investmentRisk = investment.risk_category.toLowerCase()
    
    // Conservative users shouldn't buy aggressive investments
    if (userRisk === 'conservative' && investmentRisk === 'aggressive') return false
    
    // Moderate users can buy anything except aggressive (optional check)
    // if (userRisk === 'moderate' && investmentRisk === 'aggressive') return false
    
    return true
  }

  const handleTrade = async () => {
    if (!selectedStock || !shares || !portfolio) return

    const shareCount = parseInt(shares)
    if (shareCount <= 0) {
      setError('Please enter a valid number of shares')
      return
    }

    // Check risk alignment for buy orders
    if (tradeType === 'buy' && !checkRiskAlignment(selectedStock)) {
      setPendingTrade({ stock: selectedStock, shares: shareCount })
      setShowRiskModal(true)
      return
    }

    await executeTrade(selectedStock, shareCount)
  }

  const executeTrade = async (stock: InvestmentOption, shareCount: number) => {
    setLoading(true)
    setError('')

    try {
      if (tradeType === 'buy') {
        await buyStock(stock.symbol, stock.name, shareCount, stock.current_price)
      } else {
        await sellStock(stock.symbol, shareCount, stock.current_price)
      }
      
      setSelectedStock(null)
      setShares('')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRiskModalProceed = () => {
    if (pendingTrade) {
      executeTrade(pendingTrade.stock, pendingTrade.shares)
      setPendingTrade(null)
    }
    setShowRiskModal(false)
  }

  const handleRiskModalClose = () => {
    setPendingTrade(null)
    setShowRiskModal(false)
  }

  const getMaxShares = () => {
    if (!selectedStock || !portfolio) return 0
    
    if (tradeType === 'buy') {
      return Math.floor(portfolio.balance / selectedStock.current_price)
    } else {
      const holding = holdings.find(h => h.symbol === selectedStock.symbol)
      return holding ? holding.shares : 0
    }
  }

  const canTrade = () => {
    const shareCount = parseInt(shares)
    const maxShares = getMaxShares()
    return shareCount > 0 && shareCount <= maxShares
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
      case 'Stock': return '📈'
      case 'ETF': return '📊'
      case 'Mutual Fund': return '🏦'
      case 'Bond': return '💰'
      case 'Gold': return '🥇'
      case 'Silver': return '🥈'
      case 'Fixed Deposit': return '🏛️'
      default: return '📈'
    }
  }

  const investmentTypes = ['All', ...Array.from(new Set(investments.map(inv => inv.type)))]
  const riskCategories = ['All', 'Conservative', 'Moderate', 'Aggressive']

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trade Investments</h1>
          <p className="text-gray-600">Explore and trade various investment options</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Available Cash</p>
          <p className="text-2xl font-bold text-green-600">
            ${portfolio?.balance.toLocaleString() || '0'}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Investment Search and List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="space-y-4">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by name, symbol, or sector..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {investmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {riskCategories.map(risk => (
                    <option key={risk} value={risk}>{risk} Risk</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Investment List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Available Investments ({filteredInvestments.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredInvestments.length === 0 ? (
                <div className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No investments found</p>
                  <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredInvestments.map((investment, index) => (
                  <motion.div
                    key={investment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-6 hover:bg-gray-50 cursor-pointer transition-all ${
                      selectedStock?.id === investment.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedStock(investment)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getTypeIcon(investment.type)}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{investment.symbol}</h3>
                            <p className="text-sm text-gray-600">{investment.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(investment.risk_category)}`}>
                            {investment.risk_category}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                            {investment.type}
                          </span>
                          {investment.sector && (
                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-600 rounded-full">
                              {investment.sector}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">{investment.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xl font-bold text-gray-900">${investment.current_price.toFixed(2)}</p>
                        <div className="flex items-center justify-end space-x-1">
                          {investment.price_change >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${
                            investment.price_change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {investment.price_change >= 0 ? '+' : ''}{investment.price_change_percent.toFixed(2)}%
                          </span>
                        </div>
                        {investment.volume > 0 && (
                          <p className="text-xs text-gray-500">Vol: {investment.volume.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Trade Panel */}
        <div className="space-y-6">
          {selectedStock ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Trade {selectedStock.symbol}
              </h3>
              
              <div className="space-y-4">
                {/* Trade Type */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTradeType('buy')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                      tradeType === 'buy'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4 inline mr-2" />
                    Buy
                  </button>
                  <button
                    onClick={() => setTradeType('sell')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                      tradeType === 'sell'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Minus className="h-4 w-4 inline mr-2" />
                    Sell
                  </button>
                </div>

                {/* Investment Info */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">{getTypeIcon(selectedStock.type)}</span>
                    <div>
                      <p className="text-sm text-gray-600">{selectedStock.name}</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${selectedStock.current_price.toFixed(2)} per {selectedStock.type === 'Stock' ? 'share' : 'unit'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(selectedStock.risk_category)}`}>
                      {selectedStock.risk_category} Risk
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      {selectedStock.type}
                    </span>
                  </div>
                </div>

                {/* Risk Warning for Misaligned Investments */}
                {tradeType === 'buy' && !checkRiskAlignment(selectedStock) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex items-start space-x-2">
                      <div className="text-yellow-600">⚠️</div>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Risk Mismatch</p>
                        <p className="text-xs text-yellow-700">
                          This {selectedStock.risk_category.toLowerCase()} risk investment may not align with your {userRiskProfile} risk profile.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shares Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of {selectedStock.type === 'Stock' ? 'Shares' : 'Units'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={getMaxShares()}
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter quantity"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max: {getMaxShares().toLocaleString()} {selectedStock.type === 'Stock' ? 'shares' : 'units'}
                  </p>
                </div>

                {/* Order Summary */}
                {shares && (
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <h4 className="font-medium text-gray-900">Order Summary</h4>
                    <div className="flex justify-between text-sm">
                      <span>Quantity:</span>
                      <span>{parseInt(shares).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price per unit:</span>
                      <span>${selectedStock.current_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Total:</span>
                      <span>${(parseInt(shares) * selectedStock.current_price).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Trade Button */}
                <button
                  onClick={handleTrade}
                  disabled={!canTrade() || loading}
                  className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                    canTrade() && !loading
                      ? tradeType === 'buy'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${selectedStock.symbol}`
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-8 text-center"
            >
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select an investment to start trading</p>
              <p className="text-sm text-gray-400">Choose from stocks, ETFs, bonds, and more</p>
            </motion.div>
          )}

          {/* Current Holdings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Holdings</h3>
            {holdings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No holdings yet</p>
            ) : (
              <div className="space-y-3">
                {holdings.map((holding) => (
                  <div key={holding.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium text-gray-900">{holding.symbol}</p>
                      <p className="text-sm text-gray-600">{holding.shares} shares</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${(holding.shares * holding.current_price).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        @${holding.current_price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Risk Alignment Modal */}
      <RiskAlignmentModal
        isOpen={showRiskModal}
        onClose={handleRiskModalClose}
        onProceed={handleRiskModalProceed}
        userRiskProfile={userRiskProfile}
        investmentRisk={selectedStock?.risk_category || 'Moderate'}
        investmentName={selectedStock?.name || ''}
      />
    </div>
  )
}

export default Trade