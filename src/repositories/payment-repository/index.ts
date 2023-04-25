import { Payment } from '@prisma/client';
import { prisma } from '@/config';
import {PaymentInput} from '@/protocols'



async function createPaymentProcess({ticketId, cardData}:PaymentInput, valueTicket:number) {
  const data = {
    ticketId: ticketId,
    value:valueTicket ,
    cardIssuer: cardData.issuer,    
    cardLastDigits:cardData.number.toString().slice(-4)
  } 
 
  return await prisma.payment.create({
    data: data
  }) 

}

//async function getPaymentsProcess(ticketId:number):Promise<Payment> {
async function getPaymentsProcess(ticketId:number) {

  /* return await prisma.payment.findFirst({
    where:{id:ticketId},
    select:{
      id:true,
      ticketId:true,
      value:true,
      cardIssuer:false,
      cardLastDigits:false,
      createdAt:false,
      updatedAt:false      
    }
  })  */

  return await prisma.payment.findFirst({
    where:{ticketId:ticketId}
  }) 

}


const paymentRepository = {
  createPaymentProcess,
  getPaymentsProcess
};

export default paymentRepository;
