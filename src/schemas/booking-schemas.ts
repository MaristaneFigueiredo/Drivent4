import Joi from 'joi';
import { BookingBodyInput } from '@/services';

export const bookingSchema = Joi.object<BookingBodyInput>({
  roomId: Joi.number().required(),
});
