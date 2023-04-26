import supertest from 'supertest';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
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
} from '../factories';
import { response } from 'express';

const server = supertest(app);

beforeAll(async () => {
  await init();
  // await cleanDb()
});

beforeEach(async () => {
  await cleanDb();
});

describe('GET /booking', () => {});

describe('POST /booking', () => {
  it('should respond with status 401 WHEN no token is given', async () => {
    const response = await server.post('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 WHEN given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 WHEN there is no session for given token', async () => {
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

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should return with status 403 WHEN there is remote ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createRemoteTicketType();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
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

    it("should return with status 404 WHEN room dosen't exist", async () => {
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
      //   console.log('booking test hotel.id', hotel.id); //68
      //   console.log('booking test roomId', room.id); //50
      //   console.log('booking test bookingId', booking.id); //37

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    // it('should return booking with status 200', async () => {
    //   const user = await createUser();
    //   const token = await generateValidToken(user);

    //   const enrollment = await createEnrollmentWithAddress(user);
    //   const ticketType = await createIncludedHotelTicketType();
    //   const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    //   const hotel = await createHotels();
    //   const room = await createRoom(hotel.id);

    //   const data = {
    //     userId: user.id,
    //     roomId: room.id,
    //   };

    //   const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    //   expect(response.status).toEqual(httpStatus.OK);
    //   expect(Number(response.text)).toEqual(expect.any(Number));
    // });
  });
});

describe('PUT /bookingId', () => {});
