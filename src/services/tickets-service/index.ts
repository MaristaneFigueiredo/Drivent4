import { Ticket, TicketStatus, TicketType } from '@prisma/client';
import ticketRepository from '@/repositories/ticket-repository';
import { notFoundError, paymentNotFound } from '@/errors';
import { TicketInput } from '@/protocols';
import enrollmentsService from '@/services/enrollments-service';

async function getTicketsType(): Promise<TicketType[]> {
  const TicketsType = await ticketRepository.getTicketsType();
  return TicketsType;
}

async function getTicketType(ticketTypeId: number): Promise<TicketType> {
  const TicketType = await ticketRepository.getTicketType(ticketTypeId);

  if (!TicketType) {
    throw notFoundError;
  }
  return TicketType;
}

async function findTicket(ticketTypeId: number): Promise<Ticket> {
  const ticket = await ticketRepository.findTicket(ticketTypeId);

  if (!ticket) {
    throw notFoundError;
  }
  return ticket;
}

async function createTiket(ticketTypeId: number, userId: number) {
  const enrollment = await enrollmentsService.getEnrollmentByUserId(userId);

  const ticketType = await getTicketType(ticketTypeId);

  const data = {
    ticketTypeId: ticketType.id,
    enrollmentId: enrollment.id,
    status: TicketStatus.RESERVED,
  } as TicketInput;
  const ticket = await ticketRepository.createTiket(data);

  const ticketDetails = await ticketRepository.findTicketWithTicketTypeById(ticket.id);

  return ticketDetails;
}

async function getTiketsByUser(userId: number) {
  const enrollment = await enrollmentsService.getEnrollmentByUserId(userId);
  const ticketsByUser = await ticketRepository.getTiketsByUser(enrollment.id);

  if (!ticketsByUser) {
    throw notFoundError;
  }

  return ticketsByUser;
}

async function setTicketAsPaid(ticketId: number) {
  return await ticketRepository.setTicketAsPaid(ticketId);
}

async function checkTiketsByUser(enrollmentId: number) {
  
  
  const dataTicket = await ticketRepository.getTiketsByUser(enrollmentId);

  //console.log('ticketService dataTicketPaymentUser', dataTicket);


  //não existe dados do ticket
  if (!dataTicket.ticketTypeId) {    
    throw notFoundError
  }
  

  const isTicketPaidNotRemoteAndHotelIncluded =
    dataTicket.status === TicketStatus.PAID &&
    dataTicket.TicketType.isRemote === false &&
    dataTicket.TicketType.includesHotel;

  if (!isTicketPaidNotRemoteAndHotelIncluded) {    
    throw paymentNotFound;
  }

  return dataTicket;
}



const ticketsService = {
  getTicketsType,
  createTiket,
  getTiketsByUser,
  findTicket,
  getTicketType,
  setTicketAsPaid,
  checkTiketsByUser

};

export default ticketsService;
