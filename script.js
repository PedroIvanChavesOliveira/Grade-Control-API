import express from 'express';
import gradesRoutes from './routes/grades.js';
import { promises as fs } from 'fs';
import winston from 'winston';

const app = express();
const { timestamp, printf, label, combine } = winston.format;
const myFormat = printf(({ timestamp, label, message, level }) => {
  return `${timestamp} [${label}] ${level}: ${message} `;
});
global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'grades-control-api.log' }),
  ],
  format: combine(
    label({ label: 'grades-control-api' }),
    timestamp(),
    myFormat
  ),
});

app.use(express.json());
app.use('/grades', gradesRoutes);

app.listen(3000, async () => {
  try {
    await fs.readFile('./grades.json');
    global.logger.info('API Started!');
  } catch (err) {
    global.logger.error(err);
  }
});
