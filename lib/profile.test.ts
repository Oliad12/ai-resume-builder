// Feature: ethiopia-ai-cv-job-assistant, Property 2: Profile persistence round-trip
import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { saveProfile, loadProfile, type ProfileData } from './profile';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const personalArbitrary = () =>
  fc.record({
    fullName: fc.string({ minLength: 1, maxLength: 80 }),
    phone: fc.stringMatching(/^\+?[0-9]{7,15}$/),
    email: fc.emailAddress(),
    location: fc.string({ minLength: 1, maxLength: 100 }),
    linkedIn: fc.option(fc.webUrl(), { nil: undefined }),
  });

const educationEntryArbitrary = () =>
  fc.record({
    institution: fc.string({ minLength: 1, maxLength: 100 }),
    degree: fc.string({ minLength: 1, maxLength: 80 }),
    fieldOfStudy: fc.string({ minLength: 1, maxLength: 80 }),
    startYear: fc.integer({ min: 1970, max: 2024 }),
    endYear: fc.option(fc.integer({ min: 1970, max: 2025 }), { nil: undefined }),
  });

const experienceEntryArbitrary = () =>
  fc.record({
    company: fc.string({ minLength: 1, maxLength: 100 }),
    title: fc.string({ minLength: 1, maxLength: 100 }),
    startDate: fc.date({ min: new Date('2000-01-01'), max: new Date('2024-01-01') }).map(
      (d) => d.toISOString().slice(0, 10)
    ),
    endDate: fc.option(
      fc.date({ min: new Date('2000-01-01'), max: new Date('2025-01-01') }).map(
        (d) => d.toISOString().slice(0, 10)
      ),
      { nil: undefined }
    ),
    description: fc.string({ minLength: 1, maxLength: 500 }),
  });

const profileDataArbitrary = () =>
  fc.record({
    clerkUserId: fc.uuid(),
    personal: personalArbitrary(),
    education: fc.array(educationEntryArbitrary(), { minLength: 0, maxLength: 5 }),
    experience: fc.array(experienceEntryArbitrary(), { minLength: 0, maxLength: 5 }),
    skills: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 0, maxLength: 20 }),
  });

// ---------------------------------------------------------------------------
// Mock Prisma client
// ---------------------------------------------------------------------------

function makeMockPrisma() {
  const store = new Map<string, unknown>();

  const upsert = vi.fn(async ({ where, create, update }: {
    where: { clerkUserId: string };
    create: ProfileData;
    update: Omit<ProfileData, 'clerkUserId'>;
  }) => {
    const existing = store.get(where.clerkUserId);
    const record = existing
      ? { ...(existing as object), ...update, clerkUserId: where.clerkUserId }
      : { ...create, id: crypto.randomUUID(), updatedAt: new Date() };
    store.set(where.clerkUserId, record);
    return record;
  });

  const findUnique = vi.fn(async ({ where }: { where: { clerkUserId: string } }) => {
    return store.get(where.clerkUserId) ?? null;
  });

  return {
    profile: { upsert, findUnique },
    _store: store,
  } as unknown as ReturnType<typeof makeMockPrisma>;
}

// ---------------------------------------------------------------------------
// Property test
// ---------------------------------------------------------------------------

describe('Profile persistence round-trip (Property 2)', () => {
  it('saving and loading a profile returns equivalent field values', async () => {
    await fc.assert(
      fc.asyncProperty(profileDataArbitrary(), async (profileData: ProfileData) => {
        const prisma = makeMockPrisma();

        await saveProfile(prisma as never, profileData);
        const loaded = await loadProfile(prisma as never, profileData.clerkUserId);

        expect(loaded).not.toBeNull();
        expect(loaded!.clerkUserId).toBe(profileData.clerkUserId);
        expect(loaded!.personal).toEqual(profileData.personal);
        expect(loaded!.education).toEqual(profileData.education);
        expect(loaded!.experience).toEqual(profileData.experience);
        expect(loaded!.skills).toEqual(profileData.skills);
      }),
      { numRuns: 100 }
    );
  });

  it('updating a profile overwrites previous values', async () => {
    await fc.assert(
      fc.asyncProperty(
        profileDataArbitrary(),
        profileDataArbitrary(),
        async (first: ProfileData, second: ProfileData) => {
          const clerkUserId = first.clerkUserId;
          const prisma = makeMockPrisma();

          await saveProfile(prisma as never, { ...first, clerkUserId });
          await saveProfile(prisma as never, { ...second, clerkUserId });
          const loaded = await loadProfile(prisma as never, clerkUserId);

          expect(loaded).not.toBeNull();
          expect(loaded!.personal).toEqual(second.personal);
          expect(loaded!.skills).toEqual(second.skills);
        }
      ),
      { numRuns: 100 }
    );
  });
});
