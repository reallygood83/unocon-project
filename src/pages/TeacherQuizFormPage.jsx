import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import './TeacherQuizFormPage.css';

function TeacherQuizFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [contentType, setContentType] = useState('none');
  
  const [readingMaterials, setReadingMaterials] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedContent, setSelectedContent] = useState('');

  // 세션 스토리지에서 교사 인증 확인
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('teacherAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/teacher');
    } else {
      fetchContentLists();
      if (isEditMode) {
        fetchQuizData();
      }
    }
  }, [navigate, isEditMode, id]);

  // 콘텐츠 목록 불러오기
  const fetchContentLists = async () => {
    try {
      setLoading(true);
      
      // 읽기 자료 불러오기
      const { data: readingData, error: readingError } = await supabase
        .from('reading_materials')
        .select('id, title')
        .order('title');
      
      if (readingError) throw readingError;
      setReadingMaterials(readingData || []);
      
      // 영상 자료 불러오기
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('id, title')
        .order('title');
      
      if (videoError) throw videoError;
      setVideos(videoData || []);
      
    } catch (error) {
      console.error('콘텐츠 목록 불러오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 퀴즈 데이터 불러오기 (수정 모드)
  const fetchQuizData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setQuestion(data.question || '');
        setOptions(data.options || ['', '', '', '']);
        setCorrectAnswer(data.correct_answer !== undefined ? data.correct_answer : 0);
        setExplanation(data.explanation || '');
        setDifficulty(data.difficulty || 3);
        
        // 콘텐츠 타입 설정
        if (data.material_id) {
          setContentType('reading');
          setSelectedContent(data.material_id);
        } else if (data.video_id) {
          setContentType('video');
          setSelectedContent(data.video_id);
        } else {
          setContentType('none');
          setSelectedContent('');
        }
      }
    } catch (error) {
      console.error('퀴즈 데이터 불러오기 오류:', error);
      setFormError('퀴즈 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 옵션 변경 처리
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // 퀴즈 저장
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!question) {
      setFormError('질문을 입력해주세요.');
      return;
    }
    
    if (options.some(option => !option)) {
      setFormError('모든 선택지를 입력해주세요.');
      return;
    }
    
    try {
      setSaveLoading(true);
      
      const quizData = {
        question,
        options,
        correct_answer: correctAnswer,
        explanation,
        difficulty,
        material_id: contentType === 'reading' ? selectedContent : null,
        video_id: contentType === 'video' ? selectedContent : null
      };
      
      let result;
      
      if (isEditMode) {
        // 기존 퀴즈 수정
        result = await supabase
          .from('quizzes')
          .update(quizData)
          .eq('id', id);
      } else {
        // 새 퀴즈 생성
        result = await supabase
          .from('quizzes')
          .insert(quizData);
      }
      
      const { error } = result;
      
      if (error) throw error;
      
      navigate('/teacher/quizzes');
    } catch (error) {
      console.error('퀴즈 저장 오류:', error);
      setFormError('퀴즈 저장 중 오류가 발생했습니다.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return <div className="container loading">데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div className="container">
      <div className="teacher-quiz-form">
        <h1>{isEditMode ? '퀴즈 수정' : '새 퀴즈 추가'}</h1>
        
        {formError && <div className="form-error">{formError}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="question">질문</label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="퀴즈 질문을 입력하세요"
              rows="3"
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label>선택지</label>
            {options.map((option, index) => (
              <div key={index} className={`option-input ${index === correctAnswer ? 'correct' : ''}`}>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`선택지 ${index + 1}`}
                  required
                />
                <label className="radio-label">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value={index}
                    checked={correctAnswer === index}
                    onChange={() => setCorrectAnswer(index)}
                  />
                  정답
                </label>
              </div>
            ))}
          </div>
          
          <div className="form-group">
            <label htmlFor="explanation">정답 설명 (선택사항)</label>
            <textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="정답에 대한 설명을 입력하세요 (선택사항)"
              rows="2"
            ></textarea>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="difficulty">난이도</label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
              >
                <option value={1}>1 (매우 쉬움)</option>
                <option value={2}>2 (쉬움)</option>
                <option value={3}>3 (보통)</option>
                <option value={4}>4 (어려움)</option>
                <option value={5}>5 (매우 어려움)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="contentType">콘텐츠 연결</label>
              <select
                id="contentType"
                value={contentType}
                onChange={(e) => {
                  setContentType(e.target.value);
                  setSelectedContent('');
                }}
              >
                <option value="none">없음 (독립 퀴즈)</option>
                <option value="reading">읽기 자료</option>
                <option value="video">영상 자료</option>
              </select>
            </div>
          </div>
          
          {contentType !== 'none' && (
            <div className="form-group">
              <label htmlFor="selectedContent">
                {contentType === 'reading' ? '연결할 읽기 자료' : '연결할 영상'}
              </label>
              <select
                id="selectedContent"
                value={selectedContent}
                onChange={(e) => setSelectedContent(e.target.value)}
                required
              >
                <option value="">선택하세요</option>
                {contentType === 'reading' && readingMaterials.map(item => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
                {contentType === 'video' && videos.map(item => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="form-buttons">
            <button 
              type="button" 
              className="btn btn-cancel"
              onClick={() => navigate('/teacher/quizzes')}
            >
              취소
            </button>
            <button 
              type="submit" 
              className="btn btn-save"
              disabled={saveLoading}
            >
              {saveLoading ? '저장 중...' : (isEditMode ? '수정 완료' : '퀴즈 추가')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeacherQuizFormPage;