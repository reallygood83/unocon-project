import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-content">
          <p className="copyright">© {currentYear} Unicon(유니콘) - 초등 통일 교육 플랫폼</p>
          <p className="footer-description">
            통일부 통일교육원의 자료를 활용한 초등학생 맞춤형 통일 교육 웹 플랫폼입니다.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;