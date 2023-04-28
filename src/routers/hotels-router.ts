import { Router } from 'express';
import hotelsController from '../controllers/hotels-controller';
import { authenticateToken } from '@/middlewares';

const hotelsRouter = Router();

hotelsRouter.all('/*', authenticateToken).get('/', hotelsController.getAll).get('/:hotelId', hotelsController.getHotel);

export { hotelsRouter };
