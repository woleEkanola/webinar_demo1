import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Question {
  id: number;
  text: string;
  answerCount: number;
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetch('/api/questions')
      .then((r) => r.json())
      .then((data) => setQuestions(data.questions))
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-6 text-2xl font-bold">Questions</h2>
      {questions.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No questions yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {questions.map((q) => (
            <div
              key={q.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="mb-3 text-lg font-medium">{q.text}</p>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {q.answerCount} answer{q.answerCount !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-3">
                <Link
                  to={`/question/${q.id}/vote`}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Vote
                </Link>
                <Link
                  to={`/question/${q.id}/cloud`}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold transition hover:bg-gray-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Word Cloud
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}