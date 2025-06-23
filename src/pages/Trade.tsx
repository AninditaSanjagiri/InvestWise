import React, { useState } from 'react'
import { Search, TrendingUp, TrendingDown, ShoppingCart, Minus } from 'lucide-react'
import { mockStocks, searchStocks, getUpdatedPrice } from '../data/mockStocks'
import { usePortfolio } from '../hooks/usePortfolio'

const Trade: React.FC = () => {
  const { portfolio, holdings, buyStock, sellStock } = usePortfolio()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [shares, setShares] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const filteredStocks = searchTerm ? searchStocks(searchTerm) : mockStocks

  const handleTrade = async () => {
    if (!selectedStock || !shares || !portfolio) return

    const shareCount = parseInt(shares)
    if (shareCount <= 0) {
      setError('Please enter a valid number of shares')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (tradeType === 'buy') {
        await buyStock(selectedStock.symbol, selectedStock.company, shareCount, selectedStock.price)
      } else {
        await sellStock(selectedStock.symbol, shareCount, selectedStock.price)
      }
      
      setSelectedStock(null)
      setShares('')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getMaxShares = () => {
    if (!selectedStock || !portfolio) return 0
    
    if (tradeType === 'buy') {
      return Math.floor(portfolio.balance / selectedStock.price)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trade Stocks</h1>
          <p className="text-gray-600">Practice trading with your virtual portfolio</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Available Cash</p>
          <p className="text-2xl font-bold text-green-600">
            ${portfolio?.balance.toLocaleString() || '0'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Search and List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search stocks by symbol or company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Stock List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Available Stocks</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedStock?.symbol === stock.symbol ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedStock(stock)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">{stock.symbol}</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          {stock.sector}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{stock.company}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Volume: {stock.volume.toLocaleString()} | Market Cap: {stock.marketCap}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">${stock.price.toFixed(2)}</p>
                      <div className="flex items-center justify-end space-x-1">
                        {stock.change >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trade Panel */}
        <div className="space-y-6">
          {selectedStock ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trade {selectedStock.symbol}</h3>
              
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

                {/* Stock Info */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600">{selectedStock.company}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${selectedStock.price.toFixed(2)} per share
                  </p>
                </div>

                {/* Shares Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Shares
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={getMaxShares()}
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter shares"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max: {getMaxShares().toLocaleString()} shares
                  </p>
                </div>

                {/* Order Summary */}
                {shares && (
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <h4 className="font-medium text-gray-900">Order Summary</h4>
                    <div className="flex justify-between text-sm">
                      <span>Shares:</span>
                      <span>{parseInt(shares).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price per share:</span>
                      <span>${selectedStock.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Total:</span>
                      <span>${(parseInt(shares) * selectedStock.price).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

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
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                  ) : (
                    `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${selectedStock.symbol}`
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a stock to start trading</p>
              <p className="text-sm text-gray-400">Click on any stock from the list to view trading options</p>
            </div>
          )}

          {/* Current Holdings */}
          <div className="bg-white rounded-lg shadow-md p-6">
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default Trade