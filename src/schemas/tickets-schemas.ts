import Joi from 'joi';

export type CreateTicketsParams = {
  ticketTypeId: number;
  enrollmentId: number;
  status: string;
};
type createUserTicket = Pick<CreateTicketsParams, 'ticketTypeId'>;

export const ticketsSchema = Joi.object<CreateTicketsParams>({
  ticketTypeId: Joi.number().required(),
  enrollmentId: Joi.number().required(),
  status: Joi.string().allow('RESERVED', 'PAID').required(),
});

export const createUserTicketSchema = Joi.object<createUserTicket>({
  ticketTypeId: Joi.number().required(),
});
