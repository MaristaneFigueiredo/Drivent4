import { TicketStatus } from '@prisma/client';
import ticketsRepository, { TicketCreateInput } from '../../repositories/tickets-repository';
import enrollmentsService from '../enrollments-service';
import { notFoundError } from '@/errors';

const TICKET_STATUS_PAID = 'PAID';
const TICKET_STATUS_RESERVED = 'RESERVED';

async function getAll() {
  const ticketTypes = await ticketsRepository.getAllTicketTypes();

  return ticketTypes;
}

async function getTicketById(id: number) {
  return await ticketsRepository.getTicketById(id);
}

async function getAllUserTickets(userId: number) {
  const userTickets = await ticketsRepository.getAllUserTickets(userId);
  const enrollment = await enrollmentsService.getEnrollmentByUserId(userId);

  if (!userTickets || !enrollment) {
    throw notFoundError;
  }

  return userTickets;
}

async function getTicketTypeById(ticketTypeId: number) {
  return await ticketsRepository.getTicketTypeById(ticketTypeId);
}

async function createUserTickets(ticketTypeId: number, userId: number) {
  const enrollment = await enrollmentsService.getEnrollmentByUserId(userId);
  const ticketType = await getTicketTypeById(ticketTypeId);

  if (!enrollment || !ticketType) {
    throw notFoundError;
  }

  const data = {
    ticketTypeId: ticketTypeId,
    enrollmentId: enrollment.id,
    status: TicketStatus.RESERVED,
  } as TicketCreateInput;

  const ticket = await ticketsRepository.createUserTickets(data);

  const result = {
    id: ticket.id,
    status: ticket.status,
    ticketTypeId: ticket.ticketTypeId,
    enrollmentId: ticket.enrollmentId,
    TicketType: {
      id: ticketType.id,
      name: ticketType.name,
      price: ticketType.price,
      isRemote: ticketType.isRemote,
      includesHotel: ticketType.includesHotel,
      createdAt: ticketType.createdAt,
      updatedAt: ticketType.updatedAt,
    },
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };

  return result;
}

async function setTicketAsPaid(ticketId: number) {
  return await ticketsRepository.setTicketAsPaid(ticketId);
}

export type CreateTicketsParams = {
  ticketTypeId: number;
  enrollmentId: number;
  status: string;
};

const ticketsService = {
  getAll,
  getAllUserTickets,
  createUserTickets,
  getTicketTypeById,
  getTicketById,
  setTicketAsPaid,
  TICKET_STATUS_PAID,
  TICKET_STATUS_RESERVED,
};

export default ticketsService;
