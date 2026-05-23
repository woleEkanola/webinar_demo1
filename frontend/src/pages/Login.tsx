import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('adminToken', data.token);
      navigate('/admin');
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h2 className="mb-6 text-2xl font-bold">Admin Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
        >
          Login
        </button>
      </form>
    </div>
  );
}