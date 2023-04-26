import { prisma } from '@/config';

async function getCountBookingRoom(roomId: number) {
  return await prisma.booking.count({
    where: {
      roomId,
    },
  });
}


async function createBooking(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

export default { getCountBookingRoom, createBooking };
