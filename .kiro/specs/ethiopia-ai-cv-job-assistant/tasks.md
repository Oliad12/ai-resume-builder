# Implementation Plan: Ethiopia AI CV & Job Assistant

## Overview

Incremental implementation of the PWA as a single Next.js (App Router) project with TypeScript, Tailwind CSS, shadcn/ui, Clerk authentication, Prisma ORM, and PostgreSQL. All API logic lives in Next.js Route Handlers under `app/api/`. Tasks are ordered so each step integrates into the previous one, ending with a fully wired application.

## Tasks

- [-] 1. Scaffold Next.js project with core dependencies
  - Initialize a Next.js 14+ project with TypeScript and the App Router (`npx create-next-app@latest --typescript --tailwind --app`)
  - Install and configure shadcn/ui (`npx shadcn-ui@latest init`); add components: `button`, `input`, `textarea`, `form`, `card`, `badge`, `skeleton`, `alert`, `dialog`, `select`
  - Install `@clerk/nextjs` and add `ClerkProvider` to `app/layout.tsx`; create `middleware.ts` to protect all routes under `/dashboard`
  - Install `next-intl` (or `react-i18next`); create `en` and `am` locale stub files under `messages/`
  - Set up Vitest with `@testing-library/react` and `fast-check`
  - _Requirements: 5.1, 6.5_

- [x] 2. Prisma schema and database setup
  - [x] 2.1 Install Prisma, initialise with `npx prisma init`, and write the schema for `Profile` and `Document` models
    - `Profile`: `id` (UUID PK), `clerkUserId` (unique), `personal` (Json), `education` (Json), `experience` (Json), `skills` (String[]), `updatedAt`
    - `Document`: `id` (UUID PK), `clerkUserId` (indexed), `type`, `language`, `content` (Json), `pdfStorageKey` (optional), `jobTitle` (optional), `company` (optional), `createdAt`
    - Run `npx prisma migrate dev --name init` to apply the migration
    - _Requirements: 1.4, 7.6, 8.1_

  - [x] 2.2 Write property test for Prisma schema round-trip
    - **Property 2: Profile persistence round-trip**
    - **Validates: Requirements 1.4, 1.5**

- [ ] 3. Clerk authentication setup
  - [x] 3.1 Configure Clerk environment variables (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, sign-in/sign-up redirect URLs)
    - Add `<SignIn />` page at `app/sign-in/[[...sign-in]]/page.tsx` and `<SignUp />` page at `app/sign-up/[[...sign-up]]/page.tsx` using Clerk's built-in components
    - Configure `middleware.ts` with `clerkMiddleware()` to protect `/dashboard` and all `/api/` routes; public routes: `/`, `/sign-in`, `/sign-up`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 3.2 Write property test for registration and authentication round-trip
    - **Property 11: Registration and authentication round-trip**
    - **Validates: Requirements 7.1, 7.3**

  - [ ]* 3.3 Write property test for duplicate email rejection
    - **Property 12: Duplicate email registration is rejected**
    - **Validates: Requirements 7.2**

  - [ ]* 3.4 Write property test for incorrect credentials not revealing which field failed
    - **Property 13: Incorrect credentials do not reveal which field failed**
    - **Validates: Requirements 7.4**

  - [ ]* 3.5 Write unit test for Clerk middleware — unauthenticated requests to `/dashboard` are redirected to `/sign-in`
    - _Requirements: 7.3, 7.5_

- [x] 4. Checkpoint — auth and database layer
  - Ensure all auth and schema tests pass, ask the user if questions arise.

- [x] 5. Profile — Route Handlers
  - [x] 5.1 Implement `GET /api/profile` — call `auth()` to get `userId`; query `prisma.profile.findUnique({ where: { clerkUserId: userId } })`; return `404` if not found
    - _Requirements: 1.4, 1.5_

  - [x] 5.2 Implement `PUT /api/profile` — call `auth()` to get `userId`; validate request body server-side; upsert via `prisma.profile.upsert`; return `422` with field-level error map on invalid input
    - _Requirements: 1.2, 1.3, 1.4_

  - [ ]* 5.3 Write property test for profile persistence round-trip via Route Handler
    - **Property 2: Profile persistence round-trip**
    - **Validates: Requirements 1.4, 1.5**

  - [ ]* 5.4 Write property test for validation rejecting invalid input with field-level errors
    - **Property 1: Validation rejects invalid input with field-level errors**
    - **Validates: Requirements 1.2, 1.3**

- [-] 6. Profile — frontend
  - [ ] 6.1 Build `ProfileWizard` component with four steps using shadcn/ui `Form`, `Input`, `Card`: `StepPersonal`, `StepEducation`, `StepExperience`, `StepSkills`
    - Each step validates required fields before advancing; display descriptive inline errors per field using shadcn/ui `FormMessage`
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 6.2 On wizard completion call `PUT /api/profile`; on mount call `GET /api/profile` and pre-populate all form fields
    - _Requirements: 1.4, 1.5_

  - [ ]* 6.3 Write unit tests for `Validator` — required field missing, invalid email format, invalid date range
    - _Requirements: 1.2, 1.3_

- [ ] 7. Checkpoint — profile layer
  - Ensure all profile tests pass, ask the user if questions arise.

- [ ] 8. AI Engine adapter
  - [ ] 8.1 Implement the `AIEngine` interface with an OpenAI/Gemini adapter
    - Enforce 15-second timeout per request; on timeout throw typed `AITimeoutError`; on provider error throw `AIProviderError`
    - Accept `language: 'en' | 'am'` parameter and include it in the LLM prompt
    - _Requirements: 2.6, 3.6, 5.3, 5.4_

  - [ ] 8.2 Implement a `MockAIEngine` that returns deterministic structured responses for use in tests
    - _Requirements: 2.1, 3.1, 4.1_

- [ ] 9. CV generation — Route Handlers
  - [ ] 9.1 Implement `POST /api/cv/generate` — call `auth()` for `userId`; call `AIEngine.generateCV`; persist via `prisma.document.create`; return document JSON
    - Return `503` on `AITimeoutError`, `502` on `AIProviderError`
    - _Requirements: 2.1, 2.6_

  - [ ]* 9.2 Write property test for generated CV containing all required sections
    - **Property 3: Generated CV contains all required sections**
    - **Validates: Requirements 2.1, 2.3**

  - [ ]* 9.3 Write property test for regenerated CV reflecting updated profile
    - **Property 4: Regenerated CV reflects updated profile**
    - **Validates: Requirements 2.5**

  - [ ] 9.4 Implement `GET /api/cv/[id]` — query `prisma.document.findUnique`; verify `clerkUserId` matches `auth().userId`; return `403` on mismatch, `404` if not found
    - _Requirements: 8.3, 8.5_

  - [ ] 9.5 Implement `GET /api/cv/[id]/pdf` — render CV content to PDF via Puppeteer; set `Content-Type: application/pdf`
    - _Requirements: 2.4_

  - [ ]* 9.6 Write unit test for PDF Route Handler — verify `Content-Type: application/pdf` header
    - _Requirements: 2.4_

- [ ] 10. CV generation — frontend
  - [ ] 10.1 Build `CVBuilder` component — trigger `POST /api/cv/generate`, render CV preview using shadcn/ui `Card`, show `Skeleton` during loading, show `Alert` with retry button on error
    - Display generated CV within 10 seconds; show error message with retry on timeout
    - _Requirements: 2.2, 2.5, 2.6, 6.4_

  - [ ] 10.2 Add "Download PDF" `Button` that calls `GET /api/cv/[id]/pdf` and triggers browser download
    - _Requirements: 2.4_

- [ ] 11. Cover letter generation — Route Handlers
  - [ ] 11.1 Implement `POST /api/cover-letter/generate` — accept `jobTitle` and `company` in request body; call `auth()` for `userId`; call `AIEngine.generateCoverLetter`; persist via `prisma.document.create`; return document JSON
    - Return `503`/`502` on AI errors; each generation creates a new document without overwriting previous ones
    - _Requirements: 3.1, 3.5, 3.6_

  - [ ]* 11.2 Write property test for cover letter referencing profile skills and experience
    - **Property 5: Cover letter references profile skills and experience**
    - **Validates: Requirements 3.1, 3.3**

  - [ ] 11.3 Implement `GET /api/cover-letter/[id]` and `GET /api/cover-letter/[id]/pdf`
    - Enforce ownership check via `clerkUserId` (`403`) and not-found (`404`)
    - _Requirements: 3.4, 8.3, 8.5_

- [ ] 12. Cover letter generation — frontend
  - [ ] 12.1 Build `CoverLetterGenerator` component — shadcn/ui `Input` fields for job title and company name; trigger generation; render result in `Card`; show `Skeleton` loading and `Alert` retry on error
    - _Requirements: 3.1, 3.2, 3.6, 6.4_

  - [ ] 12.2 Add "Download PDF" `Button` for cover letters
    - _Requirements: 3.4_

- [ ] 13. Checkpoint — document generation layer
  - Ensure all CV and cover letter tests pass, ask the user if questions arise.

- [ ] 14. Job & skill recommendations — Route Handler
  - [ ] 14.1 Implement `GET /api/recommendations` — call `auth()` for `userId`; load profile via Prisma; call `AIEngine.generateRecommendations`; return at least 5 job recommendations and at least 3 upskilling resources when profile has skills or experience; return prompt-to-complete-profile response when profile is empty
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [ ]* 14.2 Write property test for job recommendations meeting minimum count for non-empty profiles
    - **Property 7: Job recommendations meet minimum count for non-empty profiles**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 14.3 Write property test for recommendations reflecting updated profile
    - **Property 8: Recommendations reflect updated profile**
    - **Validates: Requirements 4.4**

  - [ ]* 14.4 Write unit test for upskilling resources returned when profile skills don't match high-demand categories
    - _Requirements: 4.3_

- [ ] 15. Job & skill recommendations — frontend
  - [ ] 15.1 Build `JobRecommender` component — display each recommendation with title, description, and match reason using shadcn/ui `Card` and `Badge`; display upskilling resources; show "complete your profile" prompt when profile is empty
    - Refresh recommendations when profile is updated
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [ ] 16. Document management — Route Handlers
  - [ ] 16.1 Implement `GET /api/documents` — call `auth()` for `userId`; query `prisma.document.findMany({ where: { clerkUserId: userId } })`; return type, `createdAt`, and `jobTitle` for each document
    - _Requirements: 8.1, 8.2_

  - [ ]* 16.2 Write property test for document list entries containing required metadata
    - **Property 15: Document list entries contain required metadata**
    - **Validates: Requirements 8.2**

  - [ ]* 16.3 Write property test for document collection growing with each generation
    - **Property 6: Document collection grows with each generation**
    - **Validates: Requirements 3.5, 8.1, 8.3**

  - [ ] 16.4 Implement `DELETE /api/documents/[id]` — verify `clerkUserId` ownership; call `prisma.document.delete`; remove PDF from storage; return `204`
    - _Requirements: 8.4_

  - [ ]* 16.5 Write property test for deleted documents being inaccessible
    - **Property 16: Deleted documents are inaccessible**
    - **Validates: Requirements 8.4**

  - [ ]* 16.6 Write property test for documents being isolated between users
    - **Property 17: Documents are isolated between users**
    - **Validates: Requirements 8.5**

- [ ] 17. Document management — frontend
  - [ ] 17.1 Build `DocumentManager` component — list all documents with type, date, and job title using shadcn/ui `Card` and `Badge`; open document preview on selection via `Dialog`; confirm and call delete endpoint on deletion
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 18. Language support
  - [ ] 18.1 Populate `en` and `am` locale bundles with all UI label keys used across all components
    - _Requirements: 5.1, 5.2_

  - [ ]* 18.2 Write property test for all translatable UI strings having Amharic translations
    - **Property 10: All translatable UI strings have Amharic translations**
    - **Validates: Requirements 5.2**

  - [ ] 18.3 Wire `LanguageSelector` toggle to the i18n `changeLanguage()` function — language switches instantly without full page reload; pass active language to all AI generation API calls
    - _Requirements: 5.5_

  - [ ]* 18.4 Write property test for generated documents respecting active language setting
    - **Property 9: Generated documents respect active language setting**
    - **Validates: Requirements 5.3, 5.4**

  - [ ]* 18.5 Write unit test for language selector — switching locale does not trigger a full page reload
    - _Requirements: 5.5_

- [ ] 19. Mobile-first and performance optimizations
  - [ ] 19.1 Apply Tailwind responsive utilities across all pages and components; verify layout on narrow viewports (min-width 320px)
    - _Requirements: 6.1_

  - [ ] 19.2 Use `next/image` for all images, `next/font` for fonts, and verify Next.js automatic code splitting keeps initial payload < 500KB; add `@next/bundle-analyzer` to CI
    - _Requirements: 6.2, 6.3_

  - [ ] 19.3 Add PWA support via `next-pwa` for shell caching; ensure app loads without native install
    - _Requirements: 6.5_

  - [ ] 19.4 Ensure all async operations (AI calls, profile load, document fetch) render a visible shadcn/ui `Skeleton` or `Alert` loading indicator
    - _Requirements: 6.4_

- [ ] 20. Final checkpoint — full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use `fast-check` with a minimum of 100 iterations per run
- Each property test must include the comment tag: `Feature: ethiopia-ai-cv-job-assistant, Property N: <property_text>`
- AI-dependent tests use `MockAIEngine` (task 8.2) — no live API calls in unit/property tests
- Performance requirements (6.2, 6.3) are validated via Lighthouse CI and `@next/bundle-analyzer`, not unit tests
- Clerk handles all auth flows — no custom JWT, bcrypt, or refresh token code is needed
