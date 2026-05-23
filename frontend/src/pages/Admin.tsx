import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: number;
  text: string;
}

export default function Admin() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token !== 'admin-session-token') {
      navigate('/login');
      return;
    }
    fetchQuestions();
  }, [navigate]);

  const fetchQuestions = async () => {
    const res = await fetch('/api/questions');
    const data = await res.json();
    setQuestions(data.questions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    const token = localStorage.getItem('adminToken');
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: trimmed }),
    });
    if (res.ok) {
      setInput('');
      fetchQuestions();
    } else {
      setError('Failed to create question');
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('adminToken');
    await fetch(`/api/questions/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    fetchQuestions();
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="New question…"
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add
        </button>
      </form>
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {questions.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No questions yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {questions.map((q) => (
            <li
              key={q.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="flex-1 text-gray-800 dark:text-slate-200">
                {q.text}
              </span>
              <button
                onClick={() => handleDelete(q.id)}
                className="ml-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}