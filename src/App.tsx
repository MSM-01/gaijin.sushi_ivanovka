import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import Splash from './components/Splash';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import ReceiptPage from './pages/ReceiptPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const [ready, setReady] = useState(false);
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  // Прокрутка вверх при переходе на другую страницу (кроме якорей главной).
  useEffect(() => {
    if (location.pathname !== '/') window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Splash visible={!ready} />
      <div className="flex min-h-screen flex-col">
        {!isAdminPage && <Header />}
        <main key={location.pathname} className="page-enter mx-auto w-full max-w-6xl flex-1">
          <Routes>
            <Route path="/" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/receipt" element={<ReceiptPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        {!isAdminPage && <Footer />}
      </div>
      <Toast />
    </>
  );
}
