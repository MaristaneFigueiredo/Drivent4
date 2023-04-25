import { prisma } from '@/config';

async function getCountBookingRoom(roomId: number) {
  return await prisma.booking.count({
    where: {
      roomId,
    },
  });
}

export default { getCountBookingRoom };
