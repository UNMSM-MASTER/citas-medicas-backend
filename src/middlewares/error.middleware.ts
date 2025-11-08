import { ErrorRequestHandler } from 'express';
import { DatabaseError } from 'pg';

const PG_ERROR_MESSAGES: Record<string, string> = {
  '22P02': 'Formato de dato inválido para una de las columnas',
  '23505': 'Registro duplicado: ya existe una fila con los mismos datos únicos',
};

/**
 * Middleware global que captura errores de SQL/PG y los traduce a respuestas uniformes.
 */
const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if ((err as NodeJS.ErrnoException).code === 'ECONNREFUSED') {
    return res.status(503).json({
      message: 'La base de datos no está disponible en este momento',
    });
  }

  if (err instanceof DatabaseError) {
    const message =
      PG_ERROR_MESSAGES[err.code ?? ''] ?? 'Error al ejecutar la consulta SQL';
    return res.status(400).json({
      message,
      detail: err.detail,
    });
  }

  console.error(err);
  return res.status(500).json({ message: 'Error interno del servidor' });
};

export default errorMiddleware;
