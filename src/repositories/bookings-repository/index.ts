import { prisma } from '@/config';
import { Booking } from '@prisma/client';
import { BookingInput } from '@/protocols';

async function getCountBookingRoom(roomId: number): Promise<number> {
  return await prisma.booking.count({
    where: {
      roomId,
    },
  });
}

async function createBooking({ userId, roomId }: BookingInput) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

export default { getCountBookingRoom, createBooking };
