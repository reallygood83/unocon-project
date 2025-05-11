import { useState, useEffect } from 'react';
import './VideoPage.css';

function VideoPage() {
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  
  // Placeholder for future YouTube API integration
  useEffect(() => {
    // This will be replaced with actual YouTube API call
    setVideos([
      {
        id: 'video1',
        title: '통일 이야기: 함께 꿈꾸는 미래',
        videoId: 'Hhn7UiRa41M', // Example YouTube video ID
        description: '통일 후 한반도의 모습을 상상해보는 애니메이션',
        questions: [
          {
            id: 1,
            question: '영상에서 통일 후 한반도는 어떤 모습인가요?',
            options: ['경제 강국', '평화로운 나라', '관광 명소', '분단된 상태'],
            answer: 1
          }
        ]
      },
      {
        id: 'video2',
        title: '한반도의 평화와 통일',
        videoId: 'IZqJTNRerUM', // Example YouTube video ID
        description: '한반도 평화와 통일의 중요성에 대해 설명하는 영상',
        questions: [
          {
            id: 1,
            question: '한반도 통일을 위해 가장 중요한 것은 무엇인가요?',
            options: ['군사력 강화', '경제 성장', '대화와 협력', '국제적 지원'],
            answer: 2
          }
        ]
      }
    ]);
  }, []);

  return (
    <div className="container">
      <section className="video-intro">
        <h1>영상으로 통일 알아보기</h1>
        <p>통일 관련 영상을 보고 퀴즈를 풀어보세요.</p>
      </section>

      {loading ? (
        <div className="loading">
          <p>콘텐츠를 불러오는 중입니다...</p>
        </div>
      ) : (
        <div className="videos">
          {videos.map(video => (
            <div key={video.id} className="video-card">
              <h2>{video.title}</h2>
              <div className="video-container">
                <iframe 
                  width="100%" 
                  height="315"
                  src={`https://www.youtube.com/embed/${video.videoId}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <p className="video-description">{video.description}</p>
              
              <div className="video-questions">
                <h3>퀴즈</h3>
                {video.questions.map(question => (
                  <div key={question.id} className="question">
                    <p className="question-text">{question.question}</p>
                    <div className="options">
                      {question.options.map((option, index) => (
                        <button 
                          key={index} 
                          className="option-btn"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VideoPage;