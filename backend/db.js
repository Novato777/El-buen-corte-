import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Si la URL no tiene localhost, asumimos conexión en la nube (Neon) y requerimos SSL
const isLocal = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

// Probar conexión al arrancar el servidor
pool.query('SELECT NOW()')
  .then(() => {
    console.log('⚡ Conexión exitosa a la base de datos PostgreSQL.');
  })
  .catch(err => {
    console.error('❌ Error al conectar a PostgreSQL:', err.message);
  });

export default pool;
