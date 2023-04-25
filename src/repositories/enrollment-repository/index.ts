import { Enrollment } from '@prisma/client';
import { prisma } from '@/config';

async function findWithAddressByUserId(userId: number) {
  return prisma.enrollment.findFirst({
    where: { userId },
    include: {
      Address: true,
    },
  });
}

async function getEnrollmentByUserId(userId: number) {
  return prisma.enrollment.findFirst({
    where: { userId },
  });
}

async function upsert(
  userId: number,
  createdEnrollment: CreateEnrollmentParams,
  updatedEnrollment: UpdateEnrollmentParams,
) {
  return prisma.enrollment.upsert({
    where: {
      userId,
    },
    create: createdEnrollment,
    update: updatedEnrollment,
  });
}

export type CreateEnrollmentParams = Omit<Enrollment, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEnrollmentParams = Omit<CreateEnrollmentParams, 'userId'>;


async function getEnrollmentById(id: number) {
  return prisma.enrollment.findFirst({
    where: { id },
  });
}


const enrollmentRepository = {
  findWithAddressByUserId,
  upsert,
  getEnrollmentByUserId,
  getEnrollmentById,

};

export default enrollmentRepository;
