import httpStatus from 'http-status';
import { Request, Response } from 'express';
import ticketsService from '@/services/tickets-service';
import { AuthenticatedRequest } from '@/middlewares';

export async function getTicketTypes(req: Request, res: Response) {
  try {
    const ticketsTypes = await ticketsService.getAll();

    return res.status(httpStatus.OK).send(ticketsTypes);
  } catch (error) {
    switch (error.name) {
      case 'notFoundError':
        return res.sendStatus(httpStatus.NOT_FOUND);
        break;
      default:
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
        break;
    }
  }
}

export async function getAllUserTickets(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const userTickets = await ticketsService.getAllUserTickets(userId);

    return res.status(httpStatus.OK).send(userTickets);
  } catch (error) {
    switch (error.name) {
      case 'notFoundError':
        return res.sendStatus(httpStatus.NOT_FOUND);
      default:
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export async function createUserTicket(req: Request, res: Response) {
  try {
    const { userId }: { userId: number } = req as AuthenticatedRequest;
    const { ticketTypeId }: { ticketTypeId: number } = req.body;
    const userTickets = await ticketsService.createUserTickets(ticketTypeId, userId);

    return res.status(httpStatus.CREATED).send(userTickets);
  } catch (error) {
    switch (error.name) {
      case 'notFoundError':
        return res.sendStatus(httpStatus.NOT_FOUND);
      default:
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
