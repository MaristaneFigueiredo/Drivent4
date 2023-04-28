import httpStatus from 'http-status';
import { Response } from 'express';
import hotelsService from '@/services/hotels-service';
import { AuthenticatedRequest } from '@/middlewares';

export async function getAll(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = Number(req.userId);
    const hotels = await hotelsService.getAll(userId);

    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    switch (error.name) {
      case 'notFoundError':
        return res.sendStatus(httpStatus.NOT_FOUND);
      case 'paymentNotFound':
        return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
      default:
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export async function getHotel(req: AuthenticatedRequest, res: Response) {
  try {
    const hotelId = Number(req.params.hotelId);
    const userId = Number(req.userId);
    const hotels = await hotelsService.getHotelById(hotelId, userId);

    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    switch (error.name) {
      case 'notFoundError':
        return res.sendStatus(httpStatus.NOT_FOUND);
      case 'paymentNotFound':
        return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
      default:
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export default {
  getHotel,
  getAll,
};
