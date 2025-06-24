import React from 'react'
import { usePortfolio } from '../hooks/usePortfolio'
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  BarChart3,
  Activity
} from 'lucide-react'

const Portfolio: React.FC = () => {
  const { portfolio, holdings, loading } = usePortfolio()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalValue = portfolio ? portfolio.balance + holdings.reduce((sum, holding) => 
    sum + (holding.shares * holding.current_price), 0
  ) : 0

  const totalGainLoss = portfolio ? totalValue - 10000 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-600">Detailed view of your investment portfolio and performance</p>
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalValue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <PieChart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cash Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                ${portfolio?.balance.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Gain/Loss</p>
              <div className="flex items-center space-x-1">
                <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(totalGainLoss).toLocaleString()}
                </p>
                {totalGainLoss >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>
            <div className={`p-3 rounded-full ${totalGainLoss >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <Activity className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Positions</p>
              <p className="text-2xl font-bold text-gray-900">{holdings.length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Holdings</h2>
        {holdings.length === 0 ? (
          <div className="text-center py-12">
            <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No holdings yet</p>
            <p className="text-gray-400">Start trading to build your portfolio</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shares
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gain/Loss
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {holdings.map((holding) => {
                  const marketValue = holding.shares * holding.current_price
                  const gainLoss = holding.shares * (holding.current_price - holding.avg_price)
                  const gainLossPercent = ((holding.current_price - holding.avg_price) / holding.avg_price) * 100
                  
                  return (
                    <tr key={holding.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{holding.symbol}</div>
                          <div className="text-sm text-gray-500">{holding.company_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {holding.shares.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${holding.avg_price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${holding.current_price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${marketValue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {gainLoss >= 0 ? '+' : ''}${Math.abs(gainLoss).toFixed(2)}
                        </div>
                        <div className={`text-xs ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ({gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Portfolio Allocation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Allocation</h2>
        {holdings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No holdings to display allocation</p>
          </div>
        ) : (
          <div className="space-y-4">
            {holdings.map((holding) => {
              const marketValue = holding.shares * holding.current_price
              const percentage = (marketValue / totalValue) * 100
              
              return (
                <div key={holding.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">{holding.symbol}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )
            })}
            
            {/* Cash allocation */}
            {portfolio && portfolio.balance > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Cash</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(portfolio.balance / totalValue) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-12 text-right">
                    {((portfolio.balance / totalValue) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Portfolio