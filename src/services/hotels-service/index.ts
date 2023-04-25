import { Hotel } from '@prisma/client';
import { notFoundError } from '@/errors';
import hotelRepository from '@/repositories/hotel-repository';
import enrollmentsService from '@/services/enrollments-service';
import ticketsService from '@/services/tickets-service';
import ticketRepository from '@/repositories/ticket-repository';

async function getHotels(userId: number): Promise<Hotel[]> {
  await checkEnrollmentAndDataTicketByUser(userId);

  const hotels = await hotelRepository.getHotels();

  if (hotels.length === 0) {
    throw notFoundError;
  }

  return hotels;
}

async function getHotelById(hotelId: number) {
  const hotel = await hotelRepository.getHotelById(hotelId);

  if (!hotel) {
    throw notFoundError;
  }

  return hotel;
}

async function getRoomsHotel(userId: number, hotelId: number) {
  await checkEnrollmentAndDataTicketByUser(userId);

  await getHotelById(hotelId);

  const roomsHotels = await hotelRepository.getRoomsHotel(hotelId);

  if (!roomsHotels) {
    throw notFoundError;
  }
  return roomsHotels;
}

// export async function checkEnrollmentAndDataTicketByUser(userId: number) {

//   // existe enrollment
//   const enrollment = await enrollmentsService.getEnrollmentByUserId(userId);

//   // existe ticket with enrollment
//   const ticket = await ticketRepository.getTiketsByUser(enrollment.id);

//   if (!ticket) throw notFoundError;

//   const dataTicket = await ticketsService.checkTiketsByUser(enrollment.id);

// }

export async function checkEnrollmentAndDataTicketByUser(userId: number) {
  // existe enrollment
  const enrollment = await enrollmentsService.getEnrollmentByUserId(userId);

  const dataTicket = await ticketsService.checkTiketsByUser(enrollment.id);
}

const hotelsService = {
  getHotels,
  getRoomsHotel,
  checkEnrollmentAndDataTicketByUser,
};

export default hotelsService;
