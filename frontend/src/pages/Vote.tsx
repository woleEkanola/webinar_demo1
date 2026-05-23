import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

interface Answer {
  id: number;
  text: string;
  votes: number;
}

const MAX_VOTES = 5;

export default function Vote() {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<{ id: number; text: string } | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [input, setInput] = useState('');
  const [votesUsed, setVotesUsed] = useState(0);

  const questionKey = `votes_q_${id}`;

  useEffect(() => {
    const used = parseInt(localStorage.getItem(questionKey) || '0', 10);
    setVotesUsed(used);
  }, [questionKey]);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/questions/${id}/answers`);
    const data = await res.json();
    setQuestion(data.question);
    setAnswers(data.answers);
  }, [id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    await fetch(`/api/questions/${id}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: trimmed }),
    });
    setInput('');
    fetchData();
  };

  const handleUpvote = async (answerId: number) => {
    if (votesUsed >= MAX_VOTES) return;
    await fetch(`/api/answers/${answerId}/upvote`, { method: 'POST' });
    const newCount = votesUsed + 1;
    localStorage.setItem(questionKey, String(newCount));
    setVotesUsed(newCount);
    fetchData();
  };

  const canVote = votesUsed < MAX_VOTES;

  return (
    <div className="mx-auto max-w-2xl">
      {question && (
        <h2 className="mb-2 text-2xl font-bold">{question.text}</h2>
      )}
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {votesUsed} / {MAX_VOTES} votes used
      </p>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add your answer…"
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Submit
        </button>
      </form>

      {answers.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No answers yet. Be the first!
        </p>
      ) : (
        <ul className="space-y-3">
          {answers.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 transition hover:border-gray-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <button
                onClick={() => handleUpvote(a.id)}
                disabled={!canVote}
                className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                  canVote
                    ? 'bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:text-slate-300'
                    : 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-slate-800/50 dark:text-slate-600'
                }`}
              >
                <span className="text-base leading-none">&#9650;</span>
                {a.votes}
              </button>
              <p className="flex-1 text-gray-800 dark:text-slate-200">{a.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}