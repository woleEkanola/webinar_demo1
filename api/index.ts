import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const ADMIN_PASSWORD = 'ad123min';
const ADMIN_TOKEN = 'admin-session-token';

let prisma: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

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
    const db = getPrisma();
    const questions = await db.question.findMany({
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
    console.error('DB error:', err);
    res.status(500).json({ error: 'database error' });
  }
});

app.get('/api/questions/:id/answers', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const db = getPrisma();
    const question = await db.question.findUnique({ where: { id } });
    if (!question) return res.status(404).json({ error: 'question not found' });
    const questionAnswers = await db.answer.findMany({
      where: { questionId: id },
      orderBy: { votes: 'desc' },
    });
    res.json({ question, answers: questionAnswers });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'database error' });
  }
});

app.post('/api/questions/:id/answers', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const db = getPrisma();
    const question = await db.question.findUnique({ where: { id } });
    if (!question) return res.status(404).json({ error: 'question not found' });
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }
    const answer = await db.answer.create({
      data: { questionId: id, text: text.trim(), votes: 0 },
    });
    res.status(201).json(answer);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'database error' });
  }
});

app.post('/api/answers/:id/upvote', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const db = getPrisma();
    const answer = await db.answer.findUnique({ where: { id } });
    if (!answer) return res.status(404).json({ error: 'not found' });
    const updated = await db.answer.update({
      where: { id },
      data: { votes: { increment: 1 } },
    });
    res.json(updated);
  } catch (err) {
    console.error('DB error:', err);
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
    const db = getPrisma();
    const question = await db.question.create({
      data: { text: text.trim() },
    });
    res.status(201).json(question);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'database error' });
  }
});

app.delete('/api/questions/:id', checkAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const db = getPrisma();
    const existing = await db.question.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'not found' });
    await db.question.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'database error' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Local server running at http://localhost:${port}`);
  });
}

export default app;