import supertest from 'supertest';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import { prisma } from '@/config';
import { TicketStatus } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import app, { init } from '@/app';
import { User } from '@prisma/client';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createUser,
  createEnrollmentWithAddress,
  createTicketType,
  createTicket,
  createRemoteTicketType,
  createNotIncludedHotelTicketType,
  createIncludedHotelTicketType,
  createHotels,
  createRoom,
  createRoomWithoutCapacity,
  createBooking,
  createPaidTicket
} from '../factories';
import { response } from 'express';

const server = supertest(app);

beforeAll(async () => {
  await init();
  await cleanDb()
});

beforeEach(async () => {
  await cleanDb();
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

  describe('When token is valid', () => {
    
    it('should return  with status 404 WHEN user has not bookings', async () => {
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
      const hotel = await createHotels();
      const room = await createRoom(hotel.id);
      const roomId = room.id;
      const body = { roomId };
      //await createBooking(user.id, roomId);
      const booking = await createBooking(room.id, user.id);
      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.OK);

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

  describe('When token is valid', () => {
    it('should return with status 403 WHEN there is NOT paid ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const hotelCreated = await createHotels();
      const roomCreated = await createRoom(hotelCreated.id);
      const roomId = roomCreated.id;
      const body = { roomId };

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
      //const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should return with status 403 WHEN there is remote ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createRemoteTicketType();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotelCreated = await createHotels();
      const roomCreated = await createRoom(hotelCreated.id);
      const roomId = roomCreated.id;
      const body = { roomId };

      //const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should return with status 403 WHEN there is NOT ticket with hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createNotIncludedHotelTicketType();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should return with status 404 WHEN room does not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createIncludedHotelTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 12 });
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should return with status 403 WHEN vacancy in the room dosen't exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createIncludedHotelTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotels();
      const room = await createRoomWithoutCapacity(hotel.id);
      const booking = await createBooking(room.id, user.id);
    
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should return booking with status 200', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createIncludedHotelTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotels();
      const room = await createRoom(hotel.id);

      const data = {
        userId: user.id,
        roomId: room.id,
      };

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          bookingId: expect.any(Number)
        })
      );


      //tratando o efeito colateral
     /*  const insertedBooking = await prisma.booking.findFirst({
        where: {
          userId: user.id,
          roomId: room.id,
        },
      });
      expect(insertedBooking.id).toBe(Number(response.text));
      expect(insertedBooking.userId).toBe(user.id);
      expect(insertedBooking.roomId).toBe(room.id);
 */
    
    });
  });
});

describe('PUT /bookingId', () => {});
