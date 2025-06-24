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

  useEffect(() => {
    if (user) {
      fetchPortfolioData()
    }
  }, [user])

  const fetchPortfolioData = async () => {
    try {
      setLoading(true)
      
      // Get or create portfolio
      let { data: portfolioData } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user!.id)
        .single()

      if (!portfolioData) {
        // Create initial portfolio with $10,000
        const { data: newPortfolio } = await supabase
          .from('portfolios')
          .insert({
            user_id: user!.id,
            balance: 10000,
            total_value: 10000
          })
          .select()
          .single()
        
        portfolioData = newPortfolio
        
        if (!portfolioData) {
          console.error("Portfolio fetch failed and creation failed")
          return
        }
      }

      setPortfolio(portfolioData)

      // Get holdings
      const { data: holdingsData } = await supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', portfolioData.id)

      setHoldings(holdingsData || [])

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

    if (portfolio.balance < total) {
      toast.error('Insufficient funds')
      throw new Error('Insufficient funds')
    }

    try {
      const loadingToast = toast.loading('Processing buy order...')

      // Update portfolio balance
      await supabase
        .from('portfolios')
        .update({ 
          balance: portfolio.balance - total,
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

      // Update portfolio balance
      await supabase
        .from('portfolios')
        .update({ 
          balance: portfolio.balance + total,
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

  return {
    portfolio,
    holdings,
    transactions,
    loading,
    buyStock,
    sellStock,
    refreshData: fetchPortfolioData
  }
}