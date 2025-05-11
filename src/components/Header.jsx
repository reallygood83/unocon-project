import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/">
            <h1>Unicon<span className="logo-korean">(유니콘)</span></h1>
          </Link>
        </div>
        <nav className="nav">
          <ul className="nav-list">
            <li><Link to="/" className="nav-link">홈</Link></li>
            <li><Link to="/reading" className="nav-link">읽어보며 통일 알아보기</Link></li>
            <li><Link to="/video" className="nav-link">영상으로 통일 알아보기</Link></li>
            <li><Link to="/letter" className="nav-link">UN참전국 감사편지 보내기</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;