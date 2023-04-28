import { Prisma } from '@prisma/client';
import { prisma } from '@/config';

async function createBooking(data: BookingCreateInput) {
  return await prisma.booking.create({
    data,
  });
}

async function getNumberOfRoomBooking(roomId: number) {
  return await prisma.booking.count({
    where: {
      roomId,
    },
  });
}

async function getBooking(userId: number) {
  return await prisma.booking.findFirst({
    where: {
      userId,
    },
    select: {
      id: true,
      Room: true,
    },
  });
}

async function getBookingById(bookingId: number) {
  return await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });
}

async function updateBooking(bookingId: number, roomId: number) {
  return await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId,
    },
  });
}

export type BookingCreateInput = Pick<Prisma.BookingCreateManyInput, 'userId' | 'roomId'>;

export default {
  createBooking,
  getNumberOfRoomBooking,
  getBooking,
  updateBooking,
  getBookingById,
};
