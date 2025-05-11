import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="container">
      <section className="hero">
        <h1 className="hero-title">Unicon(유니콘)</h1>
        <h2 className="hero-subtitle">초등학생을 위한 통일 교육 플랫폼</h2>
        <p className="hero-description">
          재미있는 활동을 통해 통일과 평화에 대해 배워보세요!
        </p>
      </section>

      <section className="features">
        <h2 className="section-title">주요 활동</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <h3>읽어보며 통일 알아보기</h3>
            <p>재미있는 이야기를 읽고 퀴즈를 풀어보세요.</p>
            <Link to="/reading" className="btn btn-primary">시작하기</Link>
          </div>
          
          <div className="feature-card">
            <h3>영상으로 통일 알아보기</h3>
            <p>통일 관련 영상을 보고 퀴즈를 풀어보세요.</p>
            <Link to="/video" className="btn btn-primary">시작하기</Link>
          </div>
          
          <div className="feature-card">
            <h3>UN참전국 감사편지 보내기</h3>
            <p>한국전쟁에 참전한 UN국가들에게 감사 편지를 써보세요.</p>
            <Link to="/letter" className="btn btn-primary">시작하기</Link>
          </div>
        </div>
      </section>

      <section className="about">
        <h2 className="section-title">유니콘 소개</h2>
        <p className="about-description">
          유니콘(Unicon)은 '통일(Unification)'과 '연결(Connection)'의 합성어로, 
          초등학생들이 통일과 평화의 가치를 배울 수 있도록 돕는 교육 플랫폼입니다. 
          다양한 상호작용 활동을 통해 통일에 대한 긍정적인 인식을 형성하고, 
          국제 평화의 중요성을 이해할 수 있습니다.
        </p>
      </section>
    </div>
  );
}

export default HomePage;