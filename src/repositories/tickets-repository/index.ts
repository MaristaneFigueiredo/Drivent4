import { Prisma } from '@prisma/client';
import { prisma } from '@/config';
// import { CreateTicketsParams } from '@/services';

async function getAllTicketTypes() {
  return prisma.ticketType.findMany();
}

async function getTicketById(id: number) {
  return await prisma.ticket.findUnique({
    where: {
      id: id,
    },
  });
}

async function getTicketTypeById(ticketTypeId: number) {
  return await prisma.ticketType.findUnique({
    where: {
      id: ticketTypeId,
    },
  });
}

async function getAllUserTickets(idUser: number) {
  return prisma.ticket.findFirst({
    where: {
      Enrollment: {
        userId: {
          equals: idUser,
        },
      },
    },
    include: {
      TicketType: true,
    },
  });
}

async function createUserTickets(data: TicketCreateInput) {
  return await prisma.ticket.create({
    data: {
      ticketTypeId: data.ticketTypeId,
      enrollmentId: data.enrollmentId,
      status: data.status,
    },
  });
}

async function setTicketAsPaid(ticketId: number) {
  return await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      status: 'PAID',
    },
  });
}

export type TicketCreateInput = Pick<Prisma.TicketCreateManyInput, 'ticketTypeId' | 'enrollmentId' | 'status'>;

const ticketsRepository = {
  getAllTicketTypes,
  getAllUserTickets,
  createUserTickets,
  getTicketTypeById,
  getTicketById,
  setTicketAsPaid,
};

export default ticketsRepository;
