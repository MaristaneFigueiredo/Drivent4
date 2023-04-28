import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: Number(faker.random.numeric(1)),
      hotelId: hotelId,
    },
  });
}

export function createRoomId() {
  return faker.datatype.number();
}
