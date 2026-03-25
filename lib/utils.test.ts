import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { cn } from './utils';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('deduplicates tailwind classes (last wins)', () => {
    const result = cn('p-4', 'p-2');
    expect(result).toBe('p-2');
  });

  // Feature: ethiopia-ai-cv-job-assistant, Property: cn always returns a string
  it('always returns a string for any combination of inputs', () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(fc.string(), fc.constant(undefined), fc.constant(false), fc.constant(null))),
        (inputs) => {
          // @ts-expect-error testing with mixed types
          const result = cn(...inputs);
          expect(typeof result).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });
});
