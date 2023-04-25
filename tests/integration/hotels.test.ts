import supertest from 'supertest';
import httpStatus from 'http-status';
import app, { init } from '@/app';
import { TicketStatus } from '@prisma/client';
import { User } from '@prisma/client';
import { cleanDb, generateValidToken } from '../helpers';

import { createEnrollmentWithAddress, createUser, createTicketType, createTicket, createRemoteTicketType, createNotIncludedHotelTicketType, createIncludedHotelTicketType, createHotels, createRoom } from '../factories';


const server = supertest(app)

beforeAll( async () =>{
    await init()
    await cleanDb()
})

beforeEach(async () => {
    await cleanDb();
});

describe('GET /hotels', () => {
   
    it('should return with status 401 without token', async () => {
        const response = await server.get('/hotels')
        expect(response.status).toEqual(httpStatus.UNAUTHORIZED)
    })

    it('should return with status 401 with token invalid', async () => {
        const response = await server.get('/hotels').set('Authorization', 'Bearer invalidToken')
        expect(response.status).toEqual(httpStatus.UNAUTHORIZED)
    })

     describe('When token is valid', () => {

        it('should return with status 404 WHEN Enrollment, ticket or Hotel not exits', async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);            
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        })

        it('should return with status 402 WHEN there is NOT paid ticket', async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);            
            expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
        })

        it('should return with status 402 WHEN there is NOT remote ticket', async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createRemoteTicketType();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);            
            expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
        })

        it('should return with status 402 WHEN there is NOT ticket with hotel', async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createNotIncludedHotelTicketType();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);            
            expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
        })
        
        describe('When ticket has paid, event presencial and with hotel', () =>{

            it('should return with status 404 WHEN there is NOT hotel listed', async() => {
                const user = await createUser()
                const token = await generateValidToken(user)
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createIncludedHotelTicketType(); 
                await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);


                const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);                           
                expect(response.status).toEqual(httpStatus.NOT_FOUND);

            } )
            

            it('should return all hotels with status 200', async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createIncludedHotelTicketType();
                await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
                await createHotels();
        
  
                const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
          
                expect(response.status).toBe(httpStatus.OK);                
                expect(response.body).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            id: expect.any(Number),
                            name: expect.any(String),
                            image: expect.any(String),
                            createdAt: expect.any(String),
                            updatedAt: expect.any(String),

                        })
                    ])
                  
                );
            }); 

        })
    })
}

)


 describe('GET /hotels/:hotelId', () => {
    
    it('should return with status 401 without token', async () => {
        const response = await server.get('/hotels/1')
        expect(response.status).toEqual(httpStatus.UNAUTHORIZED)
    })

    it('should return with status 401 with token invalid', async () => {
        const response = await server.get('/hotels/1').set('Authorization', 'Bearer invalidToken')
        expect(response.status).toEqual(httpStatus.UNAUTHORIZED)
    })
    
    
    describe('When token is valid', () => {
        it('should return with status 404 WHEN Enrollment, ticket or Hotel not exits', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotels();
      
            const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
          });          

  
        it('should return with status 402 WHEN there is NOT paid ticket', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            const hotel = await createHotels();

           // console.log('hotel.id', hotel.id)
      
            const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
        });   

        it('should return with status 402 WHEN there is NOT remote ticket', async () => {
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

        it('should return with status 402 WHEN there is NOT ticket with hotel', async () => {
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
        
         describe('When ticket has paid, event presencial and with hotel', () => {
            
            it('should return  with HTTP status 404 WHEN hotel id is not found', async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createIncludedHotelTicketType();
                await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        
                const response = await server.get('/hotels/0').set('Authorization', `Bearer ${token}`);
                expect(response.status).toEqual(httpStatus.NOT_FOUND);
            }); 
 
             it('should return with HTTP status 200 WHEN hotel id exists', async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createIncludedHotelTicketType();
                await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
                const hotel = await createHotels();
        
                const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
                expect(response.status).toEqual(httpStatus.OK);
              });

            it('should return hotel with rooms with status 200', async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createIncludedHotelTicketType();
                await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
                const hotel = await createHotels();
                const room = await createRoom(hotel.id);

                       
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

         })
      

    })
  
}) 