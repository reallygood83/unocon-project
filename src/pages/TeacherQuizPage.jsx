import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import './TeacherQuizPage.css';

function TeacherQuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 세션 스토리지에서 교사 인증 확인
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('teacherAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/teacher');
    } else {
      fetchQuizzes();
    }
  }, [navigate]);

  // 퀴즈 데이터 불러오기
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          reading_materials(title),
          videos(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('퀴즈 불러오기 오류:', error);
      setError('퀴즈를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 퀴즈 삭제 함수
  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('정말로 이 퀴즈를 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      // 삭제 후 목록 갱신
      setQuizzes(quizzes.filter(quiz => quiz.id !== id));
    } catch (error) {
      console.error('퀴즈 삭제 오류:', error);
      alert('퀴즈 삭제 중 오류가 발생했습니다.');
    }
  };

  // 퀴즈의 연결된 자료 이름 가져오기
  const getRelatedContentTitle = (quiz) => {
    if (quiz.material_id && quiz.reading_materials) {
      return `읽기 자료: ${quiz.reading_materials.title}`;
    } else if (quiz.video_id && quiz.videos) {
      return `영상: ${quiz.videos.title}`;
    } else {
      return '독립 퀴즈';
    }
  };

  if (loading) {
    return <div className="container loading">데이터를 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div className="container error">{error}</div>;
  }

  return (
    <div className="container">
      <div className="teacher-quiz-page">
        <div className="page-header">
          <h1>퀴즈 관리</h1>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/teacher/quizzes/new')}
          >
            새 퀴즈 추가
          </button>
        </div>
        
        <p>현재 등록된 퀴즈: {quizzes.length}개</p>
        
        {quizzes.length === 0 ? (
          <div className="empty-state">
            <p>등록된 퀴즈가 없습니다. 새 퀴즈를 추가해보세요.</p>
          </div>
        ) : (
          <div className="quiz-list">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="quiz-card">
                <div className="quiz-header">
                  <h3>{quiz.question}</h3>
                  <span className="quiz-type">{getRelatedContentTitle(quiz)}</span>
                </div>
                
                <div className="quiz-options">
                  {Array.isArray(quiz.options) && quiz.options.map((option, index) => (
                    <div 
                      key={index} 
                      className={`quiz-option ${index === quiz.correct_answer ? 'correct' : ''}`}
                    >
                      {option}
                      {index === quiz.correct_answer && <span className="correct-marker">✓</span>}
                    </div>
                  ))}
                </div>
                
                <div className="quiz-footer">
                  <span className="quiz-difficulty">난이도: {quiz.difficulty || 3}</span>
                  <div className="quiz-actions">
                    <button 
                      className="btn btn-edit"
                      onClick={() => navigate(`/teacher/quizzes/edit/${quiz.id}`)}
                    >
                      수정
                    </button>
                    <button 
                      className="btn btn-delete"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherQuizPage;