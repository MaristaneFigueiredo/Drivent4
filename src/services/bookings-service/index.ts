import { notFoundError, forbiddenError } from '@/errors';
import hotelsService from '@/services/hotels-service';
import bookingRepository from '@/repositories/bookings-repository';
import hotelRepository from '@/repositories/hotel-repository';

async function getBooking() {}

async function createBooking(userId: number, roomId: number) {
  //existe quarto e vaga
  const room = await getRoomById(roomId);

  // existe vaga no quarto
  await verifyCapacityRoom(room.capacity, roomId);

  //apenas usuário com ingresso do tipo presencial, com hospedagem e pago
  await hotelsService.checkEnrollmentAndDataTicketByUser(userId);
}

async function getRoomById(roomId: number) {
  const room = await hotelRepository.getRoomById(roomId);

  if (!room) throw notFoundError;

  return room;
}

async function verifyCapacityRoom(capacity: number, roomId: number) {
  const qtdeBookingRoom = await bookingRepository.getCountBookingRoom(roomId);

  if (capacity <= qtdeBookingRoom) throw forbiddenError;

  return qtdeBookingRoom;
}

async function changeBooking() {}

export default {
  getBooking,
  createBooking,
  changeBooking,
};
