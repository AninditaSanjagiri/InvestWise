import React, { useEffect, useState } from 'react'
import { usePortfolio } from '../hooks/usePortfolio'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import LoadingSpinner from '../components/LoadingSpinner'
import SkeletonLoader from '../components/SkeletonLoader'
import InvestmentCalculators from '../components/InvestmentCalculators'
import NewsAndInsights from '../components/NewsAndInsights'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  BarChart3,
  Eye,
  EyeOff,
  PieChart,
  Target,
  Shield,
  Zap
} from 'lucide-react'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const { portfolio, holdings, transactions, loading } = usePortfolio()
  const [showBalance, setShowBalance] = useState(true)
  const [userRiskProfile, setUserRiskProfile] = useState<string>('')

  useEffect(() => {
    fetchUserProfile()
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return
    
    try {
      const { supabase } = await import('../lib/supabase')
      const { data } = await supabase
        .from('users')
        .select('risk_profile')
        .eq('id', user.id)
        .single()
      
      setUserRiskProfile(data?.risk_profile || '')
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const totalValue = portfolio ? portfolio.balance + holdings.reduce((sum, holding) => 
    sum + (holding.shares * holding.current_price), 0
  ) : 0

  const totalGainLoss = portfolio ? totalValue - 10000 : 0
  const totalGainLossPercent = ((totalGainLoss / 10000) * 100)

  // Calculate portfolio allocation
  const portfolioAllocation = holdings.map(holding => ({
    label: holding.symbol,
    value: holding.shares * holding.current_price,
    color: `hsl(${Math.random() * 360}, 70%, 60%)`
  }))

  if (portfolio?.balance > 0) {
    portfolioAllocation.push({
      label: 'Cash',
      value: portfolio.balance,
      color: '#10B981'
    })
  }

  // Mock chart data with more realistic progression
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Portfolio Value',
        data: [10000, 10200, 9800, 10500, 10300, totalValue],
        borderColor: totalGainLoss >= 0 ? '#059669' : '#DC2626',
        backgroundColor: totalGainLoss >= 0 ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString()
          }
        }
      },
      x: { grid: { display: false } },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  }

  const doughnutData = {
    labels: portfolioAllocation.map(item => item.label),
    datasets: [
      {
        data: portfolioAllocation.map(item => item.value),
        backgroundColor: portfolioAllocation.map(item => item.color),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const percentage = ((context.parsed / totalValue) * 100).toFixed(1)
            return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`
          }
        }
      }
    },
  }

  const getRiskProfileIcon = (profile: string) => {
    switch (profile) {
      case 'conservative': return Shield
      case 'moderate': return Target
      case 'aggressive': return Zap
      default: return BarChart3
    }
  }

  const getRiskProfileColor = (profile: string) => {
    switch (profile) {
      case 'conservative': return 'text-green-600'
      case 'moderate': return 'text-blue-600'
      case 'aggressive': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="lg" text="Loading your dashboard..." />
        </div>
        <SkeletonLoader type="card" count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader type="card" count={1} />
          <SkeletonLoader type="list" count={3} />
        </div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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
      {/* Header with Personalization */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!
          </h1>
          <div className="flex items-center space-x-4 mt-2">
            <p className="text-gray-600">Here's your portfolio overview</p>
            {userRiskProfile && (
              <div className="flex items-center space-x-2">
                {(() => {
                  const RiskIcon = getRiskProfileIcon(userRiskProfile)
                  return (
                    <>
                      <RiskIcon className={`h-4 w-4 ${getRiskProfileColor(userRiskProfile)}`} />
                      <span className={`text-sm font-medium ${getRiskProfileColor(userRiskProfile)}`}>
                        {userRiskProfile.charAt(0).toUpperCase() + userRiskProfile.slice(1)} Investor
                      </span>
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Portfolio Value',
            value: totalValue,
            icon: DollarSign,
            color: 'blue',
            format: 'currency',
            showToggle: true
          },
          {
            title: 'Available Cash',
            value: portfolio?.balance || 0,
            icon: Activity,
            color: 'green',
            format: 'currency'
          },
          {
            title: 'Total Gain/Loss',
            value: totalGainLoss,
            icon: totalGainLoss >= 0 ? TrendingUp : TrendingDown,
            color: totalGainLoss >= 0 ? 'green' : 'red',
            format: 'currency',
            percentage: totalGainLossPercent
          },
          {
            title: 'Active Holdings',
            value: holdings.length,
            icon: BarChart3,
            color: 'purple',
            format: 'number'
          }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              variants={itemVariants}
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
                          ? totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                          : 'text-gray-900'
                      }`}>
                        {showBalance ? `$${Math.abs(stat.value).toLocaleString()}` : '••••••'}
                      </p>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    )}
                    {stat.showToggle && (
                      <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                  {stat.percentage !== undefined && (
                    <p className={`text-sm font-medium ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalGainLoss >= 0 ? '+' : ''}{showBalance ? stat.percentage.toFixed(2) : '••'}%
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

      {/* Charts and Portfolio Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Performance Chart */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Portfolio Performance</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Last 6 months</span>
            </div>
          </div>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Portfolio Allocation */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Asset Allocation</h2>
          {portfolioAllocation.length > 0 ? (
            <div className="h-64">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No investments yet</p>
                <p className="text-sm text-gray-400">Start trading to see allocation</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Holdings and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Holdings */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Holdings</h2>
          <div className="space-y-4">
            {holdings.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No holdings yet</p>
                <p className="text-sm text-gray-400">Start trading to see your positions here</p>
              </div>
            ) : (
              holdings.slice(0, 5).map((holding, index) => {
                const gainLoss = holding.shares * (holding.current_price - holding.avg_price)
                const gainLossPercent = ((holding.current_price - holding.avg_price) / holding.avg_price) * 100
                
                return (
                  <motion.div
                    key={holding.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{holding.symbol}</span>
                        <span className="text-sm text-gray-500">{holding.shares} shares</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{holding.company_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(holding.shares * holding.current_price).toLocaleString()}
                      </p>
                      <div className="flex items-center space-x-1">
                        <p className={`text-sm font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {gainLoss >= 0 ? '+' : ''}${Math.abs(gainLoss).toFixed(2)}
                        </p>
                        <p className={`text-xs ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ({gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No transactions yet</p>
                <p className="text-sm text-gray-400">Your trading activity will appear here</p>
              </div>
            ) : (
              transactions.slice(0, 5).map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'buy' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'buy' ? (
                        <TrendingUp className={`h-4 w-4 text-green-600`} />
                      ) : (
                        <TrendingDown className={`h-4 w-4 text-red-600`} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.type.toUpperCase()} {transaction.symbol}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.shares} shares @ ${transaction.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${transaction.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Investment Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investment Calculators */}
        <motion.div variants={itemVariants}>
          <InvestmentCalculators />
        </motion.div>

        {/* News and Insights */}
        <motion.div variants={itemVariants}>
          <NewsAndInsights />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Dashboard