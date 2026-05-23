import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const ADMIN_PASSWORD = 'ad123min';
const ADMIN_TOKEN = 'admin-session-token';

function checkAuth(_req: express.Request, res: express.Response, next: express.NextFunction) {
  const auth = _req.headers.authorization;
  if (auth !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

// --- PUBLIC ROUTES ---

app.get('/api/questions', async (_req, res) => {
  try {
    const questions = await prisma.question.findMany({
      include: { _count: { select: { answers: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text,
        createdAt: q.createdAt,
        answerCount: q._count.answers,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: 'database error' });
  }
});

app.get('/api/questions/:id/answers', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) return res.status(404).json({ error: 'question not found' });
    const questionAnswers = await prisma.answer.findMany({
      where: { questionId: id },
      orderBy: { votes: 'desc' },
    });
    res.json({ question, answers: questionAnswers });
  } catch (err) {
    res.status(500).json({ error: 'database error' });
  }
});

app.post('/api/questions/:id/answers', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) return res.status(404).json({ error: 'question not found' });
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }
    const answer = await prisma.answer.create({
      data: { questionId: id, text: text.trim(), votes: 0 },
    });
    res.status(201).json(answer);
  } catch (err) {
    res.status(500).json({ error: 'database error' });
  }
});

app.post('/api/answers/:id/upvote', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const answer = await prisma.answer.findUnique({ where: { id } });
    if (!answer) return res.status(404).json({ error: 'not found' });
    const updated = await prisma.answer.update({
      where: { id },
      data: { votes: { increment: 1 } },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'database error' });
  }
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

app.post('/api/questions', checkAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }
    const question = await prisma.question.create({
      data: { text: text.trim() },
    });
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: 'database error' });
  }
});

app.delete('/api/questions/:id', checkAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'not found' });
    await prisma.question.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'database error' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Local server running at http://localhost:${port}`);
  });
}

export default app;