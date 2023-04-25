import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import bookingsController from '@/controllers/bookings-controller';

const bookingsRouter = Router();

bookingsRouter
  .all('/*', authenticateToken)
  .get('/', bookingsController.getBooking)
  .post('/', bookingsController.createBooking)
  .put('/:bookingId', bookingsController.changeBooking);

export { bookingsRouter };
