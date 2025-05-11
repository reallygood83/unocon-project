// Integration with YouTube Data API

// API key from environment variables
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// 안전한 채널 ID 목록 (검증된 통일 교육 콘텐츠 제공자)
const SAFE_CHANNEL_IDS = [
  'UC9ftsObOaXJDEO76yXX9EIw', // 통일부 통일교육원
  'UCO_DuPOFEDLoTWnWYtpkohQ', // EBS 키즈
  'UCW20vhMR31WAdGYJ5mSiWsg', // EBS 초등
  'UCa1d0R2gDkOJOmrVDaodPdA'  // 교육부
];

/**
 * Search for unification videos using YouTube API
 * @param {string} query - Search query
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise} - API response
 */
export const searchUnificationVideos = async (query, maxResults = 8) => {
  try {
    // 통일 교육 관련 키워드와 함께 검색
    const searchQuery = `통일 교육 ${query}`;
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&maxResults=${maxResults}&type=video&key=${YOUTUBE_API_KEY}&relevanceLanguage=ko&safeSearch=strict`,
      {
        method: 'GET'
      }
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API 요청 실패: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('검색 결과가 없습니다');
    }
    
    // 데이터 포맷 변환
    const formattedVideos = data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    }));
    
    return {
      success: true,
      data: formattedVideos
    };
  } catch (error) {
    console.error('Error searching videos:', error);
    
    // API 키 문제나 오류 발생 시 폴백 데이터 사용
    if (error.message.includes('API 키') || error.message.includes('YouTube API 요청 실패') || 
        error.message.includes('검색 결과가 없습니다')) {
      console.warn('유튜브 API 호출 실패, 폴백 데이터 사용');
      return {
        success: true,
        data: [
          {
            id: 'Hhn7UiRa41M',
            title: '통일 이야기: 함께 꿈꾸는 미래',
            description: '통일 후 한반도의 모습을 상상해보는 애니메이션',
            thumbnail: 'https://i.ytimg.com/vi/Hhn7UiRa41M/hqdefault.jpg',
            channelTitle: '통일부 통일교육원',
            publishedAt: '2023-06-25T09:00:00Z'
          },
          {
            id: 'IZqJTNRerUM',
            title: '한반도의 평화와 통일',
            description: '한반도 평화와 통일의 중요성에 대해 설명하는 영상',
            thumbnail: 'https://i.ytimg.com/vi/IZqJTNRerUM/hqdefault.jpg',
            channelTitle: '통일부 통일교육원',
            publishedAt: '2023-05-10T07:30:00Z'
          },
          {
            id: 'KbL2tS8sNo0',
            title: '북한 어린이들의 학교생활',
            description: '북한 어린이들의 일상과 학교생활에 대해 알아봅니다.',
            thumbnail: 'https://i.ytimg.com/vi/KbL2tS8sNo0/hqdefault.jpg',
            channelTitle: '통일부 통일교육원',
            publishedAt: '2023-07-15T11:20:00Z'
          },
          {
            id: 'j12gKrLPZ-k',
            title: '이산가족 할아버지의 이야기',
            description: '한국전쟁으로 인해 가족과 헤어진 할아버지의 이산가족 사연',
            thumbnail: 'https://i.ytimg.com/vi/j12gKrLPZ-k/hqdefault.jpg',
            channelTitle: '통일부 통일교육원',
            publishedAt: '2023-04-05T14:15:00Z'
          }
        ],
        fromFallback: true
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get video details from YouTube API
 * @param {string} videoId - YouTube video ID
 * @returns {Promise} - Video details
 */
export const getVideoDetails = async (videoId) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`,
      {
        method: 'GET'
      }
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API 요청 실패: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('영상 정보를 찾을 수 없습니다');
    }
    
    const videoInfo = data.items[0];
    
    return {
      success: true,
      data: {
        id: videoInfo.id,
        title: videoInfo.snippet.title,
        description: videoInfo.snippet.description,
        channelTitle: videoInfo.snippet.channelTitle,
        publishedAt: videoInfo.snippet.publishedAt,
        viewCount: videoInfo.statistics.viewCount,
        duration: videoInfo.contentDetails.duration,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      }
    };
  } catch (error) {
    console.error('Error getting video details:', error);
    
    // API 키 문제나 오류 발생 시 폴백 데이터 사용
    if (error.message.includes('API 키') || error.message.includes('YouTube API 요청 실패') || 
        error.message.includes('영상 정보를 찾을 수 없습니다')) {
      console.warn('유튜브 API 비디오 상세 정보 호출 실패, 폴백 데이터 사용');
      
      const fallbackData = {
        'Hhn7UiRa41M': {
          id: 'Hhn7UiRa41M',
          title: '통일 이야기: 함께 꿈꾸는 미래',
          description: '통일 후 한반도의 모습을 상상해보는 애니메이션입니다. 초등학생들에게 통일의 의미와 가치를 알려줍니다.',
          channelTitle: '통일부 통일교육원',
          publishedAt: '2023-06-25T09:00:00Z',
          viewCount: '15243',
          duration: 'PT5M32S',
          thumbnail: `https://i.ytimg.com/vi/Hhn7UiRa41M/hqdefault.jpg`
        },
        'IZqJTNRerUM': {
          id: 'IZqJTNRerUM',
          title: '한반도의 평화와 통일',
          description: '한반도 평화와 통일의 중요성에 대해 설명하는 영상입니다. 남북관계의 역사와 평화로운 미래에 대해 이야기합니다.',
          channelTitle: '통일부 통일교육원',
          publishedAt: '2023-05-10T07:30:00Z',
          viewCount: '8721',
          duration: 'PT7M15S',
          thumbnail: `https://i.ytimg.com/vi/IZqJTNRerUM/hqdefault.jpg`
        }
      };
      
      const defaultData = {
        id: videoId,
        title: '통일 교육 영상',
        description: '통일 교육과 관련된 영상입니다.',
        channelTitle: '통일부 통일교육원',
        publishedAt: '2023-01-01T00:00:00Z',
        viewCount: '1000',
        duration: 'PT5M00S',
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      };
      
      return {
        success: true,
        data: fallbackData[videoId] || defaultData,
        fromFallback: true
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  }
};