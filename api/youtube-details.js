// Vercel Serverless Function for YouTube Video Details API
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
    const { videoId } = req.query;
    
    if (!videoId) {
      return res.status(400).json({ error: 'videoId parameter is required' });
    }

    // Get YouTube API key from environment variables
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    if (!YOUTUBE_API_KEY) {
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`,
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
    
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return res.status(404).json({ error: '영상 정보를 찾을 수 없습니다' });
    }
    
    const videoInfo = data.items[0];
    
    // Format response
    const formattedResponse = {
      id: videoInfo.id,
      title: videoInfo.snippet.title,
      description: videoInfo.snippet.description,
      channelTitle: videoInfo.snippet.channelTitle,
      publishedAt: videoInfo.snippet.publishedAt,
      viewCount: videoInfo.statistics.viewCount,
      duration: videoInfo.contentDetails.duration,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    };
    
    return res.status(200).json(formattedResponse);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}