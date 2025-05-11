// Vercel Serverless Function for Naver API
export default async function handler(req, res) {
  // Set CORS headers to allow requests from our frontend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Get Naver API credentials from environment variables
    const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
    const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

    if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Naver API credentials not configured' });
    }

    const response = await fetch(
      `https://openapi.naver.com/v1/search/webkr?query=${encodeURIComponent(query)}&display=10&start=1&sort=sim`,
      {
        headers: {
          'X-Naver-Client-Id': NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Naver API error:', errorData);
      return res.status(response.status).json({ 
        error: 'Error fetching data from Naver API',
        details: errorData
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}