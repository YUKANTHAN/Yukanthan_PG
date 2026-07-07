import 'dotenv/config';
import express from 'express';
import handler from './api/chat.js';

const app = express();
const PORT = 3001;

app.use(express.json());

app.post('/api/chat', (req, res) => {
  handler(req, res);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
