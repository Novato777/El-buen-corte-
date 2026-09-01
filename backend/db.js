import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde la carpeta del backend y fallback a root
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const { Pool } = pg;

const dbUrl = process.env.DATABASE_URL || '';
const isLocal = !dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

const pool = new Pool({
  connectionString: dbUrl || 'postgresql://postgres:The_carnita1122.@localhost:5432/postgres',
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
