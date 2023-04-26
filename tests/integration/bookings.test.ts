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
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('When token is valid', () => {

    it('should return booking with status 200', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createIncludedHotelTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotels();
      const room = await createRoom(hotel.id)

      const body = {
        userId:user.id,
        roomId: room.id
      }

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body)
      expect(response.status).toBe(httpStatus.OK)
     // expect(response.length).toEqual(1);
       /*  expect(response).toEqual(
        expect.objectContaining({
          id:id
        })
      )   */

   });

  });
});



describe('PUT /bookingId', () => {});
