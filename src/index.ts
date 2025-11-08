import 'dotenv/config';
import express from 'express';
import citasRouter from './routes/citas.routes';
import database from './db/database';
import errorMiddleware from './middlewares/error.middleware';
import cors from 'cors';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cors());

app.get('/api/health', async (_req, res, next) => {
  try {
    await database.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

app.use('/api/citas', citasRouter);

app.use(errorMiddleware);

const startServer = async () => {
  try {
    await database.query('SELECT 1');
    app.listen(PORT, () => {
      console.log(`API lista en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos', error);
    process.exit(1);
  }
};

startServer();
