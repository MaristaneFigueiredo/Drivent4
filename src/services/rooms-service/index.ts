import bookingsService from '../bookings-service';
import roomsRepository from '@/repositories/rooms-repository';

async function getRoomById(roomId: number) {
  return await roomsRepository.getRoomById(roomId);
}

async function getNumberOfRoomVacancies(roomId: number) {
  const numberOfBooking = await bookingsService.getNumberOfRoomBooking(roomId);
  const room = await roomsRepository.getRoomById(roomId);
  const vacancies = room.capacity - numberOfBooking;
  return vacancies;
}

export default {
  getRoomById,
  getNumberOfRoomVacancies,
};
