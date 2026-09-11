import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const results: Record<string, string> = {};

  // Test 1: import @libsql/client
  try {
    const { createClient } = await import('@libsql/client');
    results.libsql_import = '✅ ok';

    // Test 2: create client
    const url = process.env.TURSO_DATABASE_URL || '';
    const authToken = process.env.TURSO_AUTH_TOKEN || '';
    if (url && authToken) {
      try {
        const db = createClient({ url, authToken });
        results.libsql_create = '✅ ok';

        // Test 3: execute query
        try {
          const r = await db.execute('SELECT 1 as test');
          results.libsql_query = `✅ ok — ${JSON.stringify(r.rows[0])}`;
        } catch (e: any) {
          results.libsql_query = `❌ ${e.message}`;
        }
      } catch (e: any) {
        results.libsql_create = `❌ ${e.message}`;
      }
    } else {
      results.libsql_create = '❌ vars em falta';
    }
  } catch (e: any) {
    results.libsql_import = `❌ ${e.message}`;
  }

  // Test 4: import bcryptjs
  try {
    await import('bcryptjs');
    results.bcryptjs_import = '✅ ok';
  } catch (e: any) {
    results.bcryptjs_import = `❌ ${e.message}`;
  }

  // Test 5: import jsonwebtoken
  try {
    await import('jsonwebtoken');
    results.jsonwebtoken_import = '✅ ok';
  } catch (e: any) {
    results.jsonwebtoken_import = `❌ ${e.message}`;
  }

  // Test 6: import lib/db (shared module)
  try {
    const { getDb } = await import('../lib/db.js');
    results.lib_db_import = '✅ ok';
    try {
      const db = getDb();
      results.lib_db_getDb = '✅ ok';
      const r = await db.execute('SELECT COUNT(*) as c FROM products');
      results.lib_db_query = `✅ ok — ${r.rows[0]?.c} products`;
    } catch (e: any) {
      results.lib_db_getDb = `❌ ${e.message}`;
    }
  } catch (e: any) {
    results.lib_db_import = `❌ ${e.message}`;
  }

  res.status(200).json({ results });
}
