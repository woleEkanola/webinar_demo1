import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

interface Answer {
  id: number;
  text: string;
  votes: number;
}

export default function WordCloud() {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<{ id: number; text: string } | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);

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

  const maxVotes = Math.max(...answers.map((a) => a.votes), 1);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-slate-900">
      {answers.length === 0 ? (
        <p className="text-2xl text-gray-400 dark:text-gray-600">
          No answers yet…
        </p>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
          {answers.map((a) => {
            const scale = a.votes / maxVotes;
            const size = 1.25 + scale * 3.5;
            const opacity = 0.35 + scale * 0.65;
            const weight = 400 + Math.round(scale * 500);
            return (
              <span
                key={a.id}
                className="inline-block leading-tight text-gray-800 transition-all duration-500 dark:text-white"
                style={{
                  fontSize: `${size}rem`,
                  fontWeight: weight,
                  opacity,
                }}
              >
                {a.text}
              </span>
            );
          })}
        </div>
      )}

      {question && (
        <div className="fixed bottom-6 right-6 max-w-xs rounded-xl bg-white/80 p-4 shadow-lg backdrop-blur-sm dark:bg-slate-800/80">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {question.text}
          </p>
        </div>
      )}
    </div>
  );
}