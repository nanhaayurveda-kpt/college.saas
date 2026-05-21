import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema'; // schema.js को इम्पोर्ट करना अनिवार्य है

// Turso Database कनेक्शन सेटअप
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Drizzle ORM को एक्सपोर्ट करें ताकि आप db.select() आदि कर सकें
export const db = drizzle(client, { schema });