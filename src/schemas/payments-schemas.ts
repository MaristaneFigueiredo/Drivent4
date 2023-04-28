import Joi from 'joi';
import { CreatePaymentsParams } from '@/services';

export const paymentsSchema = Joi.object<CreatePaymentsParams>({
  ticketId: Joi.number().required(),
  cardData: Joi.object({
    issuer: Joi.string().required(),
    number: Joi.number().required(),
    name: Joi.string().required(),
    expirationDate: Joi.string().required(),
    cvv: Joi.number().integer().required(),
  }).required(),
});
