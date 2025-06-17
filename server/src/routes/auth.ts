import {type Context, Hono} from 'hono';
import { db } from '../../db/index.ts';
import { users } from '../../db/schema/users.ts';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config'

const app = new Hono();

const JWT_SECRET = process.env.JWT_SECRET!;

app.post('/signup', async (c) => {
  const { email, password } = await c.req.json();

  // Prevent duplicate emails
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length) {
    return c.json({ error: 'Email already in use' }, 400);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Insert user and get new id
  const [inserted] = await db
    .insert(users)
    .values({ email, passwordHash })
    .returning({ id: users.id, email: users.email });

  // Sign JWT for new user
  const token = jwt.sign({ userId: inserted.id }, JWT_SECRET, { expiresIn: '7d' });

  return c.json(
    { id: inserted.id, email: inserted.email, token },
    201
  );
});

app.post('/login', async (c) => {
  const { email, password } = await c.req.json();

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 400);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 400);
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  return c.json({ token });
});

app.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Missing token' }, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, payload.userId));

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ id: user.id, email: user.email });
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
});


export default app;
