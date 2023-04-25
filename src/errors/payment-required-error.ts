import { ApplicationError } from '@/protocols';

export function paymentNotFound(): ApplicationError {
  return {
    name: 'paymentNotFound',
    message: 'payment required',
  };
}
