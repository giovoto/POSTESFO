import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// ⚠️ NUCLEAR FIX: Desactivar verificación estricta de SSL globalmente para este proceso
// Esto soluciona el error "self-signed certificate" en Supabase/Vercel
if (process.env.NODE_ENV === 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { Pool } = pg;

// Configuración de la conexión a PostgreSQL
// Priorizar POSTGRES_URL (Supabase Pooled)
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString, // Use full string, Supabase might need params
  ssl: true, // Try simple 'true' first, or object
  ssl: { rejectUnauthorized: false }, // Security risk allowed for managed DBs without proper CA setup
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

// Verificar conexión
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en PostgreSQL:', err);
  // process.exit(-1); // ⚠️ NO salir en Serverless, deja que el request maneje el error
});

// Función helper para ejecutar queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query ejecutada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error en query:', error);
    throw error;
  }
};

export default pool;
