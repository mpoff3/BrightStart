import { Pool } from 'pg';

let pool: Pool | null = null;

export function getClient() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return pool;
} 