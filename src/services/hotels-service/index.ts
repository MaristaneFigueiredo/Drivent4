import { TicketStatus } from '@prisma/client';
import ticketsService from '../tickets-service';
import { paymentNotFound } from '../payments-service/errors';
import hotelsRepository from '@/repositories/hotels-repository';
import { notFoundError } from '@/errors';

async function getAll(userId: number) {
  await verifyUserTickets(userId);

  const hotels = await hotelsRepository.getAll();

  if (hotels.length === 0) {
    throw notFoundError;
  }

  return hotels;
}

async function getHotelById(hotelId: number, userId: number) {
  await verifyUserTickets(userId);
  const hotel = await hotelsRepository.getHotelById(hotelId);
  if (!hotel) {
    throw notFoundError;
  }
  return hotel;
}

async function verifyUserTickets(userId: number) {
  const allUserTickets = await ticketsService.getAllUserTickets(userId);

  if (!allUserTickets) {
    throw notFoundError;
  }

  // const paidTickets = allUserTickets.filter((t) => t.status === TicketStatus.PAID && t.TicketType.isRemote === false);
  // const isAnyNotRemoteAndIncludesHotel = paidTickets.filter(
  //   (t) => !t.TicketType.isRemote && t.TicketType.includesHotel,
  // );
  const isTicketPaidNotRemoteAndHotelIncluded =
    allUserTickets.status === TicketStatus.PAID &&
    allUserTickets.TicketType.isRemote === false &&
    allUserTickets.TicketType.includesHotel;

  if (!isTicketPaidNotRemoteAndHotelIncluded) {
    throw paymentNotFound;
  }

  return;
}

const hotelsService = {
  getAll,
  getHotelById,
};
export default hotelsService;
