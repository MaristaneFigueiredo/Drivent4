import { Prisma } from '@prisma/client';
import { prisma } from '@/config';

async function getALl(ticketId: number) {
  return await prisma.payment.findFirst({
    where: {
      ticketId,
    },
  });
}

async function createPayment(data: PaymentCreateInput) {
  return await prisma.payment.create({
    data: {
      ticketId: data.ticketId,
      value: data.value,
      cardIssuer: data.cardIssuer,
      cardLastDigits: data.cardLastDigits,
    },
  });
}

async function getTicketPayment(ticketId: number) {
  return await prisma.payment.findFirst({
    where: {
      ticketId,
    },
  });
}

export type PaymentCreateInput = Pick<
  Prisma.PaymentUncheckedCreateInput,
  'ticketId' | 'value' | 'cardIssuer' | 'cardLastDigits'
>;

const paymentsRepository = {
  getALl,
  createPayment,
  getTicketPayment,
};

export default paymentsRepository;
