import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { surveys } from './surveys.ts';

export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  surveyId: integer('survey_id').notNull().references(() => surveys.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  inputType: varchar('input_type', { length: 50 }).notNull(),
  position: integer('position').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
