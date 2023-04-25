import { TicketStatus, Ticket, Payment } from '@prisma/client';

export type ApplicationError = {
  name: string;
  message: string;
};

export type ViaCEPAddress = {
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
};

export type AddressEnrollment = {
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  error?: string;
};

export type RequestError = {
  status: number;
  data: object | null;
  statusText: string;
  name: string;
  message: string;
};

export type TicketInput = Omit<Ticket, 'id' | 'createAt' | 'updateAt'>;

export type TicketResponse = {
  id?: number;
  name?: string;
  createAt?: Date;
  updateAt?: Date;
  status?: string | TicketStatus; //RESERVED | PAID
  ticketTypeId?: number;
  enrollmentId?: number;
  TicketType: {
    id?: number;
    name?: string;
    price?: number;
    isRemote?: boolean;
    includesHotel?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  };
};


export type PaymentInput = {  
  ticketId:number,
  cardData:{    
    issuer: string,
    number: number,
    name: string,
    expirationDate: Date,
    cvv: number    
  }
}