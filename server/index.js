import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Explain term endpoint
app.post('/api/explain-term', async (req, res) => {
  try {
    // Validate input
    const { term } = req.body;
    
    if (!term || typeof term !== 'string' || term.trim().length === 0) {
      return res.status(400).json({
        error: 'Missing or invalid term. Please provide a valid term string.'
      });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured'
      });
    }

    // Create the prompt for OpenAI
    const prompt = `You are an investment education expert. Explain the investment term "${term.trim()}" in a way that's perfect for beginners.

Provide:
1. A simplified, concise definition (1-2 sentences max)
2. A short, clear real-world analogy that makes it easy to understand

Keep both responses brief and accessible to someone with no investment background.

Format your response as JSON with exactly this structure:
{
  "definition": "your definition here",
  "analogy": "your analogy here"
}`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful investment education assistant. Always respond with valid JSON in the exact format requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch (parseError) {
      // If JSON parsing fails, try to extract definition and analogy manually
      console.error('JSON parsing failed, attempting manual extraction:', parseError);
      throw new Error('Invalid response format from OpenAI');
    }

    // Validate the response structure
    if (!parsedResponse.definition || !parsedResponse.analogy) {
      throw new Error('Incomplete response from OpenAI');
    }

    // Return the structured response
    res.json({
      definition: parsedResponse.definition.trim(),
      analogy: parsedResponse.analogy.trim()
    });

  } catch (error) {
    console.error('Error in /api/explain-term:', error);

    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return res.status(500).json({
        error: 'OpenAI API quota exceeded. Please try again later.'
      });
    }

    if (error.code === 'invalid_api_key') {
      return res.status(500).json({
        error: 'Invalid OpenAI API key configuration'
      });
    }

    if (error.code === 'rate_limit_exceeded') {
      return res.status(500).json({
        error: 'Rate limit exceeded. Please try again in a moment.'
      });
    }

    // Generic server error
    res.status(500).json({
      error: 'Internal server error. Please try again later.'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`OpenAI API configured: ${!!process.env.OPENAI_API_KEY}`);
});