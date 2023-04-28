import httpStatus from 'http-status';
import { Response } from 'express';
import bookingsService from '@/services/bookings-service';
import { AuthenticatedRequest } from '@/middlewares';

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const roomId = Number(req.body.roomId);
    const { userId }: { userId: number } = req;
    const booking = await bookingsService.createBooking(roomId, userId);
    const id = booking.id;

    return res.status(httpStatus.OK).send({ bookingId: id });
  } catch (error) {
    switch (error.name) {
      case 'notFoundError':
        return res.sendStatus(httpStatus.NOT_FOUND);
      case 'Forbidden':
        return res.sendStatus(httpStatus.FORBIDDEN);
      default:
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId }: { userId: number } = req;
    const booking = await bookingsService.getBooking(userId);

    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    switch (error.name) {
      // case 'Forbidden':
      //   return res.sendStatus(httpStatus.FORBIDDEN);
      case 'notFoundError':
        return res.sendStatus(httpStatus.NOT_FOUND);
      default:
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId }: { userId: number } = req;
    const bookingId = Number(req.params.bookingId);
    const roomId = Number(req.body.roomId);
    const booking = await bookingsService.updateBooking(bookingId, roomId, userId);
    const id = booking.id;

    return res.status(httpStatus.OK).send({ bookingId: id });
  } catch (error) {
    switch (error.name) {
      case 'notFoundError':
        return res.sendStatus(httpStatus.NOT_FOUND);
      case 'Forbidden':
        return res.sendStatus(httpStatus.FORBIDDEN);
      default:
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export default {
  createBooking,
  getBooking,
  updateBooking,
};
