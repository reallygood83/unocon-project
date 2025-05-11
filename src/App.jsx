import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ReadingPage from './pages/ReadingPage';
import VideoPage from './pages/VideoPage';
import LetterPage from './pages/LetterPage';
import TeacherPage from './pages/TeacherPage';
import TeacherQuizPage from './pages/TeacherQuizPage';
import TeacherQuizFormPage from './pages/TeacherQuizFormPage';
import TeacherReadingSearchPage from './pages/TeacherReadingSearchPage';
import TeacherVideoSearchPage from './pages/TeacherVideoSearchPage';
import TeacherVideoFormPage from './pages/TeacherVideoFormPage';
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
          <Route path="/teacher" element={<TeacherPage />} />
          <Route path="/teacher/quizzes" element={<TeacherQuizPage />} />
          <Route path="/teacher/quizzes/new" element={<TeacherQuizFormPage />} />
          <Route path="/teacher/quizzes/edit/:id" element={<TeacherQuizFormPage />} />
          <Route path="/teacher/reading/search" element={<TeacherReadingSearchPage />} />
          <Route path="/teacher/videos/search" element={<TeacherVideoSearchPage />} />
          <Route path="/teacher/videos/new" element={<TeacherVideoFormPage />} />
          <Route path="/teacher/videos/edit/:id" element={<TeacherVideoFormPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;