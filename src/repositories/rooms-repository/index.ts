import { Prisma } from '@prisma/client';
import { prisma } from '@/config';

async function getRoomById(roomId: number) {
  return await prisma.room.findUnique({
    where: {
      id: roomId,
    },
  });
}

export default {
  getRoomById,
};
