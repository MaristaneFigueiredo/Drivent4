import { TicketStatus } from '@prisma/client';
import ticketsService from '../tickets-service';
import roomsService from '../rooms-service';
import bookingRepository, { BookingCreateInput } from '@/repositories/booking-repository';
import { Forbidden } from '@/errors/forbidden-error';
import { notFoundError } from '@/errors';

export type BookingBodyInput = Pick<BookingCreateInput, 'roomId'>;

async function createBooking(roomId: number, userId: number) {
  await validateTicketsForBookingBusinessRules(roomId, userId);
  await validateRoomBusinessRules(roomId);
  const booking = {
    roomId,
    userId,
  } as BookingCreateInput;
  return await bookingRepository.createBooking(booking);
}

async function getBooking(userId: number) {
  const booking = await bookingRepository.getBooking(userId);

  if (!booking) {
    throw notFoundError;
  }
  return booking;
}

async function validateTicketsForBookingBusinessRules(roomId: number, userId: number) {
  const userTicket = await ticketsService.getAllUserTickets(userId);
  const userTicketType = await ticketsService.getTicketTypeById(userTicket.ticketTypeId);
  const isTicketNotRemote = userTicketType.isRemote === false;
  const isHotelIncluded = userTicketType.includesHotel;
  const isTicketPaid = userTicket.status === TicketStatus.PAID;
  const canUserMakeABooking = isTicketNotRemote && isHotelIncluded && isTicketPaid;

  if (!canUserMakeABooking) {
    throw Forbidden;
  }

  return;
}

async function validateBookingIdExists(bookingId: number) {
  const booking = await bookingRepository.getBookingById(bookingId);

  if (!booking) {
    throw Forbidden;
  }
  return;
}

async function validateBookingBelongsToUser(bookingId: number, userId: number) {
  const booking = await bookingRepository.getBookingById(bookingId);
  const bookingBelongsToUser = booking.userId === userId;

  if (!bookingBelongsToUser) {
    throw Forbidden;
  }
}

async function validateRoomBusinessRules(roomId: number) {
  const room = await roomsService.getRoomById(roomId);
  if (!room) {
    throw notFoundError;
  }

  const vacancies = await roomsService.getNumberOfRoomVacancies(roomId);

  if (!(vacancies > 0)) {
    throw Forbidden;
  }
  return;
}

async function getNumberOfRoomBooking(roomId: number) {
  const bookings = await bookingRepository.getNumberOfRoomBooking(roomId);

  if (!bookings) {
    return 0;
  }
  return bookings;
}

async function updateBooking(bookingId: number, roomId: number, userId: number) {
  await validateBookingIdExists(bookingId);
  await validateBookingBelongsToUser(bookingId, userId);
  await validateRoomBusinessRules(roomId);

  return await bookingRepository.updateBooking(bookingId, roomId);
}

export default {
  createBooking,
  getNumberOfRoomBooking,
  getBooking,
  updateBooking,
};
