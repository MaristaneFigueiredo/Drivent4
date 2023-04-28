import Joi from 'joi';
import { CreateTicketsParams } from '@/services';

export const ticketsSchema = Joi.object<CreateTicketsParams>({
  ticketTypeId: Joi.number().required(),
  enrollmentId: Joi.number().required(),
  status: Joi.string().allow('RESERVED', 'PAID').required(),
});

type createUserTicket = Pick<CreateTicketsParams, 'ticketTypeId'>;

export const createUserTicketSchema = Joi.object<createUserTicket>({
  ticketTypeId: Joi.number().required(),
});
