import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import httpStatus from 'http-status';
import {PaymentInput} from '@/protocols'
import paymentsService from '@/services/payments-service';

async function createPaymentProcess(req: AuthenticatedRequest, res: Response) {

  try {   
    
    const userId = Number(req.userId)
    
    const { ticketId, cardData} = req.body as PaymentInput

    
    if (!ticketId || !cardData) {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }
    
    const paymentTicket = await paymentsService.createPaymentProcess(userId,{ticketId, cardData})
    
    return res.status(httpStatus.OK).send(paymentTicket)
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

export async function getPaymentsProcess(req: AuthenticatedRequest, res: Response) {
  try {   
    
    const userId = Number(req.userId)
    
    const ticketId = Number(req.query.ticketId);

    
    if (!ticketId) {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }
    
    const payment = await paymentsService.getPaymentsProcess(userId, ticketId)
    //console.log("payment controler res", payment)
    return res.status(httpStatus.OK).send(payment)
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

export default {
  createPaymentProcess,
  getPaymentsProcess,
};
