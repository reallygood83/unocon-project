import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { searchUnificationContent } from '../services/naverApi';
import { generateQuizQuestions } from '../services/geminiApi';
import './TeacherReadingSearchPage.css';

function TeacherReadingSearchPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [generatedQuizzes, setGeneratedQuizzes] = useState([]);
  const [gradeLevel, setGradeLevel] = useState(3);
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // 세션 스토리지에서 교사 인증 확인
  useEffect(() => {
    const isAuth = sessionStorage.getItem('teacherAuthenticated') === 'true';
    if (!isAuth) {
      navigate('/teacher');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);
  
  // 검색 처리
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('검색어를 입력해주세요.');
      return;
    }
    
    try {
      setIsSearching(true);
      setError('');
      setSearchResults([]);
      setSelectedResult(null);
      setGeneratedQuizzes([]);
      
      // 통일 교육 관련 검색어 추가
      const query = `통일 교육 ${searchQuery}`;
      const { success, data, error: searchError } = await searchUnificationContent(query);
      
      if (!success) {
        throw new Error(searchError || '검색 중 오류가 발생했습니다.');
      }
      
      if (data && data.items && data.items.length > 0) {
        // 검색 결과를 사용자 친화적으로 가공
        const processedResults = data.items.map(item => ({
          ...item,
          title: item.title.replace(/<b>/g, '').replace(/<\/b>/g, ''),
          description: item.description.replace(/<b>/g, '').replace(/<\/b>/g, '')
        }));
        
        setSearchResults(processedResults);
      } else {
        setError('검색 결과가 없습니다. 다른 검색어를 시도해보세요.');
      }
    } catch (error) {
      console.error('검색 오류:', error);
      setError(error.message || '검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };
  
  // 퀴즈 생성
  const handleGenerateQuiz = async () => {
    if (!selectedResult) {
      setError('퀴즈 생성을 위해 문헌 자료를 선택해주세요.');
      return;
    }
    
    try {
      setGeneratingQuiz(true);
      setError('');
      setGeneratedQuizzes([]);
      setSuccessMessage('');
      
      // 선택된 결과의 제목과 설명에서 퀴즈 생성
      const content = `${selectedResult.title}\n\n${selectedResult.description}`;
      const { success, data, error: quizError } = await generateQuizQuestions(content, 3, gradeLevel);
      
      if (!success) {
        throw new Error(quizError || '퀴즈 생성 중 오류가 발생했습니다.');
      }
      
      if (data && data.questions) {
        setGeneratedQuizzes(data.questions);
      } else {
        setError('퀴즈를 생성할 수 없습니다. 다른 자료를 선택해보세요.');
      }
    } catch (error) {
      console.error('퀴즈 생성 오류:', error);
      setError(error.message || '퀴즈 생성 중 오류가 발생했습니다.');
    } finally {
      setGeneratingQuiz(false);
    }
  };
  
  // 자료 및 퀴즈 저장
  const handleSaveContent = async () => {
    if (!selectedResult || generatedQuizzes.length === 0) {
      setError('저장할 자료와 퀴즈가 없습니다.');
      return;
    }
    
    try {
      setError('');
      setSuccessMessage('');
      
      // 1. 먼저 읽기 자료 저장
      const { data: materialData, error: materialError } = await supabase
        .from('reading_materials')
        .insert({
          title: selectedResult.title,
          content: selectedResult.description,
          summary: selectedResult.description.substring(0, 200) + '...',
          source: selectedResult.link,
          grade_level: gradeLevel,
          is_fallback: false
        })
        .select()
        .single();
      
      if (materialError) throw materialError;
      
      // 2. 연결된 퀴즈 저장
      const quizzesToInsert = generatedQuizzes.map(quiz => ({
        question: quiz.question,
        options: quiz.options,
        correct_answer: quiz.answer,
        material_id: materialData.id,
        difficulty: gradeLevel
      }));
      
      const { error: quizzesError } = await supabase
        .from('quizzes')
        .insert(quizzesToInsert);
      
      if (quizzesError) throw quizzesError;
      
      setSuccessMessage('자료와 퀴즈가 성공적으로 저장되었습니다!');
      
      // 폼 초기화
      setTimeout(() => {
        setSelectedResult(null);
        setGeneratedQuizzes([]);
        setSearchResults([]);
        setSearchQuery('');
      }, 2000);
      
    } catch (error) {
      console.error('저장 오류:', error);
      setError(error.message || '자료 저장 중 오류가 발생했습니다.');
    }
  };
  
  // 결과 선택 처리
  const handleSelectResult = (result) => {
    setSelectedResult(result);
    setGeneratedQuizzes([]);
    setError('');
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="container">
      <div className="teacher-reading-search">
        <div className="page-header">
          <h1>문헌자료 검색 및 퀴즈 생성</h1>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/teacher')}
          >
            교사 대시보드로 돌아가기
          </button>
        </div>
        
        <p className="page-description">
          Naver 검색 API를 활용하여 통일 교육 관련 자료를 검색하고, AI를 통해 자동으로 퀴즈를 생성합니다.
        </p>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        {/* 검색 폼 */}
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="통일, 평화, 남북관계 등의 키워드로 검색"
              className="search-input"
              disabled={isSearching}
            />
            <button 
              type="submit" 
              className="btn search-btn"
              disabled={isSearching}
            >
              {isSearching ? '검색 중...' : '검색'}
            </button>
          </div>
        </form>
        
        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <div className="search-results">
            <h2>검색 결과 ({searchResults.length}개)</h2>
            <div className="results-list">
              {searchResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`result-item ${selectedResult === result ? 'selected' : ''}`}
                  onClick={() => handleSelectResult(result)}
                >
                  <h3>{result.title}</h3>
                  <p>{result.description}</p>
                  <div className="result-meta">
                    <a href={result.link} target="_blank" rel="noopener noreferrer" className="result-link">
                      원본 보기
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 선택된 자료 */}
        {selectedResult && (
          <div className="selected-content">
            <h2>선택된 자료</h2>
            <div className="content-card">
              <h3>{selectedResult.title}</h3>
              <p>{selectedResult.description}</p>
              
              <div className="quiz-options">
                <div className="form-group">
                  <label htmlFor="gradeLevel">학년 수준:</label>
                  <select
                    id="gradeLevel"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(Number(e.target.value))}
                    className="grade-select"
                  >
                    <option value={3}>3학년</option>
                    <option value={4}>4학년</option>
                    <option value={5}>5학년</option>
                    <option value={6}>6학년</option>
                  </select>
                </div>
                
                <button 
                  className="btn generate-btn"
                  onClick={handleGenerateQuiz}
                  disabled={generatingQuiz}
                >
                  {generatingQuiz ? '퀴즈 생성 중...' : '이 자료로 퀴즈 생성'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 생성된 퀴즈 */}
        {generatedQuizzes.length > 0 && (
          <div className="generated-quizzes">
            <h2>생성된 퀴즈</h2>
            
            <div className="quizzes-list">
              {generatedQuizzes.map((quiz, index) => (
                <div key={index} className="quiz-card">
                  <h3>퀴즈 {index + 1}</h3>
                  <p className="quiz-question">{quiz.question}</p>
                  
                  <div className="quiz-options-list">
                    {quiz.options.map((option, optIndex) => (
                      <div 
                        key={optIndex} 
                        className={`quiz-option ${optIndex === quiz.answer ? 'correct' : ''}`}
                      >
                        {option}
                        {optIndex === quiz.answer && <span className="correct-marker">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="save-actions">
              <button 
                className="btn save-btn"
                onClick={handleSaveContent}
              >
                자료와 퀴즈 저장하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherReadingSearchPage;