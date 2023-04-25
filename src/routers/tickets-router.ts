import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getTicketsType, createTiket, getTiketsByUser } from '@/controllers';
import { createUserTicketSchema } from '@/schemas/tickets-schemas';

//import { getTicketsType } from '@/controllers/tickets-controller';

const ticketsRouter = Router();

ticketsRouter.all('/*', authenticateToken).get('/types', getTicketsType);
ticketsRouter.post('/', validateBody(createUserTicketSchema), createTiket);
ticketsRouter.get('/', getTiketsByUser);
export { ticketsRouter };
