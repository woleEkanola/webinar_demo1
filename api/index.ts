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

let questions: Question[] = [];
let nextId = 1;

app.get('/api/questions', (_req, res) => {
  res.json(questions.sort((a, b) => b.votes - a.votes));
});

app.post('/api/questions', (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }
  const question: Question = { id: nextId++, text, votes: 0 };
  questions.push(question);
  res.status(201).json(question);
});

app.post('/api/questions/:id/upvote', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const question = questions.find((q) => q.id === id);
  if (!question) return res.status(404).json({ error: 'not found' });
  question.votes++;
  res.json(question);
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Local server running at http://localhost:${port}`);
  });
}

export default app;