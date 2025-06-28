import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Portfolio, Holding, Transaction } from '../types'
import toast from 'react-hot-toast'

export const usePortfolio = () => {
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [userBalances, setUserBalances] = useState({ cash_balance: 0, savings_balance: 0 })

  useEffect(() => {
    if (user) {
      fetchPortfolioData()
      // Set up real-time updates
      const interval = setInterval(fetchPortfolioData, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchPortfolioData = async () => {
    try {
      setLoading(true)
      
      // Get user balances first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('cash_balance, savings_balance')
        .eq('id', user!.id)
        .single()

      if (userError) throw userError
      
      const balances = userData || { cash_balance: 10000, savings_balance: 0 }
      setUserBalances(balances)

      // Get or create portfolio
      let { data: portfolioData } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user!.id)
        .single()

      if (!portfolioData) {
        // Create initial portfolio
        const { data: newPortfolio } = await supabase
          .from('portfolios')
          .insert({
            user_id: user!.id,
            balance: balances.cash_balance,
            total_value: balances.cash_balance + balances.savings_balance
          })
          .select()
          .single()
        
        portfolioData = newPortfolio
      } else {
        // Update portfolio balance to match user's cash balance
        await supabase
          .from('portfolios')
          .update({ 
            balance: balances.cash_balance,
            total_value: balances.cash_balance + balances.savings_balance
          })
          .eq('id', portfolioData.id)
        
        portfolioData.balance = balances.cash_balance
        portfolioData.total_value = balances.cash_balance + balances.savings_balance
      }

      setPortfolio(portfolioData)

      // Get holdings with current prices from investment_options
      const { data: holdingsData } = await supabase
        .from('holdings')
        .select(`
          *,
          investment_options!inner(current_price, price_change, price_change_percent, name)
        `)
        .eq('portfolio_id', portfolioData.id)

      // Calculate real-time values for holdings
      const updatedHoldings = holdingsData?.map(holding => ({
        ...holding,
        current_price: holding.investment_options.current_price,
        company_name: holding.investment_options.name
      })) || []

      setHoldings(updatedHoldings)

      // Get recent transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('portfolio_id', portfolioData.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setTransactions(transactionsData || [])

    } catch (error) {
      console.error('Error fetching portfolio:', error)
      toast.error('Failed to load portfolio data')
    } finally {
      setLoading(false)
    }
  }

  const buyStock = async (symbol: string, companyName: string, shares: number, price: number) => {
    if (!portfolio) return

    const total = shares * price

    if (userBalances.cash_balance < total) {
      toast.error('Insufficient funds')
      throw new Error('Insufficient funds')
    }

    try {
      const loadingToast = toast.loading('Processing buy order...')

      // Update user's cash balance
      const newCashBalance = userBalances.cash_balance - total
      await supabase
        .from('users')
        .update({ cash_balance: newCashBalance })
        .eq('id', user!.id)

      // Update portfolio balance
      await supabase
        .from('portfolios')
        .update({ 
          balance: newCashBalance,
          total_value: portfolio.total_value
        })
        .eq('id', portfolio.id)

      // Create or update holding
      const existingHolding = holdings.find(h => h.symbol === symbol)

      if (existingHolding) {
        const newShares = existingHolding.shares + shares
        const newAvgPrice = ((existingHolding.shares * existingHolding.avg_price) + total) / newShares

        await supabase
          .from('holdings')
          .update({
            shares: newShares,
            avg_price: newAvgPrice,
            current_price: price
          })
          .eq('id', existingHolding.id)
      } else {
        await supabase
          .from('holdings')
          .insert({
            portfolio_id: portfolio.id,
            symbol,
            company_name: companyName,
            shares,
            avg_price: price,
            current_price: price
          })
      }

      // Record transaction
      await supabase
        .from('transactions')
        .insert({
          portfolio_id: portfolio.id,
          symbol,
          company_name: companyName,
          type: 'buy',
          shares,
          price,
          total
        })

      toast.dismiss(loadingToast)
      toast.success(`Successfully bought ${shares} shares of ${symbol}`)
      
      // Refresh data
      await fetchPortfolioData()
    } catch (error) {
      console.error('Error buying stock:', error)
      toast.error('Failed to complete buy order')
      throw error
    }
  }

  const sellStock = async (symbol: string, shares: number, price: number) => {
    if (!portfolio) return

    const holding = holdings.find(h => h.symbol === symbol)
    if (!holding || holding.shares < shares) {
      toast.error('Insufficient shares')
      throw new Error('Insufficient shares')
    }

    const total = shares * price

    try {
      const loadingToast = toast.loading('Processing sell order...')

      // Update user's cash balance
      const newCashBalance = userBalances.cash_balance + total
      await supabase
        .from('users')
        .update({ cash_balance: newCashBalance })
        .eq('id', user!.id)

      // Update portfolio balance
      await supabase
        .from('portfolios')
        .update({ 
          balance: newCashBalance,
          total_value: portfolio.total_value
        })
        .eq('id', portfolio.id)

      // Update holding
      const newShares = holding.shares - shares
      
      if (newShares === 0) {
        await supabase
          .from('holdings')
          .delete()
          .eq('id', holding.id)
      } else {
        await supabase
          .from('holdings')
          .update({
            shares: newShares,
            current_price: price
          })
          .eq('id', holding.id)
      }

      // Record transaction
      await supabase
        .from('transactions')
        .insert({
          portfolio_id: portfolio.id,
          symbol,
          company_name: holding.company_name,
          type: 'sell',
          shares,
          price,
          total
        })

      toast.dismiss(loadingToast)
      toast.success(`Successfully sold ${shares} shares of ${symbol}`)

      // Refresh data
      await fetchPortfolioData()
    } catch (error) {
      console.error('Error selling stock:', error)
      toast.error('Failed to complete sell order')
      throw error
    }
  }

  // Calculate real-time portfolio metrics
  const totalHoldingsValue = holdings.reduce((sum, holding) => 
    sum + (holding.shares * holding.current_price), 0
  )
  
  const totalValue = userBalances.cash_balance + userBalances.savings_balance + totalHoldingsValue
  const totalGainLoss = totalValue - 10000 // Initial amount
  const totalGainLossPercent = ((totalGainLoss / 10000) * 100)

  return {
    portfolio: portfolio ? {
      ...portfolio,
      balance: userBalances.cash_balance,
      total_value: totalValue
    } : null,
    holdings: holdings.map(holding => ({
      ...holding,
      current_value: holding.shares * holding.current_price,
      gain_loss: holding.shares * (holding.current_price - holding.avg_price),
      gain_loss_percent: ((holding.current_price - holding.avg_price) / holding.avg_price) * 100
    })),
    transactions,
    loading,
    userBalances,
    totalValue,
    totalGainLoss,
    totalGainLossPercent,
    buyStock,
    sellStock,
    refreshData: fetchPortfolioData
  }
}