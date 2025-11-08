import { Pool, PoolConfig } from 'pg';

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST,
  port: parseNumber(process.env.DB_PORT, 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
};

const pool = new Pool(poolConfig);

console.info(
  `[DB] Pool configurado hacia ${poolConfig.host}:${poolConfig.port}/${poolConfig.database}`,
);

pool.on('error', (err) => {
  console.error('[DB] Error inesperado en el pool de PostgreSQL', err);
});

export default pool;
