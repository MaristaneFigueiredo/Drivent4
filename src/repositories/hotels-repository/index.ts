import { prisma } from '@/config';

async function getAll() {
  return await prisma.hotel.findMany({});
}

async function getHotelById(hotelId: number) {
  return await prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });
}

const hotelsRepository = {
  getAll,
  getHotelById,
};

export default hotelsRepository;
