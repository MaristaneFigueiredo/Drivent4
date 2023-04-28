import { ApplicationError } from '@/protocols';

export function Forbidden(): ApplicationError {
  return {
    name: 'Forbidden',
    message: 'Forbidden!',
  };
}
