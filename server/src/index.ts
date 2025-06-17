import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server';
import authRouter from './routes/auth.ts';
import surveyRouter from './routes/survey.ts';
import { authMiddleware } from './middleware/index.ts';
import 'dotenv/config'

const app = new Hono();

// Health check
app.get('/', (c) => c.text('Survey App API'));

app.use(cors());
// Public auth routes
app.route('/auth', authRouter);

// Protected survey routes
app.use('/surveys/*', authMiddleware);
app.route('/surveys', surveyRouter);

// Start server on PORT env or 3000
const port = parseInt(process.env.PORT || '3000', 10);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Listening on http://localhost:${info.port}`);
});
