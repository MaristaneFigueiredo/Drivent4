import { prisma } from '@/config';
import { Hotel } from '@prisma/client';

async function getHotels(): Promise<Hotel[]> {
  const hotels = await prisma.hotel.findMany();
  return hotels;
}

async function getRoomsHotel(hotelId: number) {
  const roomsHotels = await prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });
  return roomsHotels;
}
//

async function getHotelById(hotelId: number) {
  const hotel = await prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
  });
  return hotel;
}

const hotelRepository = {
  getHotels,
  getRoomsHotel,
  getHotelById,
};

export default hotelRepository;
