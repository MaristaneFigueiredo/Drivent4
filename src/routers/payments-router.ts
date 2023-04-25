import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import paymentsController from '@/controllers/payments-controller';
//import { createUserTicketSchema } from '@/schemas/tickets-schemas';

const paymentsRouter = Router();


paymentsRouter
  .all('/*', authenticateToken)
  .get('/', paymentsController.getPaymentsProcess)
  .post('/process', paymentsController.createPaymentProcess);

export { paymentsRouter };

