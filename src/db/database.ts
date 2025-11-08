import { PoolClient, QueryResult, QueryResultRow } from 'pg';
import pool from './pool';

export type QueryParams = Array<string | number | boolean | null | Date>;

/**
 * Database centraliza el acceso al pool de PostgreSQL y expone utilidades
 * para ejecutar consultas y manejar transacciones con logs consistentes.
 */
class Database {
  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: QueryParams,
  ): Promise<QueryResult<T>> {
    try {
      return await pool.query<T>(text, params);
    } catch (error) {
      this.logError('query', error);
      throw error;
    }
  }

  async beginTransaction(): Promise<PoolClient> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      return client;
    } catch (error) {
      client.release();
      this.logError('BEGIN', error);
      throw error;
    }
  }

  async commit(client: PoolClient): Promise<void> {
    try {
      await client.query('COMMIT');
    } catch (error) {
      this.logError('COMMIT', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async rollback(client: PoolClient): Promise<void> {
    try {
      await client.query('ROLLBACK');
    } catch (error) {
      this.logError('ROLLBACK', error);
      throw error;
    } finally {
      client.release();
    }
  }

  private logError(context: string, error: unknown) {
    console.error(`[DB] Error durante ${context}`, error);
  }
}

const database = new Database();

export default database;
