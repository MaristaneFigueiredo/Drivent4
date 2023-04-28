import httpStatus from 'http-status';
import { TicketStatus } from '@prisma/client';
import supertest from 'supertest';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createEnrollmentWithAddress,
  createUser,
  createTicketType,
  createTicket,
  createRemoteTicketType,
  createNotIncludedHotelTicketType,
  createIncludedHotelTicketType,
  createHotels,
  createRoom,
} from '../factories';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
  await cleanDb();
});

beforeEach(async () => {
  await cleanDb();
});

afterAll(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
  it('SHOULD respond with HTTP status 401 WHEN there is not a Token', async () => {
    const result = await server.get('/hotels');
    expect(result.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('SHOULD respond with HTTP status 401 WHEN token is invalid', async () => {
    const result = await server.get('/hotels').set('Authorization', 'Bearer invalidToken');
    expect(result.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  describe('WHEN token is valid', () => {
    it('SHOULD respond with HTTP status 404 WHEN there is no Enrollment, Ticket or Hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('SHOULD respond with HTTP status 402 WHEN there is not any paid ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('SHOULD respond with HTTP status 402 WHEN there is non-remote ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createRemoteTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('SHOULD respond with HTTP status 402 WHEN there is no ticket with hotel included', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createNotIncludedHotelTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });
    describe('WHEN user has ticket paid, non-remote and hotel included', () => {
      it('SHOULD respond with HTTP status 404 WHEN there is no hotel listed', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createIncludedHotelTicketType();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toEqual(httpStatus.NOT_FOUND);
      });
      it('SHOULD respond with HTTP status 200 WHEN hotels are listed', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createIncludedHotelTicketType();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createHotels();
        await createHotels();
        await createHotels();

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toEqual(httpStatus.OK);
      });
      it('SHOULD respond with HTTP status 200 WHEN hotels are listed and with all fields', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createIncludedHotelTicketType();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createHotels();
        await createHotels();
        await createHotels();

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              name: expect.any(String),
              image: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          ]),
        );
      });
    });
  });
});

describe('GET /hotels/:hotelId', () => {
  it('SHOULD respond with HTTP status 401 WHEN there is not a Token', async () => {
    const hotel = await createHotels();
    const result = await server.get(`/hotels/${hotel.id}`);
    expect(result.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('SHOULD respond with HTTP status 401 WHEN token is invalid', async () => {
    const hotel = await createHotels();
    const result = await server.get(`/hotels/${hotel.id}`).set('Authorization', 'Bearer invalidToken');
    expect(result.status).toEqual(httpStatus.UNAUTHORIZED);
  });
  describe('WHEN token is valid', () => {
    it('SHOULD respond with HTTP status 404 WHEN there is no Enrollment, Ticket or Hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotels();

      const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('SHOULD respond with HTTP status 402 WHEN there is not any paid ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const hotel = await createHotels();

      const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('SHOULD respond with HTTP status 402 WHEN there is non-remote ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createRemoteTicketType();
      const hotel = await createHotels();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('SHOULD respond with HTTP status 402 WHEN there is no ticket with hotel included', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createNotIncludedHotelTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotels();

      const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });
    describe('WHEN user has ticket paid, non-remote and hotel included', () => {
      it('SHOULD respond with HTTP status 404 WHEN hotel id is not found', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createIncludedHotelTicketType();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const response = await server.get(`/hotels/0`).set('Authorization', `Bearer ${token}`);
        expect(response.status).toEqual(httpStatus.NOT_FOUND);
      });
      it('SHOULD respond with HTTP status 200 WHEN hotel id exists', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createIncludedHotelTicketType();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotels();

        const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
        expect(response.status).toEqual(httpStatus.OK);
      });
      it('SHOULD respond with HTTP status 200 WHEN hotel is listed and with all fields', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createIncludedHotelTicketType();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotels();
        await createRoom(hotel.id);

        const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
        expect(response.body).toEqual(
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            image: expect.any(String),
            Rooms: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
                capacity: expect.any(Number),
                hotelId: expect.any(Number),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
              }),
            ]),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        );
      });
    });
  });
});
