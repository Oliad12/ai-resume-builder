import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const personalSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(7),
  email: z.string().email(),
  location: z.string().min(1),
  linkedIn: z.string().url().optional(),
});

const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  fieldOfStudy: z.string().min(1),
  startYear: z.number().int().min(1900).max(2100),
  endYear: z.number().int().min(1900).max(2100).optional(),
});

const experienceSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  description: z.string().min(1),
});

const profileBodySchema = z.object({
  personal: personalSchema,
  education: z.array(educationSchema),
  experience: z.array(experienceSchema),
  skills: z.array(z.string().min(1)),
});

// ---------------------------------------------------------------------------
// GET /api/profile
// ---------------------------------------------------------------------------

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { clerkUserId: userId },
  });

  if (!profile) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json(profile);
}

// ---------------------------------------------------------------------------
// PUT /api/profile
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const parsed = profileBodySchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'VALIDATION_ERROR', details }, { status: 422 });
  }

  const { personal, education, experience, skills } = parsed.data;

  const profile = await prisma.profile.upsert({
    where: { clerkUserId: userId },
    update: { personal, education, experience, skills },
    create: { clerkUserId: userId, personal, education, experience, skills },
  });

  return NextResponse.json(profile);
}
