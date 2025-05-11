import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import './TeacherVideoFormPage.css';

function TeacherVideoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState({
    title: '',
    youtube_id: '',
    description: '',
    grade_level: 3,
    source: '',
    thumbnail_url: ''
  });
  
  const [quizzes, setQuizzes] = useState([
    { question: '', options: ['', '', '', ''], correct_answer: 0 }
  ]);
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // 인증 확인
  useEffect(() => {
    const isAuth = sessionStorage.getItem('teacherAuthenticated') === 'true';
    if (!isAuth) {
      navigate('/teacher');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);
  
  // 편집 모드인 경우 데이터 불러오기
  useEffect(() => {
    if (isAuthenticated && isEditMode) {
      loadVideoData();
    }
  }, [isAuthenticated, isEditMode, id]);
  
  // 영상 데이터 불러오기
  const loadVideoData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // 영상 정보 가져오기
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (videoError) throw videoError;
      if (!videoData) throw new Error('영상을 찾을 수 없습니다.');
      
      setVideoData(videoData);
      
      // 연결된 퀴즈 가져오기
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('video_id', id)
        .order('id');
      
      if (quizzesError) throw quizzesError;
      
      if (quizzesData && quizzesData.length > 0) {
        // 퀴즈 데이터 포맷 변환
        const formattedQuizzes = quizzesData.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer
        }));
        setQuizzes(formattedQuizzes);
      }
      
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      setError(error.message || '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 입력 필드 변경 처리
  const handleVideoInputChange = (e) => {
    const { name, value } = e.target;
    setVideoData({
      ...videoData,
      [name]: name === 'grade_level' ? Number(value) : value
    });
  };
  
  // 퀴즈 변경 처리
  const handleQuizChange = (index, field, value) => {
    const updatedQuizzes = [...quizzes];
    
    if (field === 'options') {
      const [optionIndex, optionValue] = value;
      updatedQuizzes[index].options[optionIndex] = optionValue;
    } else {
      updatedQuizzes[index][field] = field === 'correct_answer' ? Number(value) : value;
    }
    
    setQuizzes(updatedQuizzes);
  };
  
  // 퀴즈 추가
  const addQuiz = () => {
    setQuizzes([
      ...quizzes,
      { question: '', options: ['', '', '', ''], correct_answer: 0 }
    ]);
  };
  
  // 퀴즈 삭제
  const removeQuiz = (index) => {
    if (quizzes.length > 1) {
      const updatedQuizzes = [...quizzes];
      updatedQuizzes.splice(index, 1);
      setQuizzes(updatedQuizzes);
    }
  };
  
  // 유튜브 ID 추출 (사용자가 전체 URL을 입력할 경우)
  const extractYoutubeId = (url) => {
    if (!url) return '';
    
    // 이미 ID만 입력된 경우
    if (url.length === 11 && !url.includes('/')) {
      return url;
    }
    
    // URL에서 ID 추출
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };
  
  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 기본 데이터 검증
    if (!videoData.title || !videoData.youtube_id) {
      setError('제목과 유튜브 ID는 필수 입력 항목입니다.');
      return;
    }
    
    // 퀴즈 데이터 검증
    for (const quiz of quizzes) {
      if (!quiz.question || quiz.options.some(opt => !opt)) {
        setError('모든 퀴즈 문항과 선택지를 입력해주세요.');
        return;
      }
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      // YouTube ID 처리
      const youtubeId = extractYoutubeId(videoData.youtube_id);
      
      // 썸네일 URL이 없을 경우 기본값 설정
      const thumbnailUrl = videoData.thumbnail_url || `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
      
      if (isEditMode) {
        // 업데이트 모드
        // 1. 영상 정보 업데이트
        const { error: videoError } = await supabase
          .from('videos')
          .update({
            title: videoData.title,
            youtube_id: youtubeId,
            description: videoData.description,
            source: videoData.source,
            grade_level: videoData.grade_level,
            thumbnail_url: thumbnailUrl
          })
          .eq('id', id);
        
        if (videoError) throw videoError;
        
        // 2. 기존 퀴즈 삭제 후 새로 저장
        const { error: deleteError } = await supabase
          .from('quizzes')
          .delete()
          .eq('video_id', id);
        
        if (deleteError) throw deleteError;
        
      } else {
        // 신규 생성 모드
        // 1. 영상 정보 저장
        const { data: videoData, error: videoError } = await supabase
          .from('videos')
          .insert({
            title: videoData.title,
            youtube_id: youtubeId,
            description: videoData.description,
            source: videoData.source,
            grade_level: videoData.grade_level,
            thumbnail_url: thumbnailUrl
          })
          .select()
          .single();
        
        if (videoError) throw videoError;
        
        // ID 설정 (신규 생성 시)
        id = videoData.id;
      }
      
      // 3. 퀴즈 저장
      const quizzesToInsert = quizzes.map(quiz => ({
        question: quiz.question,
        options: quiz.options,
        correct_answer: quiz.correct_answer,
        video_id: id,
        difficulty: videoData.grade_level
      }));
      
      const { error: quizzesError } = await supabase
        .from('quizzes')
        .insert(quizzesToInsert);
      
      if (quizzesError) throw quizzesError;
      
      setSuccessMessage('영상과 퀴즈가 성공적으로 저장되었습니다!');
      
      // 완료 후 목록 페이지로 이동
      setTimeout(() => {
        navigate('/teacher/quizzes');
      }, 1500);
      
    } catch (error) {
      console.error('저장 오류:', error);
      setError(error.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  if (isLoading && isEditMode) {
    return (
      <div className="container">
        <div className="loading-indicator">데이터를 불러오는 중...</div>
      </div>
    );
  }
  
  return (
    <div className="container">
      <div className="teacher-video-form">
        <div className="page-header">
          <h1>{isEditMode ? '영상 및 퀴즈 수정' : '새 영상 및 퀴즈 등록'}</h1>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/teacher/quizzes')}
          >
            목록으로 돌아가기
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>영상 정보</h2>
            
            <div className="form-group">
              <label htmlFor="title">영상 제목 *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={videoData.title}
                onChange={handleVideoInputChange}
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="youtube_id">유튜브 ID 또는 URL *</label>
              <input
                type="text"
                id="youtube_id"
                name="youtube_id"
                value={videoData.youtube_id}
                onChange={handleVideoInputChange}
                required
                className="form-control"
                placeholder="예: dQw4w9WgXcQ 또는 https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              />
              {videoData.youtube_id && (
                <div className="video-preview">
                  <iframe
                    width="100%"
                    height="315"
                    src={`https://www.youtube.com/embed/${extractYoutubeId(videoData.youtube_id)}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="description">설명</label>
              <textarea
                id="description"
                name="description"
                value={videoData.description}
                onChange={handleVideoInputChange}
                rows="4"
                className="form-control"
              ></textarea>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="source">출처/채널명</label>
                <input
                  type="text"
                  id="source"
                  name="source"
                  value={videoData.source}
                  onChange={handleVideoInputChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="grade_level">학년 수준</label>
                <select
                  id="grade_level"
                  name="grade_level"
                  value={videoData.grade_level}
                  onChange={handleVideoInputChange}
                  className="form-control"
                >
                  <option value={3}>3학년</option>
                  <option value={4}>4학년</option>
                  <option value={5}>5학년</option>
                  <option value={6}>6학년</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="thumbnail_url">썸네일 URL (선택사항)</label>
              <input
                type="text"
                id="thumbnail_url"
                name="thumbnail_url"
                value={videoData.thumbnail_url}
                onChange={handleVideoInputChange}
                className="form-control"
                placeholder="비워두면 유튜브 기본 썸네일이 사용됩니다"
              />
            </div>
          </div>
          
          <div className="form-section">
            <div className="section-header">
              <h2>퀴즈 문항</h2>
              <button 
                type="button" 
                className="btn btn-sm btn-primary add-quiz-btn"
                onClick={addQuiz}
              >
                퀴즈 추가
              </button>
            </div>
            
            {quizzes.map((quiz, index) => (
              <div key={index} className="quiz-form-item">
                <div className="quiz-header">
                  <h3>퀴즈 {index + 1}</h3>
                  {quizzes.length > 1 && (
                    <button 
                      type="button" 
                      className="btn btn-sm btn-danger"
                      onClick={() => removeQuiz(index)}
                    >
                      삭제
                    </button>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor={`question-${index}`}>문제</label>
                  <input
                    type="text"
                    id={`question-${index}`}
                    value={quiz.question}
                    onChange={(e) => handleQuizChange(index, 'question', e.target.value)}
                    required
                    className="form-control"
                  />
                </div>
                
                {[0, 1, 2, 3].map((optIndex) => (
                  <div key={optIndex} className="form-group">
                    <label htmlFor={`option-${index}-${optIndex}`}>
                      보기 {optIndex + 1}
                      {quiz.correct_answer === optIndex && <span className="correct-marker"> (정답)</span>}
                    </label>
                    <input
                      type="text"
                      id={`option-${index}-${optIndex}`}
                      value={quiz.options[optIndex]}
                      onChange={(e) => handleQuizChange(index, 'options', [optIndex, e.target.value])}
                      required
                      className="form-control"
                    />
                  </div>
                ))}
                
                <div className="form-group">
                  <label htmlFor={`correct-answer-${index}`}>정답 선택</label>
                  <select
                    id={`correct-answer-${index}`}
                    value={quiz.correct_answer}
                    onChange={(e) => handleQuizChange(index, 'correct_answer', e.target.value)}
                    className="form-control"
                  >
                    <option value={0}>보기 1</option>
                    <option value={1}>보기 2</option>
                    <option value={2}>보기 3</option>
                    <option value={3}>보기 4</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary save-btn"
              disabled={isLoading}
            >
              {isLoading ? '저장 중...' : (isEditMode ? '변경사항 저장' : '영상 및 퀴즈 등록')}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary cancel-btn"
              onClick={() => navigate('/teacher/quizzes')}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeacherVideoFormPage;