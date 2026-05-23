import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

interface Question {
  id: number;
  text: string;
  votes: number;
}

const MAX_OPINIONS = 10;
let questions: Question[] = [];
let nextId = 1;

app.get('/api/questions', (_req, res) => {
  const sorted = [...questions].sort((a, b) => b.votes - a.votes);
  res.json({
    questions: sorted,
    submissionOpen: questions.length < MAX_OPINIONS,
    total: questions.length,
    max: MAX_OPINIONS,
  });
});

app.post('/api/questions', (req, res) => {
  if (questions.length >= MAX_OPINIONS) {
    return res.status(409).json({ error: 'Submission cap reached' });
  }
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }
  const question: Question = { id: nextId++, text: text.trim(), votes: 0 };
  questions.push(question);
  const sorted = [...questions].sort((a, b) => b.votes - a.votes);
  res.status(201).json({
    question,
    questions: sorted,
    submissionOpen: questions.length < MAX_OPINIONS,
    total: questions.length,
    max: MAX_OPINIONS,
  });
});

app.post('/api/questions/:id/upvote', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const question = questions.find((q) => q.id === id);
  if (!question) return res.status(404).json({ error: 'not found' });
  question.votes++;
  const sorted = [...questions].sort((a, b) => b.votes - a.votes);
  res.json({
    question,
    questions: sorted,
    submissionOpen: questions.length < MAX_OPINIONS,
    total: questions.length,
    max: MAX_OPINIONS,
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Local server running at http://localhost:${port}`);
  });
}

export default app;