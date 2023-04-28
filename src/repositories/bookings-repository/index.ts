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

/* async function createBooking({ userId, roomId }: BookingInput) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
} */

async function createBooking(body: BookingInput) {
  return await prisma.booking.create({
    data: body
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

async function getNumberOfRoomBooking(roomId: number) {
  return await prisma.booking.count({
    where: {
      roomId,
    },
  });
}


async function changeBooking(bookingId: number, roomId: number) {
  return await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId,
    },
  });
}


export default { getCountBookingRoom, createBooking, getBooking, getBookingById,getNumberOfRoomBooking, changeBooking };
