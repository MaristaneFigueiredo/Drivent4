import { prisma } from '@/config';
import { Hotel, Room } from '@prisma/client';

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

async function getHotelById(hotelId: number): Promise<Hotel> {
  const hotel = await prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
  });
  return hotel;
}

async function getRoomById(roomId: number): Promise<Room> {
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
    },
  });
  return room;
}

const hotelRepository = {
  getHotels,
  getRoomsHotel,
  getHotelById,
  getRoomById,
};

export default hotelRepository;
