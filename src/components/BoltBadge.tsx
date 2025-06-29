import React from 'react'
import { motion } from 'framer-motion'

const BoltBadge: React.FC = () => {
  return (
    <motion.a
      href="https://bolt.new/"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 group"
      title="Powered by Bolt.new"
    >
      <div className="relative">
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 20px rgba(0, 0, 0, 0.1)',
              '0 0 30px rgba(0, 0, 0, 0.2)',
              '0 0 20px rgba(0, 0, 0, 0.1)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300"
        >
          <img
            src="/black_circle_360x360.png"
            alt="Powered by Bolt.new"
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Powered by Bolt.new
          </div>
        </div>
      </div>
    </motion.a>
  )
}

export default BoltBadge