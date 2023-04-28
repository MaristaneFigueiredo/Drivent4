import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { bookingSchema } from '@/schemas';
import bookingsController from '@/controllers/bookings-controller';
// import paymentsController from '@/controllers/payments-controller';
// import { paymentsSchema } from '@/schemas';

const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .post('/', validateBody(bookingSchema), bookingsController.createBooking)
  .put('/:bookingId', bookingsController.updateBooking)
  .get('/', bookingsController.getBooking);

export { bookingRouter };
