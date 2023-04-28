import { TicketStatus } from '@prisma/client';
import enrollmentsService from '../enrollments-service';
import ticketsRepository, { TicketCreateInput } from '../../repositories/tickets-repository';
import { notFoundError } from '@/errors';
// import { CreateUserTicketsParams } from "@/repositories/tickets-repository";
// import { notFoundError } from "@/errors";

async function getAll() {
  const ticketTypes = await ticketsRepository.getAllTicketTypes();

  return ticketTypes;
}

async function getAllUserTickets(userId: number) {
  const userTickets = await ticketsRepository.getAllUserTickets(userId);

  return userTickets;
}

async function createUserTickets(ticketTypeId: number, userId: number) {
  const enrollmentId: number = await enrollmentsService.getEnrollmentByUserId(userId);

  if (!enrollmentId) {
    throw notFoundError;
  }

  const data = {
    TicketType: ticketTypeId,
    Enrollment: enrollmentId,
    status: TicketStatus.RESERVED,
  } as TicketCreateInput;
  // return;
  return ticketsRepository.createUserTickets(data);
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
};

export default ticketsService;
