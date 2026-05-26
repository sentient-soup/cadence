import { Router } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { signToken } from '../auth';
import crypto from 'crypto';

const router = Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }
  if (username.length < 2 || password.length < 6) {
    res.status(400).json({ error: 'Username ≥ 2 chars, password ≥ 6 chars' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    res.status(409).json({ error: 'Username already taken' });
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  const id = crypto.randomUUID();
  const now = Date.now();

  db.prepare('INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)').run(id, username, hash, now);
  db.prepare('INSERT INTO app_settings (user_id, updated_at) VALUES (?, ?)').run(id, now);

  res.json({ token: signToken({ userId: id, username }), username });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  const user = db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username) as
    | { id: string; username: string; password_hash: string }
    | undefined;

  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  res.json({ token: signToken({ userId: user.id, username: user.username }), username: user.username });
});

export default router;
