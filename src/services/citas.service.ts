import { QueryResultRow } from 'pg';
import database, { QueryParams } from '../db/database';
import { Cita, CreateCitaDTO } from '../models/cita.model';

export type { CreateCitaDTO };
export type Canal = CreateCitaDTO['canal'];

type Entity = 'cita';

interface EntityConfig {
  table: string;
  idColumn: string;
  orderBy?: string;
  insertableColumns: string[];
}

const ENTITY_CONFIG: Record<Entity, EntityConfig> = {
  cita: {
    table: 'citas',
    idColumn: 'id_cita',
    orderBy: 'ORDER BY fecha ASC, hora ASC',
    insertableColumns: [
      'id_paciente',
      'id_medico',
      'fecha',
      'hora',
      'canal',
      'estado',
    ],
  },
};

/**
 * findAll('cita') → devuelve todas las filas de la tabla citas con orden definido.
 */
export const findAll = async <T extends QueryResultRow>(
  entity: Entity,
): Promise<T[]> => {
  const { table, orderBy } = ENTITY_CONFIG[entity];
  const query = `SELECT * FROM ${table} ${orderBy ?? ''}`.trim();
  const result = await database.query<T>(query);
  return result.rows;
};

/**
 * findById('cita', id) → busca la fila por su columna primaria.
 */
export const findById = async <T extends QueryResultRow>(
  entity: Entity,
  id: number,
): Promise<T | null> => {
  const { table, idColumn } = ENTITY_CONFIG[entity];
  const query = `SELECT * FROM ${table} WHERE ${idColumn} = $1`;
  const result = await database.query<T>(query, [id]);
  return result.rowCount ? result.rows[0] : null;
};

/**
 * insert('cita', data) → arma dinámicamente el INSERT de acuerdo al payload recibido.
 */
export const insert = async <T extends QueryResultRow>(
  entity: Entity,
  data: Record<string, unknown>,
): Promise<T> => {
  const { table, insertableColumns } = ENTITY_CONFIG[entity];

  const columns: string[] = [];
  const values: QueryParams = [];

  insertableColumns.forEach((column) => {
    if (data[column] !== undefined) {
      columns.push(column);
      values.push(
        data[column] as string | number | boolean | null | Date,
      );
    }
  });

  if (columns.length === 0) {
    throw new Error('No hay campos válidos para insertar');
  }

  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
  const query = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await database.query<T>(query, values);
  return result.rows[0];
};

export const createCita = async (data: CreateCitaDTO): Promise<Cita> => {
  const payload = { ...data, estado: data.estado ?? 'PENDIENTE' };
  return insert<Cita>('cita', payload);
};

export const getCitas = async (): Promise<Cita[]> => {
  return findAll<Cita>('cita');
};

export const getCitaById = async (id: number): Promise<Cita | null> => {
  return findById<Cita>('cita', id);
};
