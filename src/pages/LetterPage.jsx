import { useState, useEffect } from 'react';
import './LetterPage.css';

function LetterPage() {
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [letterContent, setLetterContent] = useState('');
  
  useEffect(() => {
    // This will be replaced with actual data fetch
    setCountries([
      {
        id: 1,
        name: '미국',
        flag: '🇺🇸',
        contribution: '한국전쟁에 가장 많은 병력(약 180만 명)을 파견했으며, 사망자 36,574명, 부상자 103,284명, 포로 및 실종자 8,177명이 발생했습니다.',
        currentRelation: '현재 한미동맹은 한반도와 동북아시아의 평화와 안보를 유지하는 핵심 축으로 기능하고 있습니다.'
      },
      {
        id: 2,
        name: '영국',
        flag: '🇬🇧',
        contribution: '한국전쟁에 약 14,000명의 병력을 파견했으며, 사망자 1,078명, 부상자 2,674명, 포로 및 실종자 179명이 발생했습니다.',
        currentRelation: '영국은 유럽에서 한국의 중요한 경제 및 문화 교류 파트너입니다.'
      },
      {
        id: 3,
        name: '터키',
        flag: '🇹🇷',
        contribution: '한국전쟁에 약 15,000명의 병력을 파견했으며, 사망자 721명, 부상자 2,111명, 포로 및 실종자 168명이 발생했습니다.',
        currentRelation: '터키와 한국은 "피로 맺어진 형제국"이라는 특별한 관계를 가지고 있습니다.'
      }
    ]);
  }, []);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
  };

  const handleLetterChange = (e) => {
    setLetterContent(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('편지가 저장되었습니다!');
    setLetterContent('');
    setSelectedCountry(null);
  };

  return (
    <div className="container">
      <section className="letter-intro">
        <h1>UN참전국 감사편지 보내기</h1>
        <p>한국전쟁에 참전한 UN국가들에게 감사 편지를 써보세요.</p>
      </section>

      {loading ? (
        <div className="loading">
          <p>콘텐츠를 불러오는 중입니다...</p>
        </div>
      ) : (
        <div className="letter-section">
          <div className="countries-list">
            <h2>참전국 목록</h2>
            <div className="countries">
              {countries.map(country => (
                <div 
                  key={country.id} 
                  className={`country-card ${selectedCountry?.id === country.id ? 'selected' : ''}`}
                  onClick={() => handleCountrySelect(country)}
                >
                  <div className="country-flag">{country.flag}</div>
                  <h3>{country.name}</h3>
                </div>
              ))}
            </div>
          </div>

          {selectedCountry && (
            <div className="country-info">
              <h2>{selectedCountry.name} {selectedCountry.flag}</h2>
              <div className="info-section">
                <h3>전쟁 기여</h3>
                <p>{selectedCountry.contribution}</p>
              </div>
              <div className="info-section">
                <h3>현재 관계</h3>
                <p>{selectedCountry.currentRelation}</p>
              </div>
            </div>
          )}

          {selectedCountry && (
            <form className="letter-form" onSubmit={handleSubmit}>
              <h2>{selectedCountry.name}에 보내는 감사 편지</h2>
              <div className="form-group">
                <label htmlFor="letter-content">편지 내용:</label>
                <textarea 
                  id="letter-content"
                  value={letterContent}
                  onChange={handleLetterChange}
                  rows="10"
                  placeholder={`${selectedCountry.name}에 감사의 마음을 전해보세요...`}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">편지 저장하기</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default LetterPage;