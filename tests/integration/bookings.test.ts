import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import {
  createEnrollmentWithAddress,
  createUser,
  createTicketType,
  createRoomId,
  createRoom,
  createHotels,
  createBooking,
  createPaidTicket,
  createIncludedHotelTicketType,
  createRemoteTicketType,
  createReservedTicket,
  createNotIncludedHotelTicketType,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { prisma } from '@/config';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

afterAll(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('POST /booking', () => {
  it('should return with status 401 WHEN no token is given', async () => {
    const response = await server.post('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should return with status 401 WHEN given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should return with status 401 WHEN there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('WHEN token is valid', () => {
    it('should return with status 404 WHEN roomId does not exist', async () => {
      const token = await generateValidToken();
      const roomId = createRoomId();
      const body = { roomId: roomId };
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should return with status 403 WHEN user does not has a paid ticket', async () => {
      const user = await createUser();
      const enrollmentUser = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createReservedTicket(enrollmentUser.id, ticketType.id);
      const token = await generateValidToken(user);
      const hotelCreated = await createHotels();
      const roomCreated = await createRoom(hotelCreated.id);
      const roomId = roomCreated.id;
      const body = { roomId };
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
    describe('WHEN user has a paid ticket', () => {
      it('should return with status 403 WHEN user does not has a presencial ticket', async () => {
        const user = await createUser();
        const enrollmentUser = await createEnrollmentWithAddress(user);
        const ticketType = await createRemoteTicketType();
        await createPaidTicket(enrollmentUser.id, ticketType.id);
        const token = await generateValidToken(user);
        const hotelCreated = await createHotels();
        const roomCreated = await createRoom(hotelCreated.id);
        const roomId = roomCreated.id;
        const body = { roomId };
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('should return with status 403 WHEN user does not has a hotel included ticket', async () => {
        const user = await createUser();
        const enrollmentUser = await createEnrollmentWithAddress(user);
        const ticketType = await createNotIncludedHotelTicketType();
        await createPaidTicket(enrollmentUser.id, ticketType.id);
        const token = await generateValidToken(user);
        const hotelCreated = await createHotels();
        const roomCreated = await createRoom(hotelCreated.id);
        const roomId = roomCreated.id;
        const body = { roomId };
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });
    });

    it('should return with status 403 WHEN there are not vacancies for roomId', async () => {
      const user = await createUser();
      const enrollmentUser = await createEnrollmentWithAddress(user);
      const ticketType = await createIncludedHotelTicketType();
      await createPaidTicket(enrollmentUser.id, ticketType.id);
      const userId = user.id;
      const token = await generateValidToken(user);
      const hotelCreated = await createHotels();
      const roomCreated = await createRoom(hotelCreated.id);
      const roomId = roomCreated.id;
      const roomCapacity = roomCreated.capacity;
      let start = 0;
      while (start < roomCapacity) {
        await createBooking(userId, roomId);
        start++;
      }

      const body = { roomId };
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
    describe('WHEN user has a paid, presencial and hotel included ticket AND the room has vacancy', () => {
      it('should return with status 200 WHEN user makes a booking', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollmentUser = await createEnrollmentWithAddress(user);
        const ticketType = await createIncludedHotelTicketType();
        await createPaidTicket(enrollmentUser.id, ticketType.id);
        const hotelCreated = await createHotels();
        const roomCreated = await createRoom(hotelCreated.id);
        const roomId = roomCreated.id;
        const body = { roomId };
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.OK);
      });

      it('should return with booking id WHEN user makes a booking', async () => {
        const user = await createUser();
        const enrollmentUser = await createEnrollmentWithAddress(user);
        const ticketType = await createIncludedHotelTicketType();
        await createPaidTicket(enrollmentUser.id, ticketType.id);
        const token = await generateValidToken(user);
        const hotelCreated = await createHotels();
        const roomCreated = await createRoom(hotelCreated.id);
        const roomId = roomCreated.id;
        const body = { roomId };
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

        expect(response.body).toEqual(
          expect.objectContaining({
            bookingId: expect.any(Number),
          }),
        );
        // const bookingId = Number(response.text);
        // const insertedBooking = await prisma.booking.findFirst({
        //   where: {
        //     userId: user.id,
        //     roomId,
        //   },
        // });

        // expect(insertedBooking.id).toBe(bookingId);
        // expect(insertedBooking.userId).toBe(user.id);
        // expect(insertedBooking.roomId).toBe(roomId);
      });
    });
  });
});

describe('GET /booking', () => {
  it('should return with status 401 WHEN no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should return with status 401 WHEN given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should return with status 401 WHEN there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('WHEN token is valid', () => {
    it('should return with status 404 WHEN user has not bookings', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should return with status 200 WHEN user has bookings', async () => {
      const user = await createUser();
      const enrollmentUser = await createEnrollmentWithAddress(user);
      const ticketType = await createIncludedHotelTicketType();
      await createPaidTicket(enrollmentUser.id, ticketType.id);
      const token = await generateValidToken(user);
      const hotelCreated = await createHotels();
      const roomCreated = await createRoom(hotelCreated.id);
      const roomId = roomCreated.id;
      const body = { roomId };
      await createBooking(user.id, roomId);
      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.OK);
    });

    it('SHOULD return body WHEN user has bookings', async () => {
      const user = await createUser();
      const enrollmentUser = await createEnrollmentWithAddress(user);
      const ticketType = await createIncludedHotelTicketType();
      await createPaidTicket(enrollmentUser.id, ticketType.id);
      const token = await generateValidToken(user);
      const hotelCreated = await createHotels();
      const roomCreated = await createRoom(hotelCreated.id);
      const roomId = roomCreated.id;
      const body = { roomId };
      await createBooking(user.id, roomId);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`).send(body);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          Room: expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            capacity: expect.any(Number),
            hotelId: expect.any(Number),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        }),
      );
    });
  });
});

describe('PUT /booking/:bookingId', () => {
  it('should return with status 401 WHEN no token is given', async () => {
    const bookingId = 0;
    const response = await server.put(`/booking/${bookingId}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should return with status 401 WHEN given token is not valid', async () => {
    const bookingId = 0;
    const token = faker.lorem.word();

    const response = await server.put(`/booking/${bookingId}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should return with status 401 WHEN there is no session for given token', async () => {
    const bookingId = 0;
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put(`/booking/${bookingId}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('WHEN token is valid', () => {
    it('should return with status 403 WHEN bookingId does not exist', async () => {
      const bookingId = 0;
      const user = await createUser();
      const token = await generateValidToken(user);
      const roomId = createRoomId();
      const body = { roomId: roomId };
      const response = await server.put(`/booking/${bookingId}`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
    describe('WHEN bookingId exists', () => {
      it('should return with status 404 WHEN roomId does not exist', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotels();
        const room = await createRoom(hotel.id);
        const roomId = 0;
        const booking = await createBooking(user.id, room.id);
        const bookingId = booking.id;
        const body = { roomId: roomId };
        const response = await server.put(`/booking/${bookingId}`).set('Authorization', `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it('should return with status 403 WHEN bookingId does not belongs to user', async () => {
        const user = await createUser();
        // const token = await generateValidToken(user);
        const hotel = await createHotels();
        const room = await createRoom(hotel.id);
        const roomId = 0;
        const booking = await createBooking(user.id, room.id);
        const bookingId = booking.id;
        const body = { roomId: roomId };

        const user2 = await createUser();
        const token2 = await generateValidToken(user2);

        const response = await server.put(`/booking/${bookingId}`).set('Authorization', `Bearer ${token2}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });
      describe('WHEN bookingId belongs to user', () => {
        it('should return with status 403 WHEN there are not vacancies for roomId', async () => {
          const user = await createUser();
          const enrollmentUser = await createEnrollmentWithAddress(user);
          const ticketType = await createIncludedHotelTicketType();
          await createPaidTicket(enrollmentUser.id, ticketType.id);
          const userId = user.id;
          const token = await generateValidToken(user);
          const hotelCreated = await createHotels();
          const roomCreated = await createRoom(hotelCreated.id);
          const roomId = roomCreated.id;
          const roomCapacity = roomCreated.capacity;
          let start = 0;
          while (start < roomCapacity) {
            await createBooking(userId, roomId);
            start++;
          }

          const room2Created = await createRoom(hotelCreated.id);
          const booking = await createBooking(user.id, room2Created.id);
          const bookingId = booking.id;

          const body = { roomId };
          const response = await server.put(`/booking/${bookingId}`).set('Authorization', `Bearer ${token}`).send(body);

          expect(response.status).toBe(httpStatus.FORBIDDEN);
        });
        describe('WHEN there are vacancies for the roomId', () => {
          it('should return with status 200 WHEN user updates a booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollmentUser = await createEnrollmentWithAddress(user);
            const ticketType = await createIncludedHotelTicketType();
            await createPaidTicket(enrollmentUser.id, ticketType.id);
            const hotelCreated = await createHotels();
            const roomCreated = await createRoom(hotelCreated.id);
            const roomId = roomCreated.id;
            const body = { roomId };

            const room2Created = await createRoom(hotelCreated.id);
            const booking = await createBooking(user.id, room2Created.id);
            const bookingId = booking.id;

            const response = await server
              .put(`/booking/${bookingId}`)
              .set('Authorization', `Bearer ${token}`)
              .send(body);

            expect(response.status).toBe(httpStatus.OK);
          });

          it('should return with booking id WHEN user updates a booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollmentUser = await createEnrollmentWithAddress(user);
            const ticketType = await createIncludedHotelTicketType();
            await createPaidTicket(enrollmentUser.id, ticketType.id);
            const hotelCreated = await createHotels();
            const roomCreated = await createRoom(hotelCreated.id);
            const roomId = roomCreated.id;
            const body = { roomId };

            const room2Created = await createRoom(hotelCreated.id);
            const booking = await createBooking(user.id, room2Created.id);
            const bookingId = booking.id;

            const response = await server
              .put(`/booking/${bookingId}`)
              .set('Authorization', `Bearer ${token}`)
              .send(body);

            // const idUpdated = Number(response.text);

            expect(response.body).toEqual(
              expect.objectContaining({
                bookingId: expect.any(Number),
              }),
            );

            // const updatedBooking = await prisma.booking.findFirst({
            //   where: {
            //     id: bookingId,
            //   },
            // });
            // expect(idUpdated).toBe(updatedBooking.id);
          });
        });
      });
    });
  });
});
