import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const dbUrl = process.env.DATABASE_URL || '';
const isLocal = !dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

const pool = new Pool({
  connectionString: dbUrl || 'postgresql://postgres:postgres@localhost:5432/el_buen_corte',
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

// Probar conexión al arrancar el servidor
if (dbUrl) {
  pool.query('SELECT NOW()')
    .then(() => {
      console.log('⚡ Conexión exitosa a la base de datos PostgreSQL.');
    })
    .catch(err => {
      console.error('❌ Error al conectar a PostgreSQL:', err.message);
    });
} else {
  console.warn('⚠️ Advertencia: DATABASE_URL no está configurada en las variables de entorno.');
}

export default pool;
