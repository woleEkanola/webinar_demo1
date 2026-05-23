import { useState, useEffect, useCallback } from 'react';

interface Question {
  id: number;
  text: string;
  votes: number;
}

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [input, setInput] = useState('');
  const [presenterView, setPresenterView] = useState(false);

  const fetchQuestions = useCallback(async () => {
    const res = await fetch('/api/questions');
    const data: Question[] = await res.json();
    setQuestions(data);
  }, []);

  useEffect(() => {
    fetchQuestions();
    const interval = setInterval(fetchQuestions, 2000);
    return () => clearInterval(interval);
  }, [fetchQuestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: trimmed }),
    });
    setInput('');
    fetchQuestions();
  };

  const handleUpvote = async (id: number) => {
    await fetch(`/api/questions/${id}/upvote`, { method: 'POST' });
    fetchQuestions();
  };

  const top3 = questions.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6">
      <header className="mx-auto mb-8 flex max-w-3xl items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Live Audience Q&A
        </h1>
        <button
          onClick={() => setPresenterView((v) => !v)}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            presenterView
              ? 'bg-rose-600 text-white hover:bg-rose-500'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          }`}
        >
          {presenterView ? 'Exit Presenter View' : 'Presenter View'}
        </button>
      </header>

      {presenterView ? (
        /* ---------- PRESENTER VIEW ---------- */
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-10 pt-20">
          {top3.length === 0 ? (
            <p className="text-4xl font-light text-slate-500">
              No questions yet…
            </p>
          ) : (
            top3.map((q) => (
              <div
                key={q.id}
                className="w-full rounded-2xl bg-slate-800/60 p-10 text-center"
              >
                <p className="text-5xl font-extrabold leading-tight text-white">
                  {q.text}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600/30 px-6 py-2 text-2xl font-semibold text-blue-300">
                  &#9650; {q.votes}
                </span>
              </div>
            ))
          )}
        </div>
      ) : (
        /* ---------- NORMAL VIEW ---------- */
        <div className="mx-auto max-w-2xl">
          {/* Input form */}
          <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Submit your question or response anonymously..."
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </form>

          {/* Question list */}
          {questions.length === 0 ? (
            <p className="text-center text-slate-500">
              No questions yet. Be the first to submit!
            </p>
          ) : (
            <ul className="space-y-3">
              {questions.map((q) => (
                <li
                  key={q.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 px-5 py-4 transition hover:border-slate-700"
                >
                  <button
                    onClick={() => handleUpvote(q.id)}
                    className="flex shrink-0 flex-col items-center gap-0.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-blue-600 hover:text-white"
                  >
                    <span className="text-base leading-none">&#9650;</span>
                    {q.votes}
                  </button>
                  <p className="flex-1 text-slate-200">{q.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default App;