import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').unique(),
  createdAt: timestamp('created_at').defaultNow()
});

export const rooms = pgTable('rooms', {
  id: text('id').primaryKey(),
  name: text('name').unique(),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').defaultNow()
});

export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  roomId: text('room_id'),
  username: text('username'),
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow()
});