import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherPage.css';

function TeacherPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const correctPassword = '19500625'; // 한국전쟁 발발일
  const navigate = useNavigate();

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
      setError('');
      // 비밀번호를 세션 스토리지에 저장하여 페이지 새로고침 시에도 유지
      sessionStorage.setItem('teacherAuthenticated', 'true');
    } else {
      setError('비밀번호가 올바르지 않습니다. 다시 시도해주세요.');
    }
  };

  // 컴포넌트 마운트 시 세션 스토리지 확인
  useState(() => {
    if (sessionStorage.getItem('teacherAuthenticated') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="teacher-auth-container">
          <h1>교사 관리 페이지</h1>
          <p>이 페이지는 교사 전용 페이지입니다. 접근하려면 비밀번호를 입력하세요.</p>
          
          <form onSubmit={handlePasswordSubmit} className="password-form">
            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="btn btn-primary">확인</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <section className="teacher-dashboard">
        <h1>교사 관리 페이지</h1>
        <p>유니콘 플랫폼의 콘텐츠를 관리하고 생성할 수 있습니다.</p>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>읽기 자료 관리</h2>
            <div className="card-actions">
              <button className="btn" onClick={() => navigate('/teacher/reading')}>읽기 자료 목록</button>
              <button className="btn" onClick={() => navigate('/teacher/reading/new')}>새 읽기 자료 추가</button>
            </div>
          </div>
          
          <div className="dashboard-card">
            <h2>영상 자료 관리</h2>
            <div className="card-actions">
              <button className="btn" onClick={() => navigate('/teacher/videos')}>영상 자료 목록</button>
              <button className="btn" onClick={() => navigate('/teacher/videos/new')}>새 영상 자료 추가</button>
            </div>
          </div>
          
          <div className="dashboard-card">
            <h2>퀴즈 관리</h2>
            <div className="card-actions">
              <button className="btn" onClick={() => navigate('/teacher/quizzes')}>퀴즈 목록</button>
              <button className="btn" onClick={() => navigate('/teacher/quizzes/new')}>새 퀴즈 추가</button>
            </div>
          </div>
          
          <div className="dashboard-card">
            <h2>UN참전국 관리</h2>
            <div className="card-actions">
              <button className="btn" onClick={() => navigate('/teacher/countries')}>참전국 목록</button>
              <button className="btn" onClick={() => navigate('/teacher/countries/new')}>새 참전국 추가</button>
            </div>
          </div>
          
          <div className="dashboard-card">
            <h2>학생 진행 상황</h2>
            <div className="card-actions">
              <button className="btn" onClick={() => navigate('/teacher/progress')}>학생 활동 확인</button>
              <button className="btn" onClick={() => navigate('/teacher/letters')}>작성된 편지 확인</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TeacherPage;