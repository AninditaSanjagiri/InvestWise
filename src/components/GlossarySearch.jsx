import React, { useState } from 'react'
import { Search, Lightbulb, BookOpen, Loader2, AlertCircle } from 'lucide-react'

const GlossarySearch = () => {
  const [term, setTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [definition, setDefinition] = useState('')
  const [analogy, setAnalogy] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!term.trim()) {
      setError('Please enter a term to search')
      return
    }

    setLoading(true)
    setError('')
    setDefinition('')
    setAnalogy('')
    setHasSearched(false)

    try {
      const response = await fetch('/api/explain-term', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ term: term.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch explanation')
      }

      setDefinition(data.definition)
      setAnalogy(data.analogy)
      setHasSearched(true)
    } catch (err) {
      console.error('Error fetching term explanation:', err)
      setError(err.message || 'Failed to get explanation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearResults = () => {
    setTerm('')
    setDefinition('')
    setAnalogy('')
    setError('')
    setHasSearched(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-purple-50 rounded-full mr-3">
          <Lightbulb className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">AI Term Explainer</h2>
          <p className="text-sm text-gray-600">Get instant explanations for any investment term</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Enter any investment term (e.g., 'compound interest', 'ETF', 'bull market')"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            disabled={loading}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !term.trim()}
          className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Explain'
          )}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3 text-purple-600">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg font-medium">Getting AI explanation...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {hasSearched && definition && analogy && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              "{term}"
            </h3>
            <button
              onClick={clearResults}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Definition */}
          <div className="bg-blue-50 rounded-lg p-5">
            <div className="flex items-start">
              <div className="p-2 bg-blue-100 rounded-full mr-4 flex-shrink-0">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Definition</h4>
                <p className="text-blue-800 leading-relaxed">{definition}</p>
              </div>
            </div>
          </div>

          {/* Analogy */}
          <div className="bg-green-50 rounded-lg p-5">
            <div className="flex items-start">
              <div className="p-2 bg-green-100 rounded-full mr-4 flex-shrink-0">
                <Lightbulb className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-900 mb-2">Real-World Analogy</h4>
                <p className="text-green-800 leading-relaxed">{analogy}</p>
              </div>
            </div>
          </div>

          {/* Helpful Note */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 text-center">
              💡 <strong>Tip:</strong> Try searching for terms like "diversification", "market cap", "yield", or any other investment concept you're curious about!
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasSearched && !loading && !error && (
        <div className="text-center py-8">
          <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Learn?</h3>
          <p className="text-gray-600 mb-4">
            Enter any investment term above and get an instant AI-powered explanation with real-world analogies.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Dividend', 'Bull Market', 'P/E Ratio', 'ETF', 'Volatility'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setTerm(suggestion)}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GlossarySearch