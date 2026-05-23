import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express API deployed on Vercel!' });
});

// Only listen locally. Vercel will wrap the exported app.
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Local server running at http://localhost:${port}`);
  });
}

// CRUCIAL: Export the app for Vercel serverless function wrapper
export default app;