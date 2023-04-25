//import { TicketStatus, TicketType } from '@prisma/client';
import {PaymentInput} from '@/protocols'
import paymentRepository from '@/repositories/payment-repository';
import ticketsService from '@/services/tickets-service';
import enrollmentsService from '../enrollments-service';
import {unauthorizedError } from '@/errors';

async function findTicketUser (enrollmentId:number, userId:number){

  const enrollment = await enrollmentsService.getEnrollmentById(enrollmentId);

    if (enrollment.userId !== userId) {
      throw unauthorizedError;
    }
    return enrollment

}

async function createPaymentProcess(userId:number,{ticketId, cardData}:PaymentInput) {

  
  const ticket = await ticketsService.findTicket(ticketId);  
  
  await findTicketUser(ticket.enrollmentId, userId)

  const ticketTypeId = ticket.ticketTypeId
  const ticketType = await ticketsService.getTicketType(ticketTypeId); 
  const valueTicket = ticketType.price  
 
  const paymentTicket = await paymentRepository.createPaymentProcess({ticketId, cardData}, valueTicket)
  await ticketsService.setTicketAsPaid(ticketId);
  return paymentTicket
}

async function getPaymentsProcess(userId:number, ticketId:number) {
  
  const ticket = await ticketsService.findTicket(ticketId);

  await findTicketUser(ticket.enrollmentId, userId)

  const payments = await paymentRepository.getPaymentsProcess(ticketId)
  
  return payments

}

const paymentsService = {
  createPaymentProcess,
  getPaymentsProcess
};

export default paymentsService;
