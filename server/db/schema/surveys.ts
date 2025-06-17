import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const surveys = pgTable('surveys', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});
