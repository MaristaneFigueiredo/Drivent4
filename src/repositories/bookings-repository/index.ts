import { prisma } from '@/config';

type BookingInput = {
  userId: number,
  roomId: number
};

async function getCountBookingRoom(roomId: number) {
  return await prisma.booking.count({
    where: {
      roomId,
    },
  });
}


//async function createBooking(userId: number, roomId: number) {
async function createBooking(data:BookingInput) {
  return await prisma.booking.create({
    data
  });
}

export default { getCountBookingRoom, createBooking };
