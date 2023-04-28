import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getTicketTypes, getAllUserTickets, createUserTicket } from '@/controllers';
import { createUserTicketSchema } from '@/schemas/tickets-schemas';

const ticketsRouter = Router();

ticketsRouter
  .all('/*', authenticateToken)
  .get('/types', getTicketTypes)
  .get('/', getAllUserTickets)
  .post('/', validateBody(createUserTicketSchema), createUserTicket);

export { ticketsRouter };
