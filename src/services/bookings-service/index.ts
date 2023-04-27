import { notFoundError, forbiddenError } from '@/errors';
import hotelsService, { checkEnrollmentAndDataTicketByUser } from '@/services/hotels-service';
import bookingRepository from '@/repositories/bookings-repository';
import hotelRepository from '@/repositories/hotel-repository';
import { BookingInput } from '@/protocols';
import { Room } from '@prisma/client';
import { check } from 'prettier';
import ticketsService from '@/services/tickets-service';

export type BookingBodyInput = Pick<BookingInput, 'roomId'>;

async function getBooking(userId: number) {
  const booking = await bookingRepository.getBooking(userId);

  if (!booking) {
    throw notFoundError;
  }
  return booking;
}

async function createBooking({ userId, roomId }: BookingInput) {
  //validar dados do ticket do usuário
  await ticketsService.checkTicket(userId);

  //existe quarto
  const room = await getRoomById(roomId);

  // existe vaga no quarto
  //await verifyCapacityRoom(room.capacity, roomId);
  await verifyCapacityRoom(room.capacity, roomId, room.hotelId);

  //apenas usuário com ingresso do tipo presencial, com hospedagem e pago
  // await hotelsService.checkEnrollmentAndDataTicketByUser(userId);

  return await bookingRepository.createBooking({ userId, roomId });
}

async function getRoomById(roomId: number): Promise<Room> {
  const room = await hotelRepository.getRoomById(roomId);

  if (!room) throw notFoundError;

  return room;
}

async function verifyCapacityRoom(capacity: number, roomId: number, hotelId: number): Promise<number> {
  //   console.log('booking service hotelId', hotelId); //68
  //   console.log('booking service capacity', capacity); //1
  //   console.log('booking service roomId', roomId); //50

  const qtdeBookingRoom = await bookingRepository.getCountBookingRoom(roomId);

  //   console.log('booking service capacity', capacity); //1
  //   console.log('booking service qtdeBookingRoom', qtdeBookingRoom); //1

  if (qtdeBookingRoom === capacity) throw forbiddenError;

  return qtdeBookingRoom;
}

async function changeBooking() {}

export default {
  getBooking,
  createBooking,
  changeBooking,
};
