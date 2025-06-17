import {
  pgTable,
  serial,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { surveys } from './surveys.ts';
import { users } from './users.ts';

export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  surveyId: integer('survey_id').notNull().references(() => surveys.id),
  userId: integer('user_id').references(() => users.id),
  submittedAt: timestamp('submitted_at').defaultNow(),
});
