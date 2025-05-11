// Integration with Google's Gemini 2.0 Flash API for AI-powered features

// API key from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash:generateContent';

/**
 * Generate quiz questions based on content
 * @param {string} content - Text content to generate questions from
 * @param {number} numberOfQuestions - Number of questions to generate
 * @param {number} gradeLevel - School grade level (3-6)
 * @returns {Promise} - Generated questions
 */
export const generateQuizQuestions = async (content, numberOfQuestions = 3, gradeLevel = 3) => {
  try {
    // 내용이 너무 짧으면 에러 방지
    if (content.length < 50) {
      throw new Error('콘텐츠가 너무 짧습니다. 더 많은 내용이 필요합니다.');
    }

    // 프롬프트 구성
    const prompt = `
다음 콘텐츠를 읽고 한국 초등학교 ${gradeLevel}학년 수준에 적합한 객관식 퀴즈 ${numberOfQuestions}개를 생성해주세요.
각 퀴즈는 질문과 4개의 선택지, 그리고 정답 번호(0-3)로 구성해주세요.
내용은 한국 통일 교육과 관련된 것으로, 아이들이 이해하기 쉽고 긍정적인 방식으로 작성해주세요.

콘텐츠:
${content.substring(0, 3000)}

JSON 형식으로 다음과 같이 반환해주세요:
{
  "questions": [
    {
      "question": "질문 내용",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "answer": 정답번호(0-3)
    },
    ...
  ]
}
`;

    // API 요청
    const response = await fetch(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API 요청 실패: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();

    if (!responseData.candidates || !responseData.candidates[0] || !responseData.candidates[0].content ||
        !responseData.candidates[0].content.parts || !responseData.candidates[0].content.parts[0] ||
        !responseData.candidates[0].content.parts[0].text) {
      throw new Error('Gemini API 응답 형식이 유효하지 않습니다.');
    }

    // 응답에서 JSON 추출
    const textResponse = responseData.candidates[0].content.parts[0].text;
    const jsonStartIndex = textResponse.indexOf('{');
    const jsonEndIndex = textResponse.lastIndexOf('}') + 1;

    if (jsonStartIndex < 0 || jsonEndIndex <= 0) {
      throw new Error('Gemini API 응답에서 JSON을 찾을 수 없습니다.');
    }

    const jsonString = textResponse.substring(jsonStartIndex, jsonEndIndex);

    // JSON 파싱
    const quizData = JSON.parse(jsonString);

    if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      throw new Error('유효한 퀴즈 데이터가 생성되지 않았습니다.');
    }

    return {
      success: true,
      data: quizData
    };
  } catch (error) {
    console.error('Error generating quiz questions:', error);

    // API 키 문제나 오류 발생 시 폴백 데이터 사용
    if (error.message.includes('API 키') || error.message.includes('Gemini API 요청 실패') ||
        error.message.includes('JSON') || error.message.includes('유효한 퀴즈 데이터')) {
      console.warn('Gemini API 호출 실패, 폴백 데이터 사용');

      // 콘텐츠 관련 키워드 추출 시도
      const keywords = content.toLowerCase().split(/\s+/).filter(word =>
        word.length > 2 && !['것은', '있는', '그리고', '또한', '그러나', '하지만'].includes(word)
      ).slice(0, 10);

      let fallbackQuestions;

      // 콘텐츠에 특정 키워드가 포함되어 있는지 확인하여 관련 퀴즈 제공
      if (content.includes('통일') || content.includes('평화') || content.includes('남북')) {
        fallbackQuestions = [
          {
            question: '한국전쟁은 언제 발발했나요?',
            options: ['1945년', '1950년', '1953년', '1960년'],
            answer: 1
          },
          {
            question: '남북한의 분단선인 휴전선은 무엇을 기준으로 하나요?',
            options: ['38선', '압록강', '두만강', '한강'],
            answer: 0
          },
          {
            question: '통일이 되면 얻을 수 있는 가장 큰 이점은 무엇인가요?',
            options: ['경제적 이익', '이산가족 상봉', '군사적 긴장 완화', '모든 답이 맞음'],
            answer: 3
          }
        ];
      } else if (content.includes('전쟁') || content.includes('UN') || content.includes('참전국')) {
        fallbackQuestions = [
          {
            question: 'UN참전국 중 가장 많은 병력을 파견한 국가는?',
            options: ['영국', '터키', '미국', '프랑스'],
            answer: 2
          },
          {
            question: '한국전쟁 휴전협정이 체결된 해는?',
            options: ['1950년', '1951년', '1953년', '1955년'],
            answer: 2
          },
          {
            question: '한국전쟁 중 UN군 사령관이었던 인물은?',
            options: ['아이젠하워', '맥아더', '패튼', '워싱턴'],
            answer: 1
          }
        ];
      } else {
        fallbackQuestions = [
          {
            question: '한반도 평화를 위해 가장 중요한 것은 무엇인가요?',
            options: ['경제 협력', '문화 교류', '정치적 합의', '모든 답이 맞음'],
            answer: 3
          },
          {
            question: '북한 어린이들과 남한 어린이들의 공통점으로 맞는 것은?',
            options: ['같은 언어를 사용함', '같은 역사를 공부함', '같은 노래를 부름', '모든 답이 맞음'],
            answer: 0
          },
          {
            question: '통일 교육의 목적으로 적절한 것은?',
            options: ['통일의 필요성 이해', '평화 의식 함양', '민족 공동체 의식 함양', '모든 답이 맞음'],
            answer: 3
          }
        ];
      }

      return {
        success: true,
        data: {
          questions: fallbackQuestions
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

/**
 * Analyze student letter content
 * @param {string} letterContent - Student's letter content
 * @returns {Promise} - Analysis results
 */
export const analyzeLetterContent = async (letterContent) => {
  try {
    // 편지 내용이 너무 짧으면 에러 방지
    if (letterContent.length < 20) {
      throw new Error('편지 내용이 너무 짧습니다. 더 많은 내용이 필요합니다.');
    }

    // 프롬프트 구성
    const prompt = `
다음은 초등학생이 UN참전국에 보내는 한국전쟁 감사 편지입니다.
이 편지의 내용을 분석하고, 다음 항목을 JSON 형식으로 반환해주세요:

1. sentiment: 편지의 전반적인 감정 (positive, neutral, negative)
2. themes: 편지에서 언급된 주요 주제 (문자열 배열, 최대 3개)
3. suggestions: 편지를 개선하기 위한 간단한 제안 (초등학생 수준에 맞게)

편지 내용:
${letterContent}

JSON 형식으로 반환:
{
  "sentiment": "감정",
  "themes": ["주제1", "주제2", "주제3"],
  "suggestions": "개선 제안"
}
`;

    // API 요청
    const response = await fetch(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API 요청 실패: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();

    if (!responseData.candidates || !responseData.candidates[0] || !responseData.candidates[0].content ||
        !responseData.candidates[0].content.parts || !responseData.candidates[0].content.parts[0] ||
        !responseData.candidates[0].content.parts[0].text) {
      throw new Error('Gemini API 응답 형식이 유효하지 않습니다.');
    }

    // 응답에서 JSON 추출
    const textResponse = responseData.candidates[0].content.parts[0].text;
    const jsonStartIndex = textResponse.indexOf('{');
    const jsonEndIndex = textResponse.lastIndexOf('}') + 1;

    if (jsonStartIndex < 0 || jsonEndIndex <= 0) {
      throw new Error('Gemini API 응답에서 JSON을 찾을 수 없습니다.');
    }

    const jsonString = textResponse.substring(jsonStartIndex, jsonEndIndex);

    // JSON 파싱
    const analysisData = JSON.parse(jsonString);

    if (!analysisData.sentiment || !analysisData.themes || !analysisData.suggestions) {
      throw new Error('유효한 분석 데이터가 생성되지 않았습니다.');
    }

    return {
      success: true,
      data: analysisData
    };
  } catch (error) {
    console.error('Error analyzing letter content:', error);

    // API 키 문제나 오류 발생 시 폴백 데이터 사용
    if (error.message.includes('API 키') || error.message.includes('Gemini API 요청 실패') ||
        error.message.includes('JSON') || error.message.includes('유효한 분석 데이터')) {
      console.warn('Gemini API 호출 실패, 폴백 데이터 사용');

      return {
        success: true,
        data: {
          sentiment: 'positive',
          themes: ['감사', '평화', '미래'],
          suggestions: '참전국의 구체적인 기여에 대해 언급하면 더 좋을 것 같습니다.'
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