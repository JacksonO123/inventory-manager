import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const messageTable = pgTable('message_table', {
  id: serial('id').primaryKey(),
  message: text('message').notNull()
});
