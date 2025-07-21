import {type Context, Hono} from 'hono';
import { db } from '../../db/index.ts';
import { surveys } from '../../db/schema/surveys.ts';
import { questions } from '../../db/schema/questions.ts';
import { submissions } from '../../db/schema/submissions.ts';
import { answers } from '../../db/schema/answers.ts';
import { eq, asc , and} from 'drizzle-orm';

const app = new Hono();

// List all surveys
app.get('/', async (c) => {
  const list = await db.select().from(surveys);
  return c.json(list);
});

// Create a new survey with questions
app.post('/', async (c) => {
  const { title, description, questions: qs } = await c.req.json() as {
    title: string;
    description?: string;
    questions: {
      title: string;
      description?: string;
      inputType: string;
      position: number;
    }[];
  };
  // Insert survey
  const [surveyRow] = await db
    .insert(surveys)
    .values({ title, description })
    .returning({ id: surveys.id });

  const surveyId = surveyRow.id;
  // Insert questions
  await Promise.all(
    qs.map((q) =>
      db.insert(questions).values({
        surveyId,
        title: q.title,
        description: q.description,
        inputType: q.inputType,
        position: q.position,
      })
    )
  );
  return c.json({ id: surveyId }, 201);
});

// Get a single survey with questions
app.get('/:surveyId', async (c) => {
  const surveyId = Number(c.req.param('surveyId'));
  const [survey] = await db
    .select()
    .from(surveys)
    .where(eq(surveys.id, surveyId));
  if (!survey) {
    return c.json({ error: 'Survey not found' }, 404);
  }

  const qs = await db
    .select()
    .from(questions)
    .where(eq(questions.surveyId, surveyId))
    .orderBy(asc(questions.position));

  return c.json({ ...survey, questions: qs });
});

// Submit answers for a survey
app.post('/:surveyId/submissions', async (c: Context) => {
  const surveyId = Number(c.req.param('surveyId'));
  const { answers: submitted } = (await c.req.json()) as {
    answers: { questionId: number; answerText: string }[];
  };
  const userId = c.get('userId');

  // Insert submission
  const [inserted] = await db
    .insert(submissions)
    .values({ surveyId, userId })
    .returning({ id: submissions.id });
  const submissionId = inserted.id;

  // Insert answers
  await Promise.all(
    submitted.map((a) =>
      db.insert(answers).values({
        submissionId,
        questionId: a.questionId,
        answerText: a.answerText,
      })
    )
  );

  return c.json({ submissionId }, 201);
});

// Get a user's submission answers
app.get('/:surveyId/submissions/:submissionId', async (c: Context) => {
  const submissionId = Number(c.req.param('submissionId'));
  const userId = c.get('userId') as number;

  // Verify ownership
  const subs = await db
    .select()
    .from(submissions)
    .where(and(eq(submissions.id, submissionId), eq(submissions.userId, userId)));
  if (subs.length === 0) {
    return c.json({ error: 'Submission not found' }, 404);
  }

  const userAnswers = await db
    .select()
    .from(answers)
    .where(eq(answers.submissionId, submissionId));

  return c.json(userAnswers);
});

export default app;
