import { useState, useEffect } from 'react';
import './ReadingPage.css';

function ReadingPage() {
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  
  // Placeholder for future API integration
  useEffect(() => {
    // This will be replaced with actual Naver API call
    setArticles([
      {
        id: 1,
        title: '통일 이야기: 한민족의 역사',
        content: '오랜 역사 속에서 한민족은 하나의 국가로 살아왔습니다. 그러나 현재는 남과 북으로 나뉘어져 있습니다. 통일은 우리 민족의 염원이자 미래의 희망입니다.',
        questions: [
          {
            id: 1,
            question: '한민족은 언제부터 나뉘어졌나요?',
            options: ['조선시대', '일제강점기', '한국전쟁 이후', '고려시대'],
            answer: 2
          }
        ]
      },
      {
        id: 2,
        title: '평화와 통일의 중요성',
        content: '평화는 모든 사람들이 행복하게 살기 위한 필수 조건입니다. 통일은 한반도에 진정한 평화를 가져올 수 있는 길입니다.',
        questions: [
          {
            id: 1,
            question: '통일이 가져올 수 있는 가장 중요한 가치는 무엇인가요?',
            options: ['경제적 이익', '평화', '국제적 위상 강화', '자원 공유'],
            answer: 1
          }
        ]
      }
    ]);
  }, []);

  return (
    <div className="container">
      <section className="reading-intro">
        <h1>읽어보며 통일 알아보기</h1>
        <p>재미있는 이야기를 읽고 퀴즈를 풀어보세요.</p>
      </section>

      {loading ? (
        <div className="loading">
          <p>콘텐츠를 불러오는 중입니다...</p>
        </div>
      ) : (
        <div className="articles">
          {articles.map(article => (
            <div key={article.id} className="article-card">
              <h2>{article.title}</h2>
              <p className="article-content">{article.content}</p>
              
              <div className="article-questions">
                <h3>퀴즈</h3>
                {article.questions.map(question => (
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

export default ReadingPage;