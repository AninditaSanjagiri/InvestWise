import React, { useState } from 'react'
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  BookOpen, 
  DollarSign,
  Award,
  Lock,
  CheckCircle
} from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  category: 'trading' | 'learning' | 'portfolio' | 'milestone'
  progress: number
  maxProgress: number
  unlocked: boolean
  unlockedAt?: string
  reward?: string
}

const Achievements: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'trading' | 'learning' | 'portfolio' | 'milestone'>('all')

  // Mock achievements data
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Trade',
      description: 'Complete your first stock purchase',
      icon: TrendingUp,
      category: 'trading',
      progress: 0,
      maxProgress: 1,
      unlocked: false
    },
    {
      id: '2',
      title: 'Portfolio Builder',
      description: 'Own 5 different stocks simultaneously',
      icon: Target,
      category: 'portfolio',
      progress: 0,
      maxProgress: 5,
      unlocked: false
    },
    {
      id: '3',
      title: 'Knowledge Seeker',
      description: 'Look up 10 investment terms using AI explainer',
      icon: BookOpen,
      category: 'learning',
      progress: 0,
      maxProgress: 10,
      unlocked: false
    },
    {
      id: '4',
      title: 'Day Trader',
      description: 'Complete 25 trades in total',
      icon: TrendingUp,
      category: 'trading',
      progress: 0,
      maxProgress: 25,
      unlocked: false
    },
    {
      id: '5',
      title: 'Profit Maker',
      description: 'Achieve $1,000 in total gains',
      icon: DollarSign,
      category: 'milestone',
      progress: 0,
      maxProgress: 1000,
      unlocked: false
    },
    {
      id: '6',
      title: 'Diversified Investor',
      description: 'Own stocks from 3 different sectors',
      icon: Award,
      category: 'portfolio',
      progress: 0,
      maxProgress: 3,
      unlocked: false
    },
    {
      id: '7',
      title: 'Learning Champion',
      description: 'Browse through all glossary categories',
      icon: Star,
      category: 'learning',
      progress: 0,
      maxProgress: 8,
      unlocked: false
    },
    {
      id: '8',
      title: 'High Roller',
      description: 'Make a single trade worth $5,000 or more',
      icon: Trophy,
      category: 'trading',
      progress: 0,
      maxProgress: 5000,
      unlocked: false
    }
  ]

  const categories = [
    { key: 'all', label: 'All Achievements', icon: Trophy },
    { key: 'trading', label: 'Trading', icon: TrendingUp },
    { key: 'learning', label: 'Learning', icon: BookOpen },
    { key: 'portfolio', label: 'Portfolio', icon: Target },
    { key: 'milestone', label: 'Milestones', icon: Award }
  ]

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.category === selectedCategory)

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
          <p className="text-gray-600">Track your progress and unlock rewards as you learn and trade</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Progress</p>
          <p className="text-2xl font-bold text-blue-600">
            {unlockedCount}/{totalCount}
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Overall Progress</h2>
          <span className="text-sm font-medium text-blue-600">
            {Math.round((unlockedCount / totalCount) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>{unlockedCount} unlocked</span>
          <span>{totalCount - unlockedCount} remaining</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = selectedCategory === category.key
            
            return (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key as any)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {category.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => {
          const Icon = achievement.icon
          const progressPercent = (achievement.progress / achievement.maxProgress) * 100
          
          return (
            <div
              key={achievement.id}
              className={`bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg ${
                achievement.unlocked ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-full ${
                  achievement.unlocked 
                    ? 'bg-yellow-100' 
                    : 'bg-gray-100'
                }`}>
                  {achievement.unlocked ? (
                    <CheckCircle className="h-6 w-6 text-yellow-600" />
                  ) : (
                    <Icon className={`h-6 w-6 ${
                      achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'
                    }`} />
                  )}
                </div>
                {!achievement.unlocked && (
                  <Lock className="h-4 w-4 text-gray-400" />
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className={`text-lg font-semibold ${
                    achievement.unlocked ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-500">{achievement.description}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className={`font-medium ${
                      achievement.unlocked ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {achievement.progress}/{achievement.maxProgress}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        achievement.unlocked ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    achievement.category === 'trading' ? 'bg-green-100 text-green-800' :
                    achievement.category === 'learning' ? 'bg-blue-100 text-blue-800' :
                    achievement.category === 'portfolio' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {achievement.category}
                  </span>
                  
                  {achievement.unlocked && achievement.unlockedAt && (
                    <span className="text-xs text-gray-500">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {achievement.reward && achievement.unlocked && (
                  <div className="bg-yellow-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-yellow-800">Reward:</p>
                    <p className="text-sm text-yellow-700">{achievement.reward}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No achievements found in this category</p>
        </div>
      )}

      {/* Coming Soon Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 text-center">
        <Star className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">More Achievements Coming Soon!</h3>
        <p className="text-gray-600 mb-4">
          We're working on adding more exciting achievements and rewards to make your learning journey even more engaging.
        </p>
        <div className="flex justify-center space-x-4 text-sm text-gray-500">
          <span>• Weekly Challenges</span>
          <span>• Learning Streaks</span>
          <span>• Social Features</span>
        </div>
      </div>
    </div>
  )
}

export default Achievements