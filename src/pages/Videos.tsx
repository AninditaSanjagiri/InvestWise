import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Clock, 
  Eye, 
  ThumbsUp, 
  Search, 
  Filter,
  BookOpen,
  TrendingUp,
  DollarSign,
  PieChart,
  Star
} from 'lucide-react'

interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  views: string
  likes: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  youtubeId: string
  channel: string
}

const Videos: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')

  // Mock video data - in production, this would come from an API
  const videos: Video[] = [
    {
      id: '1',
      title: 'Stock Market Basics for Complete Beginners',
      description: 'Learn the fundamentals of stock market investing, including how stocks work, different types of investments, and basic terminology.',
      thumbnail: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '15:32',
      views: '2.1M',
      likes: '45K',
      category: 'Basics',
      difficulty: 'Beginner',
      youtubeId: 'dQw4w9WgXcQ',
      channel: 'InvestEd'
    },
    {
      id: '2',
      title: 'Understanding Compound Interest - The 8th Wonder',
      description: 'Discover how compound interest works and why Einstein called it the eighth wonder of the world. Learn to calculate and maximize its power.',
      thumbnail: 'https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '12:45',
      views: '1.8M',
      likes: '38K',
      category: 'Basics',
      difficulty: 'Beginner',
      youtubeId: 'dQw4w9WgXcQ',
      channel: 'Finance Guru'
    },
    {
      id: '3',
      title: 'Diversification: Don\'t Put All Eggs in One Basket',
      description: 'Learn about portfolio diversification, asset allocation, and risk management strategies to protect and grow your investments.',
      thumbnail: 'https://images.pexels.com/photos/6802049/pexels-photo-6802049.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '18:20',
      views: '950K',
      likes: '22K',
      category: 'Strategy',
      difficulty: 'Intermediate',
      youtubeId: 'dQw4w9WgXcQ',
      channel: 'Smart Investor'
    },
    {
      id: '4',
      title: 'Reading Financial Statements Like a Pro',
      description: 'Master the art of analyzing company financials. Learn to read balance sheets, income statements, and cash flow statements.',
      thumbnail: 'https://images.pexels.com/photos/6801642/pexels-photo-6801642.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '25:15',
      views: '720K',
      likes: '18K',
      category: 'Analysis',
      difficulty: 'Advanced',
      youtubeId: 'dQw4w9WgXcQ',
      channel: 'Financial Analysis Pro'
    },
    {
      id: '5',
      title: 'ETFs vs Mutual Funds: Which is Better?',
      description: 'Compare ETFs and mutual funds, understand their differences, fees, tax implications, and which might be better for your goals.',
      thumbnail: 'https://images.pexels.com/photos/6801647/pexels-photo-6801647.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '14:30',
      views: '1.2M',
      likes: '28K',
      category: 'Investment Types',
      difficulty: 'Intermediate',
      youtubeId: 'dQw4w9WgXcQ',
      channel: 'Investment Insights'
    },
    {
      id: '6',
      title: 'Dollar-Cost Averaging: Timing the Market vs Time in Market',
      description: 'Learn about dollar-cost averaging strategy, its benefits and drawbacks, and how it can help reduce investment risk.',
      thumbnail: 'https://images.pexels.com/photos/6801872/pexels-photo-6801872.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '16:45',
      views: '890K',
      likes: '21K',
      category: 'Strategy',
      difficulty: 'Beginner',
      youtubeId: 'dQw4w9WgXcQ',
      channel: 'Steady Investor'
    }
  ]

  const categories = ['All', 'Basics', 'Strategy', 'Analysis', 'Investment Types', 'Market News']
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'All' || video.difficulty === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Basics': return BookOpen
      case 'Strategy': return TrendingUp
      case 'Analysis': return PieChart
      case 'Investment Types': return DollarSign
      default: return Play
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Learning Videos</h1>
          <p className="text-gray-600">Curated educational content to boost your investment knowledge</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full"
        >
          <Play className="h-6 w-6 text-white" />
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Videos', value: videos.length, icon: Play, color: 'blue' },
          { label: 'Total Views', value: '8.7M', icon: Eye, color: 'green' },
          { label: 'Categories', value: categories.length - 1, icon: Filter, color: 'purple' },
          { label: 'Avg Rating', value: '4.8', icon: Star, color: 'yellow' }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 bg-${stat.color}-50 rounded-full`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video, index) => {
          const CategoryIcon = getCategoryIcon(video.category)
          
          return (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="relative group cursor-pointer">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    className="bg-white bg-opacity-90 rounded-full p-3"
                  >
                    <Play className="h-6 w-6 text-gray-900" />
                  </motion.div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <CategoryIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-600">{video.category}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(video.difficulty)}`}>
                    {video.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {video.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {video.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">{video.channel}</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{video.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{video.likes}</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-md font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Watch Now
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredVideos.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No videos found</p>
          <p className="text-gray-400">Try adjusting your search or filter criteria</p>
        </motion.div>
      )}

      {/* Coming Soon Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 text-center"
      >
        <Play className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">More Content Coming Soon!</h3>
        <p className="text-gray-600 mb-4">
          We're constantly adding new educational videos to help you master investing.
        </p>
        <div className="flex justify-center space-x-6 text-sm text-gray-500">
          <span>• Live Market Analysis</span>
          <span>• Expert Interviews</span>
          <span>• Case Studies</span>
        </div>
      </motion.div>
    </div>
  )
}

export default Videos