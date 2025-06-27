import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calculator, 
  TrendingUp, 
  Target, 
  DollarSign,
  Info,
  PieChart,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface CalculatorResult {
  maturityAmount: number
  totalInvested: number
  totalGains: number
}

interface GoalResult {
  requiredSIP: number
  requiredLumpSum: number
}

const Calculators: React.FC = () => {
  const [activeCalculator, setActiveCalculator] = useState<'sip' | 'lumpsum' | 'goal' | 'compound'>('sip')
  const [expandedExplanation, setExpandedExplanation] = useState<string | null>(null)

  // SIP Calculator State
  const [sipData, setSipData] = useState({
    monthlyAmount: '',
    annualReturn: '',
    tenure: ''
  })

  // Lump Sum Calculator State
  const [lumpSumData, setLumpSumData] = useState({
    initialAmount: '',
    annualReturn: '',
    tenure: ''
  })

  // Goal Calculator State
  const [goalData, setGoalData] = useState({
    targetAmount: '',
    timeHorizon: '',
    annualReturn: ''
  })

  // Compound Calculator State
  const [compoundData, setCompoundData] = useState({
    principal: '',
    annualRate: '',
    compoundingFrequency: '12',
    tenure: ''
  })

  const calculateSIP = (): CalculatorResult => {
    const P = parseFloat(sipData.monthlyAmount) || 0
    const r = (parseFloat(sipData.annualReturn) || 0) / 100 / 12
    const n = (parseFloat(sipData.tenure) || 0) * 12

    if (P === 0 || r === 0 || n === 0) {
      return { maturityAmount: 0, totalInvested: 0, totalGains: 0 }
    }

    const maturityAmount = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r))
    const totalInvested = P * n
    const totalGains = maturityAmount - totalInvested

    return { maturityAmount, totalInvested, totalGains }
  }

  const calculateLumpSum = (): CalculatorResult => {
    const P = parseFloat(lumpSumData.initialAmount) || 0
    const r = (parseFloat(lumpSumData.annualReturn) || 0) / 100
    const t = parseFloat(lumpSumData.tenure) || 0

    if (P === 0 || r === 0 || t === 0) {
      return { maturityAmount: 0, totalInvested: 0, totalGains: 0 }
    }

    const maturityAmount = P * Math.pow(1 + r, t)
    const totalInvested = P
    const totalGains = maturityAmount - totalInvested

    return { maturityAmount, totalInvested, totalGains }
  }

  const calculateGoalBased = (): GoalResult => {
    const target = parseFloat(goalData.targetAmount) || 0
    const years = parseFloat(goalData.timeHorizon) || 0
    const rate = (parseFloat(goalData.annualReturn) || 0) / 100

    if (target === 0 || years === 0 || rate === 0) {
      return { requiredSIP: 0, requiredLumpSum: 0 }
    }

    // Required SIP calculation
    const monthlyRate = rate / 12
    const months = years * 12
    const requiredSIP = target * monthlyRate / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate))

    // Required Lump Sum calculation
    const requiredLumpSum = target / Math.pow(1 + rate, years)

    return { requiredSIP, requiredLumpSum }
  }

  const calculateCompound = (): CalculatorResult => {
    const P = parseFloat(compoundData.principal) || 0
    const r = (parseFloat(compoundData.annualRate) || 0) / 100
    const n = parseFloat(compoundData.compoundingFrequency) || 1
    const t = parseFloat(compoundData.tenure) || 0

    if (P === 0 || r === 0 || t === 0) {
      return { maturityAmount: 0, totalInvested: 0, totalGains: 0 }
    }

    const maturityAmount = P * Math.pow(1 + r / n, n * t)
    const totalInvested = P
    const totalGains = maturityAmount - totalInvested

    return { maturityAmount, totalInvested, totalGains }
  }

  const calculators = [
    { key: 'sip', label: 'SIP Calculator', icon: TrendingUp },
    { key: 'lumpsum', label: 'Lump Sum', icon: DollarSign },
    { key: 'goal', label: 'Goal Based', icon: Target },
    { key: 'compound', label: 'Compound Interest', icon: PieChart }
  ]

  const explanations = {
    sip: {
      title: "What is SIP?",
      content: "SIP (Systematic Investment Plan) is a method of investing a fixed amount regularly in mutual funds. It's like a recurring deposit but for investments.",
      howItWorks: "You invest a fixed amount every month, and over time, this grows due to compound interest. The power of SIP lies in rupee cost averaging - you buy more units when prices are low and fewer when prices are high.",
      terms: {
        "Maturity Amount": "The total value of your investment at the end of the investment period",
        "Total Invested": "The sum of all monthly investments you made over the tenure"
      }
    },
    lumpsum: {
      title: "What is Lump Sum Investment?",
      content: "Lump sum investment means investing a large amount of money at once, rather than spreading it over time.",
      howItWorks: "You invest a single large amount and let it grow over time through compound interest. This works best when you have a significant amount to invest and believe the market will grow over your investment period.",
      terms: {
        "Maturity Amount": "The total value of your investment after the specified time period",
        "Total Profit": "The difference between maturity amount and your initial investment"
      }
    },
    goal: {
      title: "What is Goal-Based Investment?",
      content: "Goal-based investing is a strategy where you invest with specific financial goals in mind, such as buying a house, funding education, or retirement.",
      howItWorks: "You define your target amount and timeline, then calculate how much you need to invest (either monthly via SIP or as a lump sum) to reach that goal.",
      terms: {
        "Required SIP": "The monthly amount you need to invest to reach your goal",
        "Required Lump Sum": "The one-time amount you need to invest today to reach your goal"
      }
    },
    compound: {
      title: "What is Compound Interest?",
      content: "Compound interest is interest calculated on the initial principal and accumulated interest from previous periods. Einstein called it the 'eighth wonder of the world.'",
      howItWorks: "Your money grows not just on the original amount, but also on the interest earned. The more frequently interest is compounded, the more your money grows.",
      terms: {
        "Future Value": "The total amount your investment will be worth in the future",
        "Total Interest": "The total interest earned over the investment period"
      }
    }
  }

  const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  )

  const ExplanationCard: React.FC<{ type: keyof typeof explanations }> = ({ type }) => {
    const explanation = explanations[type]
    const isExpanded = expandedExplanation === type

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100"
      >
        <button
          onClick={() => setExpandedExplanation(isExpanded ? null : type)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center space-x-3">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{explanation.title}</h3>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        <motion.div
          initial={false}
          animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="pt-4 space-y-4">
            <p className="text-gray-700">{explanation.content}</p>
            
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">How it works:</h4>
              <p className="text-gray-700 text-sm">{explanation.howItWorks}</p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Key Terms:</h4>
              <div className="space-y-2">
                {Object.entries(explanation.terms).map(([term, definition]) => (
                  <div key={term} className="flex flex-col sm:flex-row sm:items-start space-y-1 sm:space-y-0 sm:space-x-3">
                    <span className="font-medium text-blue-700 text-sm min-w-fit">{term}:</span>
                    <span className="text-gray-600 text-sm">{definition}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investment Calculators</h1>
          <p className="text-gray-600">Plan your investments with our comprehensive calculators</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
        >
          <Calculator className="h-6 w-6 text-white" />
        </motion.div>
      </motion.div>

      {/* Calculator Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-2"
      >
        <div className="flex flex-wrap gap-2">
          {calculators.map((calc) => {
            const Icon = calc.icon
            return (
              <motion.button
                key={calc.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveCalculator(calc.key as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeCalculator === calc.key
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{calc.label}</span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calculator */}
        <div className="lg:col-span-2">
          {/* SIP Calculator */}
          {activeCalculator === 'sip' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">SIP Calculator</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-1">
                      <span>Monthly Investment (₹)</span>
                      <Tooltip text="Amount you plan to invest every month">
                        <Info className="h-3 w-3 text-gray-400" />
                      </Tooltip>
                    </div>
                  </label>
                  <input
                    type="number"
                    value={sipData.monthlyAmount}
                    onChange={(e) => setSipData(prev => ({ ...prev, monthlyAmount: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-1">
                      <span>Expected Annual Return (%)</span>
                      <Tooltip text="Expected yearly return rate from your investment">
                        <Info className="h-3 w-3 text-gray-400" />
                      </Tooltip>
                    </div>
                  </label>
                  <input
                    type="number"
                    value={sipData.annualReturn}
                    onChange={(e) => setSipData(prev => ({ ...prev, annualReturn: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-1">
                      <span>Investment Tenure (Years)</span>
                      <Tooltip text="How long you plan to continue investing">
                        <Info className="h-3 w-3 text-gray-400" />
                      </Tooltip>
                    </div>
                  </label>
                  <input
                    type="number"
                    value={sipData.tenure}
                    onChange={(e) => setSipData(prev => ({ ...prev, tenure: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="10"
                  />
                </div>
              </div>

              {sipData.monthlyAmount && sipData.annualReturn && sipData.tenure && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">SIP Calculation Results</h3>
                  {(() => {
                    const result = calculateSIP()
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-600 mb-1">Total Invested</p>
                          <p className="text-2xl font-bold text-blue-600">
                            ₹{result.totalInvested.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-600 mb-1">Total Gains</p>
                          <p className="text-2xl font-bold text-green-600">
                            ₹{result.totalGains.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-600 mb-1">Maturity Amount</p>
                          <p className="text-2xl font-bold text-purple-600">
                            ₹{result.maturityAmount.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    )
                  })()}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Lump Sum Calculator */}
          {activeCalculator === 'lumpsum' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Lump Sum Calculator</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-1">
                      <span>Initial Investment (₹)</span>
                      <Tooltip text="One-time investment amount">
                        <Info className="h-3 w-3 text-gray-400" />
                      </Tooltip>
                    </div>
                  </label>
                  <input
                    type="number"
                    value={lumpSumData.initialAmount}
                    onChange={(e) => setLumpSumData(prev => ({ ...prev, initialAmount: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="100000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-1">
                      <span>Expected Annual Return (%)</span>
                      <Tooltip text="Expected yearly return rate">
                        <Info className="h-3 w-3 text-gray-400" />
                      </Tooltip>
                    </div>
                  </label>
                  <input
                    type="number"
                    value={lumpSumData.annualReturn}
                    onChange={(e) => setLumpSumData(prev => ({ ...prev, annualReturn: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-1">
                      <span>Investment Tenure (Years)</span>
                      <Tooltip text="Investment duration">
                        <Info className="h-3 w-3 text-gray-400" />
                      </Tooltip>
                    </div>
                  </label>
                  <input
                    type="number"
                    value={lumpSumData.tenure}
                    onChange={(e) => setLumpSumData(prev => ({ ...prev, tenure: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="10"
                  />
                </div>
              </div>

              {lumpSumData.initialAmount && lumpSumData.annualReturn && lumpSumData.tenure && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Lump Sum Results</h3>
                  {(() => {
                    const result = calculateLumpSum()
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-600 mb-1">Initial Investment</p>
                          <p className="text-2xl font-bold text-blue-600">
                            ₹{result.totalInvested.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-600 mb-1">Total Profit</p>
                          <p className="text-2xl font-bold text-green-600">
                            ₹{result.totalGains.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-600 mb-1">Maturity Amount</p>
                          <p className="text-2xl font-bold text-purple-600">
                            ₹{result.maturityAmount.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    )
                  })()}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Goal-Based Calculator */}
          {activeCalculator === 'goal' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Goal-Based Calculator</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-1">
                      <span>Target Amount (₹)</span>
                      <Tooltip text="Amount you want to achieve">
                        <Info className="h-3 w-3 text-gray-400" />
                      </Tooltip>
                    </div>
                  </label>
                  <input
                    type="number"
                    value={goalData.targetAmount}
                    onChange={(e) => setGoalData(prev => ({ ...prev, targetAmount: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="1000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-1">
                      <span>Time Horizon (Years)</span>
                      <Tooltip text="Time available to reach your goal">
                        <Info className="h-3 w-3 text-gray-400" />
                      </Tooltip>
                    </div>
                  </label>
                  <input
                    type="number"
                    value={goalData.timeHorizon}
                    onChange={(e) => setGoalData(prev => ({ ...prev, timeHorizon: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-1">
                      <span>Expected Return (%)</span>
                      <Tooltip text="Expected annual return rate">
                        <Info className="h-3 w-3 text-gray-400" />
                      </Tooltip>
                    </div>
                  </label>
                  <input
                    type="number"
                    value={goalData.annualReturn}
                    onChange={(e) => setGoalData(prev => ({ ...prev, annualReturn: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="12"
                  />
                </div>
              </div>

              {goalData.targetAmount && goalData.timeHorizon && goalData.annualReturn && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Planning Results</h3>
                  {(() => {
                    const result = calculateGoalBased()
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center bg-white rounded-lg p-6 shadow-sm">
                          <p className="text-sm text-gray-600 mb-2">Required Monthly SIP</p>
                          <p className="text-3xl font-bold text-blue-600">
                            ₹{result.requiredSIP.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">per month for {goalData.timeHorizon} years</p>
                        </div>
                        <div className="text-center bg-white rounded-lg p-6 shadow-sm">
                          <p className="text-sm text-gray-600 mb-2">Required Lump Sum</p>
                          <p className="text-3xl font-bold text-green-600">
                            ₹{result.requiredLumpSum.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">one-time investment</p>
                        </div>
                      </div>
                    )
                  })()}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Compound Interest Calculator */}
          {activeCalculator === 'compound' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Compound Interest Calculator</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-1">
                      <span>Principal Amount (₹)</span>
                      <Tooltip text="Initial investment amount">
                        <Info className="h-3 w-3 text-gray-400" />
                      </Tooltip>
                    </div>
                  </label>
                  <input
                    type="number"
                    value={compoundData.principal}
                    onChange={(e) => setCompoundData(prev => ({ ...prev, principal: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="100000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-1">
                      <span>Annual Interest Rate (%)</span>
                      <Tooltip text="Yearly interest rate">
                        <Info className="h-3 w-3 text-gray-400" />
                      </Tooltip>
                    </div>
                  </label>
                  <input
                    type="number"
                    value={compoundData.annualRate}
                    onChange={(e) => setCompoundData(prev => ({ ...prev, annualRate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-1">
                      <span>Compounding Frequency</span>
                      <Tooltip text="How often interest is compounded">
                        <Info className="h-3 w-3 text-gray-400" />
                      </Tooltip>
                    </div>
                  </label>
                  <select
                    value={compoundData.compoundingFrequency}
                    onChange={(e) => setCompoundData(prev => ({ ...prev, compoundingFrequency: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="1">Annually</option>
                    <option value="2">Semi-annually</option>
                    <option value="4">Quarterly</option>
                    <option value="12">Monthly</option>
                    <option value="365">Daily</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-1">
                      <span>Investment Tenure (Years)</span>
                      <Tooltip text="Investment duration">
                        <Info className="h-3 w-3 text-gray-400" />
                      </Tooltip>
                    </div>
                  </label>
                  <input
                    type="number"
                    value={compoundData.tenure}
                    onChange={(e) => setCompoundData(prev => ({ ...prev, tenure: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="10"
                  />
                </div>
              </div>

              {compoundData.principal && compoundData.annualRate && compoundData.tenure && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Compound Interest Results</h3>
                  {(() => {
                    const result = calculateCompound()
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-600 mb-1">Principal Amount</p>
                          <p className="text-2xl font-bold text-blue-600">
                            ₹{result.totalInvested.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-600 mb-1">Interest Earned</p>
                          <p className="text-2xl font-bold text-green-600">
                            ₹{result.totalGains.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-600 mb-1">Future Value</p>
                          <p className="text-2xl font-bold text-purple-600">
                            ₹{result.maturityAmount.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    )
                  })()}
                </motion.div>
              )}
            </motion.div>
          )}
        </div>

        {/* Explanation Panel */}
        <div className="lg:col-span-1">
          <ExplanationCard type={activeCalculator} />
        </div>
      </div>
    </div>
  )
}

export default Calculators