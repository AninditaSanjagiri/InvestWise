import { supabase } from '../lib/supabase';

// Insert new investment into 'portfolio' table
export const addInvestment = async (userId, assetName, amount, growthRate) => {
  const { data, error } = await supabase
    .from('portfolio')
    .insert([
      {
        user_id: userId,
        asset_name: assetName,
        amount_invested: amount,
        growth_rate: growthRate,
        date_invested: new Date(),
      },
    ]);
  return { data, error };
};

// Insert new transaction into 'transactions' table
export const addTransaction = async (userId, assetName, amount, action) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        user_id: userId,
        asset_name: assetName,
        amount: amount,
        action: action,
        date: new Date(),
      },
    ]);
  return { data, error };
};

// Fetch all investments for a user
export const getPortfolio = async (userId) => {
  const { data, error } = await supabase
    .from('portfolio')
    .select('*')
    .eq('user_id', userId);
  return { data, error };
};

// Fetch all transactions for a user
export const getTransactions = async (userId) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  return { data, error };
};
