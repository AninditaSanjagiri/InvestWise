import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, Eye, EyeOff } from 'lucide-react'

interface RealTimePortfolioStatsProps {
  portfolioData: {
    totalValue: number
    totalInvested: number
    totalGainLoss: number
    totalGainLossPercent: number
    cashBalance: number
    savingsBalance: number
    holdings: any[]
  }
  showBalance: boolean
  onToggleBalance: () => void
}

const RealTimePortfolioStats: React.FC<RealTimePortfolioStatsProps> = ({
  portfolioData,
  showBalance,
  onToggleBalance
}) => {
  const stats = [
    {
      title: 'Total Portfolio Value',
      value: portfolioData.totalValue,
      icon: DollarSign,
      color: 'blue',
      format: 'currency',
      showToggle: true
    },
    {
      title: 'Available Cash',
      value: portfolioData.cashBalance,
      icon: Activity,
      color: 'green',
      format: 'currency'
    },
    {
      title: 'Total Gain/Loss',
      value: portfolioData.totalGainLoss,
      icon: portfolioData.totalGainLoss >= 0 ? TrendingUp : TrendingDown,
      color: portfolioData.totalGainLoss >= 0 ? 'green' : 'red',
      format: 'currency',
      percentage: portfolioData.totalGainLossPercent
    },
    {
      title: 'Active Holdings',
      value: portfolioData.holdings.length,
      icon: BarChart3,
      color: 'purple',
      format: 'number'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <div className="flex items-center space-x-2">
                  {stat.format === 'currency' ? (
                    <p className={`text-2xl font-bold ${
                      stat.title === 'Total Gain/Loss' 
                        ? portfolioData.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                        : 'text-gray-900'
                    }`}>
                      {showBalance ? `$${Math.abs(stat.value).toLocaleString()}` : '••••••'}
                    </p>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  )}
                  {stat.showToggle && (
                    <button
                      onClick={onToggleBalance}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  )}
                </div>
                {stat.percentage !== undefined && (
                  <p className={`text-sm font-medium ${portfolioData.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {portfolioData.totalGainLoss >= 0 ? '+' : ''}{showBalance ? stat.percentage.toFixed(2) : '••'}%
                  </p>
                )}
              </div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`p-3 bg-${stat.color}-50 rounded-xl`}
              >
                <Icon className={`h-6 w-6 text-${stat.color}-600`} />
              </motion.div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default RealTimePortfolioStats