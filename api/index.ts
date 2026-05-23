import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const ADMIN_PASSWORD = 'ad123min';
const ADMIN_TOKEN = 'admin-session-token';

interface Question {
  id: number;
  text: string;
  createdAt: Date;
}

interface Answer {
  id: number;
  questionId: number;
  text: string;
  votes: number;
  createdAt: Date;
}

let questions: Question[] = [];
let answers: Answer[] = [];
let nextQuestionId = 1;
let nextAnswerId = 1;

function checkAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

// --- PUBLIC ROUTES ---

app.get('/api/questions', (_req, res) => {
  res.json({
    questions: questions.map((q) => ({
      ...q,
      answerCount: answers.filter((a) => a.questionId === q.id).length,
    })),
  });
});

app.get('/api/questions/:id/answers', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const question = questions.find((q) => q.id === id);
  if (!question) return res.status(404).json({ error: 'question not found' });
  const questionAnswers = answers
    .filter((a) => a.questionId === id)
    .sort((a, b) => b.votes - a.votes);
  res.json({ question, answers: questionAnswers });
});

app.post('/api/questions/:id/answers', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const question = questions.find((q) => q.id === id);
  if (!question) return res.status(404).json({ error: 'question not found' });
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }
  const answer: Answer = { id: nextAnswerId++, questionId: id, text: text.trim(), votes: 0, createdAt: new Date() };
  answers.push(answer);
  res.status(201).json(answer);
});

app.post('/api/answers/:id/upvote', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const answer = answers.find((a) => a.id === id);
  if (!answer) return res.status(404).json({ error: 'not found' });
  answer.votes++;
  res.json(answer);
});

// --- ADMIN ROUTES ---

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: 'incorrect password' });
  }
});

app.post('/api/questions', checkAuth, (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }
  const question: Question = { id: nextQuestionId++, text: text.trim(), createdAt: new Date() };
  questions.push(question);
  res.status(201).json(question);
});

app.delete('/api/questions/:id', checkAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = questions.findIndex((q) => q.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  questions.splice(idx, 1);
  answers = answers.filter((a) => a.questionId !== id);
  res.json({ success: true });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Local server running at http://localhost:${port}`);
  });
}

export default app;