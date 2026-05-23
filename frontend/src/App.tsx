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
  const [submissionOpen, setSubmissionOpen] = useState(true);
  const [total, setTotal] = useState(0);
  const [max, setMax] = useState(10);

  const fetchQuestions = useCallback(async () => {
    const res = await fetch('/api/questions');
    const data = await res.json();
    setQuestions(data.questions);
    setSubmissionOpen(data.submissionOpen);
    setTotal(data.total);
    setMax(data.max);
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
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: trimmed }),
    });
    if (res.ok) {
      setInput('');
      const data = await res.json();
      setQuestions(data.questions);
      setSubmissionOpen(data.submissionOpen);
      setTotal(data.total);
    }
  };

  const handleUpvote = async (id: number) => {
    const res = await fetch(`/api/questions/${id}/upvote`, { method: 'POST' });
    const data = await res.json();
    setQuestions(data.questions);
    setSubmissionOpen(data.submissionOpen);
    setTotal(data.total);
  };

  const maxVotes = Math.max(...questions.map((q) => q.votes), 1);

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
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-8 pt-16">
          {questions.length === 0 ? (
            <p className="text-3xl font-light text-slate-500">
              Awaiting opinions…
            </p>
          ) : (
            questions.map((q) => {
              const scale = q.votes / maxVotes;
              const size = 1.25 + scale * 3.5;
              const opacity = 0.4 + scale * 0.6;
              const weight = 400 + Math.round(scale * 500);
              return (
                <div
                  key={q.id}
                  className="w-full rounded-2xl bg-slate-800/40 p-8 text-center transition-all duration-500"
                >
                  <p
                    className="leading-tight text-white transition-all duration-500"
                    style={{
                      fontSize: `${size}rem`,
                      fontWeight: weight,
                      opacity,
                    }}
                  >
                    {q.text}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-600/20 px-4 py-1.5 text-lg font-semibold text-blue-300">
                    &#9650; {q.votes}
                  </span>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="mx-auto max-w-2xl">
          {submissionOpen ? (
            <form onSubmit={handleSubmit} className="mb-6 flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Submit your opinion anonymously…"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit
              </button>
            </form>
          ) : (
            <p className="mb-6 rounded-xl border border-green-700 bg-green-900/30 px-5 py-4 text-center text-lg font-semibold text-green-300">
              Voting is now open! &#x1F5F3;&#xFE0F;
            </p>
          )}
          <p className="mb-4 text-center text-sm text-slate-500">
            {total} / {max} opinions submitted
          </p>
          {questions.length === 0 ? (
            <p className="text-center text-slate-500">
              No opinions yet. Be the first to submit!
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