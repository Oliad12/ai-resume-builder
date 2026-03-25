import { PrismaClient } from '@prisma/client';

export type PersonalInfo = {
  fullName: string;
  phone: string;
  email: string;
  location: string;
  linkedIn?: string;
};

export type EducationEntry = {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
};

export type ExperienceEntry = {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  description: string;
};

export type ProfileData = {
  clerkUserId: string;
  personal: PersonalInfo;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: string[];
};

export async function saveProfile(prisma: PrismaClient, data: ProfileData) {
  return prisma.profile.upsert({
    where: { clerkUserId: data.clerkUserId },
    update: {
      personal: data.personal,
      education: data.education,
      experience: data.experience,
      skills: data.skills,
    },
    create: {
      clerkUserId: data.clerkUserId,
      personal: data.personal,
      education: data.education,
      experience: data.experience,
      skills: data.skills,
    },
  });
}

export async function loadProfile(prisma: PrismaClient, clerkUserId: string) {
  return prisma.profile.findUnique({ where: { clerkUserId } });
}
