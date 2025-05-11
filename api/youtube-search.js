// Vercel Serverless Function for YouTube API
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
    const { query, maxResults = 8 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Get YouTube API key from environment variables
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    if (!YOUTUBE_API_KEY) {
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&key=${YOUTUBE_API_KEY}&relevanceLanguage=ko&safeSearch=strict`,
      { method: 'GET' }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('YouTube API error:', errorData);
      return res.status(response.status).json({ 
        error: 'Error fetching data from YouTube API',
        details: errorData
      });
    }

    const data = await response.json();
    
    // Fix thumbnail URLs to use https
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach(item => {
        if (item.snippet && item.snippet.thumbnails) {
          const thumbnails = item.snippet.thumbnails;
          Object.keys(thumbnails).forEach(key => {
            if (thumbnails[key] && thumbnails[key].url) {
              // Ensure thumbnails use https
              thumbnails[key].url = thumbnails[key].url.replace('http://', 'https://');
            }
          });
        }
      });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}