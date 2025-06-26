import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Shield, TrendingUp, Zap } from 'lucide-react'

interface RiskAlignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onProceed: () => void
  userRiskProfile: 'conservative' | 'moderate' | 'aggressive'
  investmentRisk: 'Conservative' | 'Moderate' | 'Aggressive'
  investmentName: string
}

const RiskAlignmentModal: React.FC<RiskAlignmentModalProps> = ({
  isOpen,
  onClose,
  onProceed,
  userRiskProfile,
  investmentRisk,
  investmentName
}) => {
  const getRiskIcon = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'conservative': return Shield
      case 'moderate': return TrendingUp
      case 'aggressive': return Zap
      default: return AlertTriangle
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'conservative': return 'text-green-600'
      case 'moderate': return 'text-blue-600'
      case 'aggressive': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getRiskDescription = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'conservative':
        return 'Low risk investments with stable, predictable returns. Suitable for capital preservation.'
      case 'moderate':
        return 'Balanced risk investments offering moderate growth potential with manageable volatility.'
      case 'aggressive':
        return 'High risk investments with potential for significant returns but substantial volatility.'
      default:
        return 'Risk level not specified.'
    }
  }

  const UserRiskIcon = getRiskIcon(userRiskProfile)
  const InvestmentRiskIcon = getRiskIcon(investmentRisk)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Risk Alignment Notice</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Investment Risk Mismatch Detected!</strong>
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  The investment you're considering may not align with your risk profile. 
                  Please review the details below before proceeding.
                </p>
              </div>

              {/* Investment Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Investment: {investmentName}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <InvestmentRiskIcon className={`h-5 w-5 ${getRiskColor(investmentRisk)}`} />
                  <span className="font-medium text-gray-900">Risk Level: {investmentRisk}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {getRiskDescription(investmentRisk)}
                </p>
              </div>

              {/* User Profile */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Your Risk Profile</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <UserRiskIcon className={`h-5 w-5 ${getRiskColor(userRiskProfile)}`} />
                  <span className="font-medium text-gray-900">
                    {userRiskProfile.charAt(0).toUpperCase() + userRiskProfile.slice(1)} Investor
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {getRiskDescription(userRiskProfile)}
                </p>
              </div>

              {/* Educational Note */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <h4 className="font-medium text-blue-900 mb-2">💡 Educational Note</h4>
                <p className="text-sm text-blue-800">
                  Investing outside your risk profile can lead to emotional stress and poor decision-making. 
                  Consider whether this investment aligns with your financial goals and comfort level.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel & Review
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onProceed}
                  className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                >
                  Proceed Anyway
                </motion.button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                This is an educational warning. You can still proceed with your investment decision.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default RiskAlignmentModal