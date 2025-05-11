import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ReadingPage from './pages/ReadingPage';
import VideoPage from './pages/VideoPage';
import LetterPage from './pages/LetterPage';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reading" element={<ReadingPage />} />
          <Route path="/video" element={<VideoPage />} />
          <Route path="/letter" element={<LetterPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;