import { Response } from 'express';
import httpStatus from 'http-status';
//import { Hotel } from '@prisma/client';
import { AuthenticatedRequest } from '@/middlewares';
import bookingsService from '@/services/bookings-service';

async function getBooking(req: AuthenticatedRequest, res: Response) {
  //const userId = Number(req.userId);
  //   try {
  //     const hotels = await hotelsService.getHotels(userId);
  //     return res.status(httpStatus.OK).send(hotels);
  //   } catch (error) {
  //     switch (error.name) {
  //       case 'notFoundError':
  //         return res.sendStatus(httpStatus.NOT_FOUND);
  //       case 'paymentNotFound':
  //         return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
  //       case 'unauthorizedError':
  //           return res.sendStatus(httpStatus.UNAUTHORIZED);
  //       default:
  //         return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  //     }
  //   }
}

// Fazer uma reserva
async function createBooking(req: AuthenticatedRequest, res: Response) {
  const userId = Number(req.userId);

  const roomId = Number(req.body.roomId);

  try {
    const booking = await bookingsService.createBooking(userId, roomId);

    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    switch (error.name) {
      case 'notFoundError':
        return res.sendStatus(httpStatus.NOT_FOUND);
      case 'paymentNotFound':
        return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
      case 'unauthorizedError':
        return res.sendStatus(httpStatus.UNAUTHORIZED);
      case 'forbiddenError':
        return res.sendStatus(httpStatus.FORBIDDEN);
      default:
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

async function changeBooking(req: AuthenticatedRequest, res: Response) {
  //   const userId = Number(req.userId);
  //   const hotelId = Number(req.params.hotelId);
  //   try {
  //     const roomsHotels = await hotelsService.getRoomsHotel(userId, hotelId);
  //     //console.log('Try do controller antes do res roomsHotels - hotelId', roomsHotels)
  //     return res.status(httpStatus.OK).send(roomsHotels);
  //   } catch (error) {
  //     //console.log('error.name', error.name)
  //     switch (error.name) {
  //       case 'notFoundError':
  //         return res.sendStatus(httpStatus.NOT_FOUND);
  //       case 'paymentNotFound':
  //         return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
  //       case 'unauthorizedError':
  //           return res.sendStatus(httpStatus.UNAUTHORIZED);
  //       default:
  //         return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  //     }
  //   }
}

export default {
  getBooking,
  createBooking,
  changeBooking,
};
