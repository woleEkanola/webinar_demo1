import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Vote from './pages/Vote';
import WordCloud from './pages/WordCloud';
import Login from './pages/Login';
import Admin from './pages/Admin';

function ThemeToggle() {
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="rounded-full p-2 transition hover:bg-slate-700 dark:hover:bg-slate-700 hover:bg-gray-200"
      aria-label="Toggle theme"
    >
      {dark ? (
        <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-slate-950 dark:text-white transition-colors duration-300">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-bold tracking-tight">
          Crowd Q&A
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition">
            Admin
          </Link>
          <ThemeToggle />
        </div>
      </nav>
      <main className="px-4 pb-12">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/question/:id/vote" element={<Vote />} />
          <Route path="/question/:id/cloud" element={<WordCloud />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;