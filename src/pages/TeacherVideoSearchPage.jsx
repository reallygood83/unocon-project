import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { searchUnificationVideos, getVideoDetails } from '../services/youtubeApi';
import { generateQuizQuestions } from '../services/geminiApi';
import './TeacherVideoSearchPage.css';

function TeacherVideoSearchPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
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
      setSelectedVideo(null);
      setGeneratedQuizzes([]);
      
      // 통일 교육 관련 영상 검색
      const { success, data, error: searchError } = await searchUnificationVideos(searchQuery, 8);
      
      if (!success) {
        throw new Error(searchError || '검색 중 오류가 발생했습니다.');
      }
      
      if (data && data.length > 0) {
        setSearchResults(data);
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
  
  // 영상 선택 시 상세 정보 가져오기
  const handleSelectVideo = async (video) => {
    try {
      setError('');
      
      // 영상 상세 정보 가져오기
      const { success, data, error: videoError } = await getVideoDetails(video.id);
      
      if (!success) {
        throw new Error(videoError || '영상 정보를 가져오는 중 오류가 발생했습니다.');
      }
      
      setSelectedVideo({
        ...video,
        ...data
      });
      
      setGeneratedQuizzes([]);
    } catch (error) {
      console.error('영상 정보 가져오기 오류:', error);
      setError(error.message || '영상 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };
  
  // 퀴즈 생성
  const handleGenerateQuiz = async () => {
    if (!selectedVideo) {
      setError('퀴즈 생성을 위해 영상을 선택해주세요.');
      return;
    }
    
    try {
      setGeneratingQuiz(true);
      setError('');
      setGeneratedQuizzes([]);
      setSuccessMessage('');
      
      // 선택된 영상의 제목과 설명에서 퀴즈 생성
      const content = `${selectedVideo.title}\n\n${selectedVideo.description}`;
      const { success, data, error: quizError } = await generateQuizQuestions(content, 3, gradeLevel);
      
      if (!success) {
        throw new Error(quizError || '퀴즈 생성 중 오류가 발생했습니다.');
      }
      
      if (data && data.questions) {
        setGeneratedQuizzes(data.questions);
      } else {
        setError('퀴즈를 생성할 수 없습니다. 다른 영상을 선택해보세요.');
      }
    } catch (error) {
      console.error('퀴즈 생성 오류:', error);
      setError(error.message || '퀴즈 생성 중 오류가 발생했습니다.');
    } finally {
      setGeneratingQuiz(false);
    }
  };
  
  // 영상 및 퀴즈 저장
  const handleSaveContent = async () => {
    if (!selectedVideo || generatedQuizzes.length === 0) {
      setError('저장할 영상과 퀴즈가 없습니다.');
      return;
    }
    
    try {
      setError('');
      setSuccessMessage('');
      
      // 1. 먼저 영상 정보 저장
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .insert({
          title: selectedVideo.title,
          youtube_id: selectedVideo.id,
          description: selectedVideo.description,
          source: selectedVideo.channelTitle,
          grade_level: gradeLevel,
          thumbnail_url: selectedVideo.thumbnail
        })
        .select()
        .single();
      
      if (videoError) throw videoError;
      
      // 2. 연결된 퀴즈 저장
      const quizzesToInsert = generatedQuizzes.map(quiz => ({
        question: quiz.question,
        options: quiz.options,
        correct_answer: quiz.answer,
        video_id: videoData.id,
        difficulty: gradeLevel
      }));
      
      const { error: quizzesError } = await supabase
        .from('quizzes')
        .insert(quizzesToInsert);
      
      if (quizzesError) throw quizzesError;
      
      setSuccessMessage('영상과 퀴즈가 성공적으로 저장되었습니다!');
      
      // 폼 초기화
      setTimeout(() => {
        setSelectedVideo(null);
        setGeneratedQuizzes([]);
        setSearchResults([]);
        setSearchQuery('');
      }, 2000);
      
    } catch (error) {
      console.error('저장 오류:', error);
      setError(error.message || '영상 저장 중 오류가 발생했습니다.');
    }
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="container">
      <div className="teacher-video-search">
        <div className="page-header">
          <h1>유튜브 영상 검색 및 퀴즈 생성</h1>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/teacher')}
          >
            교사 대시보드로 돌아가기
          </button>
        </div>
        
        <p className="page-description">
          YouTube API를 활용하여 통일 교육 관련 영상을 검색하고, AI를 통해 자동으로 퀴즈를 생성합니다.
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
            <div className="video-results-grid">
              {searchResults.map((video) => (
                <div 
                  key={video.id} 
                  className={`video-result-item ${selectedVideo?.id === video.id ? 'selected' : ''}`}
                  onClick={() => handleSelectVideo(video)}
                >
                  <div className="video-thumbnail">
                    <img src={video.thumbnail} alt={video.title} />
                  </div>
                  <div className="video-info">
                    <h3>{video.title}</h3>
                    <p className="channel-name">{video.channelTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 선택된 영상 */}
        {selectedVideo && (
          <div className="selected-video">
            <h2>선택된 영상</h2>
            <div className="video-card">
              <div className="video-preview">
                <iframe
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${selectedVideo.id}`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              
              <div className="video-details">
                <h3>{selectedVideo.title}</h3>
                <p className="channel-name">{selectedVideo.channelTitle}</p>
                <p className="video-description">{selectedVideo.description}</p>
              </div>
              
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
                  {generatingQuiz ? '퀴즈 생성 중...' : '이 영상으로 퀴즈 생성'}
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
                영상과 퀴즈 저장하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherVideoSearchPage;