import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { AIChatbot } from './components/AIChatbot';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { BooksPage } from './pages/BooksPage';
import { BookDetailPage } from './pages/BookDetailPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { RecordedClassesPage } from './pages/RecordedClassesPage';
import { LearningPlayerPage } from './pages/LearningPlayerPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AboutPage, ContactPage, NotFoundPage } from './pages/AboutContactNotFoundPages';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppShell() {
  const { toastMessage, authError } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#0B192C]">
      <ScrollToTop />
      <Navbar />
      <CartDrawer />

      {authError && (
        <div
          role="alert"
          className="bg-red-50 border-b border-red-200 px-4 py-2.5 text-center text-xs text-red-800"
        >
          Authentication Notice: {authError}
        </div>
      )}

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-5 z-50 px-4 py-2.5 rounded-xl bg-[#0B192C] text-[#FAF8F5] text-xs font-medium shadow-xl border border-[#C59B27]/40"
        >
          {toastMessage}
        </div>
      )}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:bookId" element={<BookDetailPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/recorded-classes" element={<RecordedClassesPage />} />
          <Route path="/learn/:courseId/:lessonId" element={<LearningPlayerPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/dashboard" element={<StudentDashboardPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <AIChatbot />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}
