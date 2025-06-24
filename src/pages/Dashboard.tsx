import React, { useEffect, useState } from 'react'
import { usePortfolio } from '../hooks/usePortfolio'
import { motion } from 'framer-motion'
import LoadingSpinner from '../components/LoadingSpinner'
import SkeletonLoader from '../components/SkeletonLoader'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const Dashboard: React.FC = () => {
  const { portfolio, holdings, transactions, loading } = usePortfolio()
  const [showBalance, setShowBalance] = useState(true)

  const totalValue = portfolio ? portfolio.balance + holdings.reduce((sum, holding) => 
    sum + (holding.shares * holding.current_price), 0
  ) : 0

  const totalGainLoss = portfolio ? totalValue - 10000 : 0
  const totalGainLossPercent = ((totalGainLoss / 10000) * 100)

  // Mock chart data
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Portfolio Value',
        data: [10000, 10200, 9800, 10500, 10300, totalValue],
        borderColor: totalGainLoss >= 0 ? '#059669' : '#DC2626',
        backgroundColor: totalGainLoss >= 0 ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)',
        tension: 0.4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your portfolio overview.</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Value',
            value: totalValue,
            icon: DollarSign,
            color: 'blue',
            format: 'currency'
          },
          {
            title: 'Cash Balance',
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
            title: 'Holdings',
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
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
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
                    {stat.title === 'Total Value' && (
                      <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                  {stat.percentage !== undefined && (
                    <p className={`text-sm ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalGainLoss >= 0 ? '+' : ''}{showBalance ? stat.percentage.toFixed(2) : '••'}%
                    </p>
                  )}
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

      {/* Chart and Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Chart */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Performance</h2>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Top Holdings */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Holdings</h2>
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
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{holding.symbol}</span>
                        <span className="text-sm text-gray-500">{holding.shares} shares</span>
                      </div>
                      <p className="text-sm text-gray-600">{holding.company_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(holding.shares * holding.current_price).toLocaleString()}
                      </p>
                      <div className="flex items-center space-x-1">
                        <p className={`text-sm ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
      </div>

      {/* Recent Transactions */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400">Your trading activity will appear here</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shares
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.slice(0, 10).map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{transaction.symbol}</div>
                        <div className="text-sm text-gray-500">{transaction.company_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'buy' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.shares}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${transaction.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${transaction.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Dashboard