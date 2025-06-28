import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Banknote, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PiggyBank, 
  Building,
  TrendingUp,
  Clock,
  DollarSign,
  Plus,
  History,
  Calculator
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

interface UserBalance {
  cash_balance: number
  savings_balance: number
}

interface FundTransfer {
  id: string
  transfer_type: string
  amount: number
  from_account: string
  to_account: string
  description: string
  created_at: string
}

interface FixedDeposit {
  id: string
  amount: number
  tenure_months: number
  interest_rate: number
  maturity_date: string
  created_at: string
  status: 'active' | 'matured'
}

const Bank: React.FC = () => {
  const { user } = useAuth()
  const [balances, setBalances] = useState<UserBalance>({ cash_balance: 0, savings_balance: 0 })
  const [transfers, setTransfers] = useState<FundTransfer[]>([])
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([])
  const [loading, setLoading] = useState(true)
  const [transferAmount, setTransferAmount] = useState('')
  const [transferType, setTransferType] = useState<'cash_to_savings' | 'savings_to_cash'>('cash_to_savings')
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showFDModal, setShowFDModal] = useState(false)
  const [fdAmount, setFdAmount] = useState('')
  const [fdTenure, setFdTenure] = useState('12')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Fetch user balances
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('cash_balance, savings_balance')
        .eq('id', user!.id)
        .single()

      if (userError) throw userError

      setBalances(userData || { cash_balance: 0, savings_balance: 0 })

      // Fetch transfer history
      const { data: transferData, error: transferError } = await supabase
        .from('fund_transfers')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (transferError) throw transferError
      setTransfers(transferData || [])

      // Mock fixed deposits for now
      setFixedDeposits([])

    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load account data')
    } finally {
      setLoading(false)
    }
  }

  const handleTransfer = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const amount = parseFloat(transferAmount)
    const fromAccount = transferType === 'cash_to_savings' ? 'cash' : 'savings'
    const toAccount = transferType === 'cash_to_savings' ? 'savings' : 'cash'
    const availableBalance = transferType === 'cash_to_savings' ? balances.cash_balance : balances.savings_balance

    if (amount > availableBalance) {
      toast.error('Insufficient balance')
      return
    }

    setIsProcessing(true)

    try {
      // Update balances
      const newCashBalance = transferType === 'cash_to_savings' 
        ? balances.cash_balance - amount 
        : balances.cash_balance + amount
      const newSavingsBalance = transferType === 'cash_to_savings' 
        ? balances.savings_balance + amount 
        : balances.savings_balance - amount

      const { error: updateError } = await supabase
        .from('users')
        .update({
          cash_balance: newCashBalance,
          savings_balance: newSavingsBalance
        })
        .eq('id', user!.id)

      if (updateError) throw updateError

      // Record transfer
      const { error: transferError } = await supabase
        .from('fund_transfers')
        .insert({
          user_id: user!.id,
          transfer_type: transferType,
          amount,
          from_account: fromAccount,
          to_account: toAccount,
          description: `Transfer from ${fromAccount} to ${toAccount}`
        })

      if (transferError) throw transferError

      setBalances({ cash_balance: newCashBalance, savings_balance: newSavingsBalance })
      toast.success(`Successfully transferred $${amount.toLocaleString()} to ${toAccount}`)
      setShowTransferModal(false)
      setTransferAmount('')
      fetchUserData()

    } catch (error) {
      console.error('Error processing transfer:', error)
      toast.error('Failed to process transfer')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateFD = async () => {
    if (!fdAmount || parseFloat(fdAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const amount = parseFloat(fdAmount)
    if (amount > balances.cash_balance) {
      toast.error('Insufficient cash balance')
      return
    }

    setIsProcessing(true)

    try {
      // Deduct from cash balance
      const newCashBalance = balances.cash_balance - amount

      const { error: updateError } = await supabase
        .from('users')
        .update({ cash_balance: newCashBalance })
        .eq('id', user!.id)

      if (updateError) throw updateError

      // Record FD creation as a transfer
      const { error: transferError } = await supabase
        .from('fund_transfers')
        .insert({
          user_id: user!.id,
          transfer_type: 'fd_creation',
          amount,
          from_account: 'cash',
          to_account: 'fixed_deposit',
          description: `Fixed Deposit created for ${fdTenure} months`
        })

      if (transferError) throw transferError

      setBalances(prev => ({ ...prev, cash_balance: newCashBalance }))
      toast.success(`Fixed Deposit of $${amount.toLocaleString()} created successfully!`)
      setShowFDModal(false)
      setFdAmount('')
      fetchUserData()

    } catch (error) {
      console.error('Error creating FD:', error)
      toast.error('Failed to create Fixed Deposit')
    } finally {
      setIsProcessing(false)
    }
  }

  const getFDInterestRate = (tenure: string) => {
    const rates = {
      '6': 5.5,
      '12': 6.5,
      '24': 7.2,
      '36': 7.8
    }
    return rates[tenure as keyof typeof rates] || 6.5
  }

  const calculateFDMaturity = (amount: number, tenure: string) => {
    const rate = getFDInterestRate(tenure)
    const years = parseInt(tenure) / 12
    return amount * Math.pow(1 + rate / 100, years)
  }

  const totalFDValue = fixedDeposits.reduce((sum, fd) => sum + fd.amount, 0)
  const totalBalance = balances.cash_balance + balances.savings_balance + totalFDValue

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading your bank account..." />
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
          <h1 className="text-3xl font-bold text-gray-900">Bank Account</h1>
          <p className="text-gray-600">Manage your funds and allocate money across different accounts</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
        >
          <Banknote className="h-6 w-6 text-white" />
        </motion.div>
      </motion.div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Balance',
            amount: totalBalance,
            icon: DollarSign,
            color: 'blue',
            description: 'All accounts combined'
          },
          {
            title: 'Available Cash',
            amount: balances.cash_balance,
            icon: Banknote,
            color: 'green',
            description: 'Ready for trading'
          },
          {
            title: 'Savings Account',
            amount: balances.savings_balance,
            icon: PiggyBank,
            color: 'purple',
            description: 'Secure savings'
          },
          {
            title: 'Fixed Deposits',
            amount: totalFDValue,
            icon: Building,
            color: 'orange',
            description: 'Locked investments'
          }
        ].map((account, index) => {
          const Icon = account.icon
          return (
            <motion.div
              key={account.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-${account.color}-50 rounded-full`}>
                  <Icon className={`h-6 w-6 text-${account.color}-600`} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ${account.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">{account.description}</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{account.title}</h3>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setTransferType('cash_to_savings')
              setShowTransferModal(true)
            }}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-all"
          >
            <ArrowUpRight className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">Transfer to Savings</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setTransferType('savings_to_cash')
              setShowTransferModal(true)
            }}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg hover:from-green-100 hover:to-blue-100 transition-all"
          >
            <ArrowDownLeft className="h-5 w-5 text-green-600" />
            <span className="font-medium text-gray-900">Withdraw from Savings</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFDModal(true)}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg hover:from-orange-100 hover:to-red-100 transition-all"
          >
            <Plus className="h-5 w-5 text-orange-600" />
            <span className="font-medium text-gray-900">Create Fixed Deposit</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <History className="h-5 w-5 text-gray-400" />
        </div>

        {transfers.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transactions yet</p>
            <p className="text-sm text-gray-400">Your fund transfers will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transfers.map((transfer, index) => (
              <motion.div
                key={transfer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    transfer.transfer_type.includes('savings') ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    {transfer.transfer_type === 'cash_to_savings' ? (
                      <ArrowUpRight className="h-4 w-4 text-purple-600" />
                    ) : transfer.transfer_type === 'savings_to_cash' ? (
                      <ArrowDownLeft className="h-4 w-4 text-green-600" />
                    ) : (
                      <Building className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transfer.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transfer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${transfer.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {transfer.from_account} → {transfer.to_account}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {transferType === 'cash_to_savings' ? 'Transfer to Savings' : 'Withdraw from Savings'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Available: ${(transferType === 'cash_to_savings' ? balances.cash_balance : balances.savings_balance).toLocaleString()}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransfer}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? <LoadingSpinner size="sm" /> : 'Transfer'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Fixed Deposit Modal */}
      {showFDModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Create Fixed Deposit</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={fdAmount}
                  onChange={(e) => setFdAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Available Cash: ${balances.cash_balance.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenure
                </label>
                <select
                  value={fdTenure}
                  onChange={(e) => setFdTenure(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="6">6 Months - {getFDInterestRate('6')}% p.a.</option>
                  <option value="12">1 Year - {getFDInterestRate('12')}% p.a.</option>
                  <option value="24">2 Years - {getFDInterestRate('24')}% p.a.</option>
                  <option value="36">3 Years - {getFDInterestRate('36')}% p.a.</option>
                </select>
              </div>

              {fdAmount && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Maturity Details</h4>
                  <div className="text-sm text-green-800 space-y-1">
                    <p>Principal: ${parseFloat(fdAmount).toLocaleString()}</p>
                    <p>Interest Rate: {getFDInterestRate(fdTenure)}% per annum</p>
                    <p>Maturity Amount: ${calculateFDMaturity(parseFloat(fdAmount), fdTenure).toLocaleString()}</p>
                    <p>Profit: ${(calculateFDMaturity(parseFloat(fdAmount), fdTenure) - parseFloat(fdAmount)).toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowFDModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFD}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? <LoadingSpinner size="sm" /> : 'Create FD'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Bank