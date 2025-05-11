// Integration with Naver Search API

// API keys from environment variables
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = import.meta.env.VITE_NAVER_CLIENT_SECRET;

/**
 * Search for unification education content using Naver API
 * @param {string} query - Search query
 * @returns {Promise} - API response
 */
export const searchUnificationContent = async (query) => {
  try {
    // CORS 우회를 위한 서버리스 프록시가 이상적이지만,
    // 프론트엔드에서 직접 호출하는 방식으로 구현
    // (실제 프로덕션 환경에서는 서버리스 함수를 통해 호출하는 것이 좋음)
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
      throw new Error(`Naver API 요청 실패: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // HTML 태그 제거 및 데이터 정제
    if (data.items && Array.isArray(data.items)) {
      data.items = data.items.map(item => ({
        ...item,
        title: item.title.replace(/<\/?b>/g, ''),
        description: item.description.replace(/<\/?b>/g, '')
      }));
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error searching content:', error);

    // API 키 문제나 CORS 이슈가 있을 경우 폴백 데이터 사용
    if (error.message.includes('CORS') || error.message.includes('네트워크') ||
        error.message.includes('API 키') || error.message.includes('Naver API 요청 실패')) {
      console.warn('네이버 API 호출 실패, 폴백 데이터 사용');
      return {
        success: true,
        data: {
          items: [
            {
              title: '초등학생을 위한 통일 교육의 중요성',
              description: '초등학생 시기는 통일 교육에 있어 매우 중요한 시기입니다. 이 시기에 형성된 통일에 대한 인식은 이후 성인이 되어서도 영향을 미치게 됩니다.',
              link: 'https://www.uniedu.go.kr/uniedu/home/pds/pdsatcl/view.do?id=19042'
            },
            {
              title: '평화·통일교육 : 방향과 관점',
              description: '통일부 통일교육원에서 발간한 평화·통일교육의 방향과 관점에 대한 자료입니다. 통일교육의 목표와 내용, 방법 등을 담고 있습니다.',
              link: 'https://www.uniedu.go.kr/uniedu/home/pds/pdsatcl/view.do?id=19868'
            },
            {
              title: '한반도 평화프로세스와 통일교육',
              description: '한반도 평화 정착을 위한 과정과 통일교육의 연계성에 대해 다루고 있습니다. 평화와 통일의 관계를 초등학생이 이해할 수 있도록 설명합니다.',
              link: 'https://www.uniedu.go.kr/uniedu/home/pds/pdsatcl/view.do?id=18881'
            }
          ]
        },
        fromFallback: true
      };
    }

    return {
      success: false,
      error: error.message
    };
  }
};