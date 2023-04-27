import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { bookingSchema } from '@/schemas';
import bookingsController from '@/controllers/bookings-controller';

const bookingsRouter = Router();

bookingsRouter
  .all('/*', authenticateToken)
  .get('/', bookingsController.getBooking)
  .post('/', validateBody(bookingSchema), bookingsController.createBooking)
  .put('/:bookingId', bookingsController.changeBooking);

export { bookingsRouter };
