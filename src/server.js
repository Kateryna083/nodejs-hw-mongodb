import express from 'express';
import cors from 'cors';
import pino from 'pino-http';

import { env } from './utils/env.js';
import * as contactServicer from './services/contacts.js';

export const setupServer = () => {
  const app = express();

  app.use(cors());
  const logger = pino({
    transport: {
      target: 'pino-pretty',
    },
  });
  app.use(logger);

  app.get('/contacts', async (req, res) => {
    const data = await contactServicer.getContacts;

    res.json({
      status: 200,
      message: 'Successfully found contacts!',
      data,
    });
  });

  app.get('/contacts/:id', async (req, res) => {
    const { id } = req.params;
    const data = await contactServicer.getContactById(id);

    if (!data) {
      res.status(404).json({
        message: 'Contact not found',
      });
    }
    res.json({
      status: 200,
      message: `Successfully found contact with id ${id}!`,
      data,
    });
  });

  app.use((req, res) => {
    res.status(404).json({
      message: `${req.url} not found`,
    });
  });

  app.use((error, req, res, next) => {
    res.status(500).json({
      message: error.message,
    });
  });

  const port = Number(env('PORT', 3000));

  app.listen(port, () => console.log(`Server running on ${port} PORT`));
};
