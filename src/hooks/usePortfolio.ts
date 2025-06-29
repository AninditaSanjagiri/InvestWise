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
      // Set up real-time updates every 30 seconds
      const interval = setInterval(() => {
        updateRealTimePrices()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchPortfolioData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Get user balances first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('cash_balance, savings_balance')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('User error:', userError)
        // If user doesn't exist in users table, create them
        if (userError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              cash_balance: 10000,
              savings_balance: 0,
              onboarding_completed: false
            })
          
          if (insertError) {
            console.error('Error creating user:', insertError)
          }
          
          setUserBalances({ cash_balance: 10000, savings_balance: 0 })
        } else {
          throw userError
        }
      } else {
        const balances = userData || { cash_balance: 10000, savings_balance: 0 }
        setUserBalances(balances)
      }

      // Get or create portfolio
      let { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (portfolioError && portfolioError.code === 'PGRST116') {
        // Create initial portfolio
        const { data: newPortfolio, error: createError } = await supabase
          .from('portfolios')
          .insert({
            user_id: user.id,
            balance: userBalances.cash_balance || 10000,
            total_value: (userBalances.cash_balance || 10000) + (userBalances.savings_balance || 0)
          })
          .select()
          .single()
        
        if (createError) {
          console.error('Error creating portfolio:', createError)
          throw createError
        }
        portfolioData = newPortfolio
      } else if (portfolioError) {
        console.error('Portfolio error:', portfolioError)
        throw portfolioError
      }

      setPortfolio(portfolioData)

      // Get holdings with current prices from investment_options
      const { data: holdingsData, error: holdingsError } = await supabase
        .from('holdings')
        .select(`
          *,
          investment_options!inner(current_price, price_change, price_change_percent, name)
        `)
        .eq('portfolio_id', portfolioData.id)

      if (holdingsError) {
        console.error('Holdings error:', holdingsError)
        setHoldings([])
      } else {
        // Calculate real-time values for holdings with correct financial logic
        const updatedHoldings = holdingsData?.map(holding => {
          const currentPrice = holding.investment_options.current_price
          const avgPrice = holding.avg_price
          const shares = holding.shares
          
          // Correct financial calculations
          const currentValue = shares * currentPrice
          const totalInvested = shares * avgPrice
          const absolutePL = currentValue - totalInvested
          const percentPL = totalInvested > 0 ? (absolutePL / totalInvested) * 100 : 0

          return {
            ...holding,
            current_price: currentPrice,
            company_name: holding.investment_options.name,
            current_value: currentValue,
            gain_loss: absolutePL,
            gain_loss_percent: percentPL
          }
        }) || []

        setHoldings(updatedHoldings)
      }

      // Get recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('portfolio_id', portfolioData.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (transactionsError) {
        console.error('Transactions error:', transactionsError)
        setTransactions([])
      } else {
        setTransactions(transactionsData || [])
      }

    } catch (error) {
      console.error('Error fetching portfolio:', error)
      toast.error('Failed to load portfolio data')
    } finally {
      setLoading(false)
    }
  }

  const updateRealTimePrices = async () => {
    try {
      // Simulate real-time price updates for all active investments
      const { data: investments } = await supabase
        .from('investment_options')
        .select('*')
        .eq('is_active', true)

      if (investments) {
        const updates = investments.map(investment => {
          // Simulate realistic price movement (-2% to +2%)
          const changePercent = (Math.random() - 0.5) * 0.04
          const newPrice = investment.current_price * (1 + changePercent)
          const priceChange = newPrice - investment.current_price
          const priceChangePercent = (priceChange / investment.current_price) * 100

          return {
            id: investment.id,
            current_price: Math.max(newPrice, 0.01), // Ensure price doesn't go negative
            price_change: priceChange,
            price_change_percent: priceChangePercent,
            updated_at: new Date().toISOString()
          }
        })

        // Update prices in database
        for (const update of updates) {
          await supabase
            .from('investment_options')
            .update({
              current_price: update.current_price,
              price_change: update.price_change,
              price_change_percent: update.price_change_percent,
              updated_at: update.updated_at
            })
            .eq('id', update.id)
        }

        // Refresh holdings data with new prices (but don't show loading)
        const currentLoading = loading
        
        // Get updated holdings
        if (portfolio) {
          const { data: holdingsData } = await supabase
            .from('holdings')
            .select(`
              *,
              investment_options!inner(current_price, price_change, price_change_percent, name)
            `)
            .eq('portfolio_id', portfolio.id)

          if (holdingsData) {
            const updatedHoldings = holdingsData.map(holding => {
              const currentPrice = holding.investment_options.current_price
              const avgPrice = holding.avg_price
              const shares = holding.shares
              
              // Correct financial calculations
              const currentValue = shares * currentPrice
              const totalInvested = shares * avgPrice
              const absolutePL = currentValue - totalInvested
              const percentPL = totalInvested > 0 ? (absolutePL / totalInvested) * 100 : 0

              return {
                ...holding,
                current_price: currentPrice,
                company_name: holding.investment_options.name,
                current_value: currentValue,
                gain_loss: absolutePL,
                gain_loss_percent: percentPL
              }
            })

            setHoldings(updatedHoldings)
          }
        }
        
        setLoading(currentLoading) // Restore original loading state
      }
    } catch (error) {
      console.error('Error updating real-time prices:', error)
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
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ cash_balance: newCashBalance })
        .eq('id', user.id)

      if (userUpdateError) throw userUpdateError

      // Update portfolio balance
      const { error: portfolioUpdateError } = await supabase
        .from('portfolios')
        .update({ 
          balance: newCashBalance
        })
        .eq('id', portfolio.id)

      if (portfolioUpdateError) throw portfolioUpdateError

      // Get investment option to link properly
      const { data: investmentOption } = await supabase
        .from('investment_options')
        .select('id, name')
        .eq('symbol', symbol)
        .single()

      // Create or update holding with correct weighted average calculation
      const existingHolding = holdings.find(h => h.symbol === symbol)

      if (existingHolding) {
        // Calculate new weighted average price
        const oldQuantity = existingHolding.shares
        const oldAvgPrice = existingHolding.avg_price
        const newQuantity = oldQuantity + shares
        const newAvgPrice = ((oldQuantity * oldAvgPrice) + (shares * price)) / newQuantity

        const { error: holdingUpdateError } = await supabase
          .from('holdings')
          .update({
            shares: newQuantity,
            avg_price: newAvgPrice,
            current_price: price,
            investment_option_id: investmentOption?.id
          })
          .eq('id', existingHolding.id)

        if (holdingUpdateError) throw holdingUpdateError
      } else {
        // Create new holding
        const { error: holdingInsertError } = await supabase
          .from('holdings')
          .insert({
            portfolio_id: portfolio.id,
            symbol,
            company_name: investmentOption?.name || companyName,
            shares,
            avg_price: price,
            current_price: price,
            investment_option_id: investmentOption?.id
          })

        if (holdingInsertError) throw holdingInsertError
      }

      // Record transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          portfolio_id: portfolio.id,
          symbol,
          company_name: investmentOption?.name || companyName,
          type: 'buy',
          shares,
          price,
          total
        })

      if (transactionError) throw transactionError

      toast.dismiss(loadingToast)
      toast.success(`Successfully bought ${shares} shares of ${symbol} at $${price.toFixed(2)}`)
      
      // Update local state immediately
      setUserBalances(prev => ({ ...prev, cash_balance: newCashBalance }))
      
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
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ cash_balance: newCashBalance })
        .eq('id', user.id)

      if (userUpdateError) throw userUpdateError

      // Update portfolio balance
      const { error: portfolioUpdateError } = await supabase
        .from('portfolios')
        .update({ 
          balance: newCashBalance
        })
        .eq('id', portfolio.id)

      if (portfolioUpdateError) throw portfolioUpdateError

      // Update holding - DO NOT modify avg_price on sell
      const newShares = holding.shares - shares
      
      if (newShares === 0) {
        // Delete holding if all shares sold
        const { error: holdingDeleteError } = await supabase
          .from('holdings')
          .delete()
          .eq('id', holding.id)

        if (holdingDeleteError) throw holdingDeleteError
      } else {
        // Update quantity only, keep avg_price unchanged
        const { error: holdingUpdateError } = await supabase
          .from('holdings')
          .update({
            shares: newShares,
            current_price: price
          })
          .eq('id', holding.id)

        if (holdingUpdateError) throw holdingUpdateError
      }

      // Record transaction
      const { error: transactionError } = await supabase
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

      if (transactionError) throw transactionError

      toast.dismiss(loadingToast)
      toast.success(`Successfully sold ${shares} shares of ${symbol} at $${price.toFixed(2)}`)

      // Update local state immediately
      setUserBalances(prev => ({ ...prev, cash_balance: newCashBalance }))

      // Refresh data
      await fetchPortfolioData()
    } catch (error) {
      console.error('Error selling stock:', error)
      toast.error('Failed to complete sell order')
      throw error
    }
  }

  // Calculate real-time portfolio metrics with correct financial logic
  const totalHoldingsValue = holdings.reduce((sum, holding) => 
    sum + holding.current_value, 0
  )
  
  const totalInvestedInHoldings = holdings.reduce((sum, holding) => 
    sum + (holding.shares * holding.avg_price), 0
  )
  
  const totalValue = userBalances.cash_balance + userBalances.savings_balance + totalHoldingsValue
  
  // Calculate total gain/loss correctly
  const initialAmount = 10000
  const totalGainLoss = totalValue - initialAmount
  const totalGainLossPercent = ((totalGainLoss / initialAmount) * 100)

  return {
    portfolio: portfolio ? {
      ...portfolio,
      balance: userBalances.cash_balance,
      total_value: totalValue
    } : null,
    holdings: holdings.map(holding => ({
      ...holding,
      current_value: holding.current_value,
      gain_loss: holding.gain_loss,
      gain_loss_percent: holding.gain_loss_percent
    })),
    transactions,
    loading,
    userBalances,
    totalValue,
    totalGainLoss,
    totalGainLossPercent,
    totalInvestedInHoldings,
    buyStock,
    sellStock,
    refreshData: fetchPortfolioData,
    updateRealTimePrices
  }
}