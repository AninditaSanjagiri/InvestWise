import React from 'react'
import { usePortfolio } from '../hooks/usePortfolio'
import { motion } from 'framer-motion'
import LoadingSpinner from '../components/LoadingSpinner'
import SkeletonLoader from '../components/SkeletonLoader'
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
      <div className="space-y-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="lg" text="Loading your portfolio..." />
        </div>
        <SkeletonLoader type="card" count={4} />
        <SkeletonLoader type="table" count={5} />
      </div>
    )
  }

  const totalValue = portfolio ? portfolio.balance + holdings.reduce((sum, holding) => 
    sum + (holding.shares * holding.current_price), 0
  ) : 0

  const totalGainLoss = portfolio ? totalValue - 10000 : 0

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-600">Detailed view of your investment portfolio and performance</p>
        </div>
      </motion.div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Portfolio Value',
            value: totalValue,
            icon: PieChart,
            color: 'blue'
          },
          {
            title: 'Cash Balance',
            value: portfolio?.balance || 0,
            icon: DollarSign,
            color: 'green'
          },
          {
            title: 'Total Gain/Loss',
            value: totalGainLoss,
            icon: totalGainLoss >= 0 ? TrendingUp : TrendingDown,
            color: totalGainLoss >= 0 ? 'green' : 'red'
          },
          {
            title: 'Active Positions',
            value: holdings.length,
            icon: BarChart3,
            color: 'purple'
          }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <div className="flex items-center space-x-1">
                    <p className={`text-2xl font-bold ${
                      stat.title === 'Total Gain/Loss' 
                        ? totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                        : 'text-gray-900'
                    }`}>
                      {stat.title === 'Active Positions' 
                        ? stat.value 
                        : `$${Math.abs(stat.value).toLocaleString()}`
                      }
                    </p>
                    {stat.title === 'Total Gain/Loss' && totalGainLoss !== 0 && (
                      <Icon className={`h-5 w-5 ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    )}
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`p-3 bg-${stat.color}-50 rounded-full`}
                >
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </motion.div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Holdings Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg shadow-md p-6"
      >
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
                {holdings.map((holding, index) => {
                  const marketValue = holding.shares * holding.current_price
                  const gainLoss = holding.shares * (holding.current_price - holding.avg_price)
                  const gainLossPercent = ((holding.current_price - holding.avg_price) / holding.avg_price) * 100
                  
                  return (
                    <motion.tr
                      key={holding.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50"
                    >
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
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Portfolio Allocation */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Allocation</h2>
        {holdings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No holdings to display allocation</p>
          </div>
        ) : (
          <div className="space-y-4">
            {holdings.map((holding, index) => {
              const marketValue = holding.shares * holding.current_price
              const percentage = (marketValue / totalValue) * 100
              
              return (
                <motion.div
                  key={holding.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">{holding.symbol}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1, duration: 0.8 }}
                        className="bg-blue-500 h-2 rounded-full" 
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </motion.div>
              )
            })}
            
            {/* Cash allocation */}
            {portfolio && portfolio.balance > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: holdings.length * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Cash</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(portfolio.balance / totalValue) * 100}%` }}
                      transition={{ delay: holdings.length * 0.1, duration: 0.8 }}
                      className="bg-green-500 h-2 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-12 text-right">
                    {((portfolio.balance / totalValue) * 100).toFixed(1)}%
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default Portfolio