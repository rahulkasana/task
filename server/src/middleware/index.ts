import {type Context, type Next } from 'hono';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Missing token' }, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    // attach userId to context for downstream handlers
    c.set('userId', payload.userId);
    await next();
  } catch (err) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};
