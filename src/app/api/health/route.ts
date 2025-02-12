import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    
    // Simple query to check database connection and schema
    const result = await client.query(`
      SELECT 
        table_name, 
        column_name, 
        data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      LIMIT 5
    `);

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        sampleSchema: result.rows
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connected: false
      }
    }, { 
      status: 500 
    });
  } finally {
    if (client) client.release();
  }
} 