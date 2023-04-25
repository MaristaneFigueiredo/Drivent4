import { Ticket, TicketType } from '@prisma/client';
import { prisma } from '@/config';
import { TicketInput, TicketResponse } from '@/protocols';

async function getTicketsType(): Promise<TicketType[]> {
  return await prisma.ticketType.findMany();
}

async function getTicketType(ticketTypeId: number): Promise<TicketType> {
  return await prisma.ticketType.findFirst({
    where: {
      id: ticketTypeId,
    },
  });
}

async function createTiket(data: TicketInput): Promise<Ticket> {
  return await prisma.ticket.create({
    data: data,
  });
}

async function findTicketWithTicketTypeById(id: number): Promise<TicketResponse> {
  return prisma.ticket.findFirst({
    /*  where: { id },
    include: {
      TicketType: true,
    }, */
    where: { id },
    select: {
      id: true,
      status: true,
      ticketTypeId: true,
      enrollmentId: true,
      TicketType: {
        select: {
          id: true,
          name: true,
          price: true,
          isRemote: true,
          includesHotel: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function getTiketsByUser(id: number): Promise<TicketResponse> {
  return prisma.ticket.findFirst({
    where: { enrollmentId: id },
    select: {
      id: true,
      status: true,
      ticketTypeId: true,
      enrollmentId: true,
      TicketType: {
        select: {
          id: true,
          name: true,
          price: true,
          isRemote: true,
          includesHotel: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function findTicket(ticketTypeId: number): Promise<Ticket> {
  return await prisma.ticket.findFirst({
    where: {
      id: ticketTypeId,
    },
  });
}

async function setTicketAsPaid(ticketId: number): Promise<Ticket> {
  return await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      status: 'PAID',
    },
  });
}


const ticketRepository = {
  getTicketsType,
  createTiket,
  getTicketType,
  findTicketWithTicketTypeById,
  getTiketsByUser,
  findTicket,
  setTicketAsPaid,
  
};

export default ticketRepository;
