import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: faker.datatype.number(),
      //capacity: Number(faker.random.numeric(1)),
      hotelId: hotelId,
    },
  });
}

export async function createRoomWithoutCapacity(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: 1,
      hotelId: hotelId,
    },
  });
}
