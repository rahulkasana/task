import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { submissions } from './submissions.ts';
import { questions } from './questions.ts';

export const answers = pgTable('answers', {
  id: serial('id').primaryKey(),
  submissionId: integer('submission_id')
    .notNull()
    .references(() => submissions.id),
  questionId: integer('question_id')
    .notNull()
    .references(() => questions.id),
  answerText: text('answer_text'),
  createdAt: timestamp('created_at').defaultNow(),
});
