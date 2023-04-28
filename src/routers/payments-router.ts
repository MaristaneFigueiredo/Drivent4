import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import paymentsController from '@/controllers/payments-controller';
import { paymentsSchema } from '@/schemas';

const paymentsRouter = Router();

paymentsRouter
  .all('/*', authenticateToken)
  .get('/', paymentsController.getPayments)
  .post('/process', validateBody(paymentsSchema), paymentsController.createPayment);

export { paymentsRouter };
