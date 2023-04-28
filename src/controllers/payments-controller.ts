import httpStatus from 'http-status';
import { Response } from 'express';
import paymentsService from '@/services/payments-service';
import { AuthenticatedRequest } from '@/middlewares';

export async function getPayments(req: AuthenticatedRequest, res: Response) {
  try {
    const ticketId = Number(req.query.ticketId);
    const { userId }: { userId: number } = req;
    const payments = await paymentsService.getAll(ticketId, userId);
    return res.status(httpStatus.OK).send(payments);
  } catch (error) {
    switch (error.name) {
      case 'notFoundError':
        return res.sendStatus(httpStatus.NOT_FOUND);
      case 'requestError':
        return res.sendStatus(httpStatus.BAD_REQUEST);
      case 'unauthorizedError':
        return res.sendStatus(httpStatus.UNAUTHORIZED);
      default:
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export async function createPayment(req: AuthenticatedRequest, res: Response) {
  try {
    const ticketId = Number(req.body.ticketId);
    const { userId }: { userId: number } = req;
    const { issuer, number }: { issuer: string; number: string; name: string; expirationDate: string; cvv: string } =
      req.body.cardData;
    const payment = await paymentsService.createPayment(ticketId, issuer, number, userId);
    return res.status(httpStatus.OK).send(payment);
  } catch (error) {
    switch (error.name) {
      case 'notFoundError':
        return res.sendStatus(httpStatus.NOT_FOUND);
      case 'requestError':
        return res.sendStatus(httpStatus.BAD_REQUEST);
      case 'unauthorizedError':
        return res.sendStatus(httpStatus.UNAUTHORIZED);
      default:
        console.error('error payments controller =', error);
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export default {
  createPayment,
  getPayments,
};
