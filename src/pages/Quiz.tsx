import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GamepadIcon, 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle,
  Play,
  RotateCcw,
  Star,
  Target,
  Zap
} from 'lucide-react'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Quiz {
  id: string
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  questions: QuizQuestion[]
  timeLimit: number
  category: string
}

interface Game {
  id: string
  title: string
  description: string
  type: 'memory' | 'matching' | 'simulation'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  icon: React.ComponentType<any>
}

const QuizAndGames: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'games'>('quiz')
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  // Mock quiz data
  const quizzes: Quiz[] = [
    {
      id: '1',
      title: 'Stock Market Basics',
      description: 'Test your knowledge of fundamental stock market concepts',
      difficulty: 'Beginner',
      category: 'Fundamentals',
      timeLimit: 300, // 5 minutes
      questions: [
        {
          id: '1',
          question: 'What does P/E ratio stand for?',
          options: ['Price to Earnings', 'Profit to Equity', 'Price to Equity', 'Profit to Earnings'],
          correctAnswer: 0,
          explanation: 'P/E ratio stands for Price-to-Earnings ratio, which compares a company\'s current share price to its per-share earnings.'
        },
        {
          id: '2',
          question: 'What is a dividend?',
          options: ['A loan to a company', 'A payment to shareholders', 'A type of stock', 'A market index'],
          correctAnswer: 1,
          explanation: 'A dividend is a payment made by corporations to their shareholders, usually as a distribution of profits.'
        },
        {
          id: '3',
          question: 'What does "bull market" mean?',
          options: ['Falling prices', 'Rising prices', 'Stable prices', 'Volatile prices'],
          correctAnswer: 1,
          explanation: 'A bull market refers to a period of rising stock prices and investor optimism.'
        }
      ]
    },
    {
      id: '2',
      title: 'Investment Strategies',
      description: 'Learn about different approaches to investing',
      difficulty: 'Intermediate',
      category: 'Strategy',
      timeLimit: 600, // 10 minutes
      questions: [
        {
          id: '1',
          question: 'What is dollar-cost averaging?',
          options: ['Buying stocks at the lowest price', 'Investing a fixed amount regularly', 'Selling stocks for profit', 'Calculating average stock prices'],
          correctAnswer: 1,
          explanation: 'Dollar-cost averaging is an investment strategy where you invest a fixed amount regularly, regardless of market conditions.'
        },
        {
          id: '2',
          question: 'What is the main benefit of diversification?',
          options: ['Higher returns', 'Lower fees', 'Risk reduction', 'Tax benefits'],
          correctAnswer: 2,
          explanation: 'Diversification helps reduce risk by spreading investments across different assets, sectors, or markets.'
        }
      ]
    }
  ]

  // Mock games data
  const games: Game[] = [
    {
      id: '1',
      title: 'Stock Symbol Memory',
      description: 'Match company names with their stock symbols',
      type: 'memory',
      difficulty: 'Easy',
      icon: Target
    },
    {
      id: '2',
      title: 'Portfolio Builder',
      description: 'Build a balanced portfolio within budget constraints',
      type: 'simulation',
      difficulty: 'Medium',
      icon: Trophy
    },
    {
      id: '3',
      title: 'Market Trend Predictor',
      description: 'Predict market movements based on news and data',
      type: 'simulation',
      difficulty: 'Hard',
      icon: Zap
    }
  ]

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setShowResult(false)
    setQuizCompleted(false)
    setTimeLeft(quiz.timeLimit)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === selectedQuiz!.questions[currentQuestion].correctAnswer
    if (isCorrect) {
      setScore(score + 1)
    }

    setShowResult(true)
    
    setTimeout(() => {
      if (currentQuestion < selectedQuiz!.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setShowResult(false)
      } else {
        setQuizCompleted(true)
      }
    }, 2000)
  }

  const resetQuiz = () => {
    setSelectedQuiz(null)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setShowResult(false)
    setQuizCompleted(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
      case 'Easy':
        return 'bg-green-100 text-green-800'
      case 'Intermediate':
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Advanced':
      case 'Hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (selectedQuiz && !quizCompleted) {
    const currentQ = selectedQuiz.questions[currentQuestion]
    const progress = ((currentQuestion + 1) / selectedQuiz.questions.length) * 100

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Quiz Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedQuiz.title}</h1>
              <p className="text-gray-600">Question {currentQuestion + 1} of {selectedQuiz.questions.length}</p>
            </div>
            <button
              onClick={resetQuiz}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Exit Quiz
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            />
          </div>
        </motion.div>

        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-md p-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{currentQ.question}</h2>
          
          <div className="space-y-4">
            {currentQ.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === index
                    ? showResult
                      ? index === currentQ.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-blue-500 bg-blue-50'
                    : showResult && index === currentQ.correctAnswer
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showResult && (
                    <div>
                      {index === currentQ.correctAnswer ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : selectedAnswer === index ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gray-50 rounded-lg"
            >
              <p className="text-sm text-gray-700">{currentQ.explanation}</p>
            </motion.div>
          )}

          {!showResult && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentQuestion === selectedQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </motion.button>
          )}
        </motion.div>
      </div>
    )
  }

  if (quizCompleted && selectedQuiz) {
    const percentage = Math.round((score / selectedQuiz.questions.length) * 100)
    
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-md p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
          <p className="text-gray-600 mb-6">Great job on completing "{selectedQuiz.title}"</p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">{percentage}%</div>
            <p className="text-gray-600">You scored {score} out of {selectedQuiz.questions.length} questions correctly</p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => startQuiz(selectedQuiz)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetQuiz}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Back to Quizzes
            </motion.button>
          </div>
        </motion.div>
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
          <h1 className="text-3xl font-bold text-gray-900">Quiz & Games</h1>
          <p className="text-gray-600">Test your knowledge and have fun while learning</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
        >
          <GamepadIcon className="h-6 w-6 text-white" />
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md p-2">
        <div className="flex space-x-2">
          {[
            { key: 'quiz', label: 'Quizzes', icon: Trophy },
            { key: 'games', label: 'Games', icon: GamepadIcon }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.key as 'quiz' | 'games')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </motion.button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'quiz' ? (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {quizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-600">{quiz.category}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                <p className="text-gray-600 mb-4">{quiz.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{Math.floor(quiz.timeLimit / 60)} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Trophy className="h-4 w-4" />
                      <span>{quiz.questions.length} questions</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startQuiz(quiz)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Quiz
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="games"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {games.map((game, index) => {
              const Icon = game.icon
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                      <Icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(game.difficulty)}`}>
                      {game.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{game.title}</h3>
                  <p className="text-gray-600 mb-4">{game.description}</p>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Play Game
                  </motion.button>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coming Soon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-8 text-center"
      >
        <Star className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">More Content Coming Soon!</h3>
        <p className="text-gray-600 mb-4">
          We're developing more interactive quizzes and games to make learning investing fun and engaging.
        </p>
        <div className="flex justify-center space-x-6 text-sm text-gray-500">
          <span>• Multiplayer Challenges</span>
          <span>• Leaderboards</span>
          <span>• Achievement Badges</span>
        </div>
      </motion.div>
    </div>
  )
}

export default QuizAndGames