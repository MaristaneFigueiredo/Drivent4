import ticketsService from '../tickets-service';
import enrollmentsService from '../enrollments-service';
import { requestError, notFoundError, unauthorizedError } from '@/errors';
import paymentsRepository, { PaymentCreateInput } from '@/repositories/payments-repository';

async function getAll(ticketId: number, userId: number) {
  if (!ticketId) {
    throw requestError;
  }

  const ticket = await ticketsService.getTicketById(ticketId);

  if (!ticket) {
    throw notFoundError;
  }

  const enrollment = await enrollmentsService.getEnrollmentById(ticket.enrollmentId);

  if (enrollment.userId !== userId) {
    throw unauthorizedError;
  }

  const payment = await paymentsRepository.getTicketPayment(ticketId);

  const result = {
    id: payment.id,
    ticketId: payment.ticketId,
    value: payment.value,
    cardIssuer: payment.cardIssuer,
    cardLastDigits: payment.cardLastDigits,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };

  return result;
}

async function createPayment(ticketId: number, issuer: string, number: string, userId: number) {
  const ticket = await ticketsService.getTicketById(ticketId as number);

  if (!ticket) {
    throw notFoundError;
  }
  const ticketTypeId: number = ticket.ticketTypeId;
  const ticketType = await ticketsService.getTicketTypeById(ticketTypeId);

  if (!ticketType) {
    throw unauthorizedError;
  }

  const enrollment = await enrollmentsService.getEnrollmentById(ticket.enrollmentId);

  if (enrollment.userId !== userId) {
    throw unauthorizedError;
  }
  const inputPayment = {
    ticketId: ticketId,
    value: ticketType.price,
    cardIssuer: issuer,
    cardLastDigits: number.slice(-4),
  } as PaymentCreateInput;

  const payments = await paymentsRepository.createPayment(inputPayment);
  await ticketsService.setTicketAsPaid(ticketId);
  return payments;
}

export type CreatePaymentsParams = {
  ticketId: number;
  cardData: {
    issuer: string;
    number: number;
    expirationDate: Date;
    cvv: number;
  };
};

const paymentsService = {
  getAll,
  createPayment,
};

export default paymentsService;
