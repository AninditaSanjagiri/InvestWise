import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, 
  Plus, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Edit3, 
  Trash2,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useGoals } from '../hooks/useGoals'
import { Goal } from '../types/onboarding'
import LoadingSpinner from '../components/LoadingSpinner'
import SkeletonLoader from '../components/SkeletonLoader'

const Goals: React.FC = () => {
  const { goals, loading, createGoal, updateGoal, deleteGoal } = useGoals()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState({
    goal_description: '',
    target_amount: '',
    target_date: '',
    target_return_percentage: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const goalData = {
      goal_description: formData.goal_description,
      target_amount: parseFloat(formData.target_amount),
      target_date: formData.target_date,
      target_return_percentage: parseFloat(formData.target_return_percentage)
    }

    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id!, goalData)
        setEditingGoal(null)
      } else {
        await createGoal(goalData)
        setShowCreateForm(false)
      }
      
      setFormData({
        goal_description: '',
        target_amount: '',
        target_date: '',
        target_return_percentage: ''
      })
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      goal_description: goal.goal_description,
      target_amount: goal.target_amount.toString(),
      target_date: goal.target_date,
      target_return_percentage: goal.target_return_percentage.toString()
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(goalId)
    }
  }

  const calculateProgress = (goal: Goal) => {
    // This would be calculated based on current portfolio value vs target
    // For now, we'll use a mock calculation
    const timeElapsed = (new Date().getTime() - new Date(goal.created_at!).getTime()) / (1000 * 60 * 60 * 24 * 365)
    const totalTime = (new Date(goal.target_date).getTime() - new Date(goal.created_at!).getTime()) / (1000 * 60 * 60 * 24 * 365)
    return Math.min((timeElapsed / totalTime) * 100, 100)
  }

  const getTimeRemaining = (targetDate: string) => {
    const now = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day'
    if (diffDays < 30) return `${diffDays} days`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months`
    return `${Math.ceil(diffDays / 365)} years`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="lg" text="Loading your goals..." />
        </div>
        <SkeletonLoader type="card" count={3} />
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
          <h1 className="text-3xl font-bold text-gray-900">Financial Goals</h1>
          <p className="text-gray-600">Track and manage your investment objectives</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Add Goal</span>
        </motion.button>
      </motion.div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Description
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.goal_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, goal_description: e.target.value }))}
                    placeholder="e.g., Retirement fund, House down payment"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Amount ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={formData.target_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_amount: e.target.value }))}
                    placeholder="50000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.target_date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Return (%)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="50"
                    step="0.1"
                    value={formData.target_return_percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_return_percentage: e.target.value }))}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingGoal(null)
                    setFormData({
                      goal_description: '',
                      target_amount: '',
                      target_date: '',
                      target_return_percentage: ''
                    })
                  }}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals List */}
      {goals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white rounded-lg shadow-md"
        >
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
          <p className="text-gray-600 mb-4">Set your first financial goal to start tracking your progress</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Goal
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, index) => {
            const progress = calculateProgress(goal)
            const timeRemaining = getTimeRemaining(goal.target_date)
            const isOverdue = new Date(goal.target_date) < new Date()
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {goal.goal_description}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id!)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">Target</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ${goal.target_amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Due</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      isOverdue ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {timeRemaining}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-600">Return</span>
                    </div>
                    <span className="font-semibold text-purple-600">
                      {goal.target_return_percentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium text-gray-900">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ delay: index * 0.1, duration: 0.8 }}
                        className={`h-2 rounded-full ${
                          progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                      />
                    </div>
                  </div>

                  {progress >= 100 && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Goal Achieved!</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Goals