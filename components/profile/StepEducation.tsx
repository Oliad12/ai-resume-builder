'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { ProfileFormValues } from './ProfileWizard';

export function StepEducation({ form }: { form: UseFormReturn<ProfileFormValues> }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'education',
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardContent className="pt-4 space-y-3">
            <FormField control={form.control} name={`education.${index}.institution`} render={({ field }) => (
              <FormItem>
                <FormLabel>Institution</FormLabel>
                <FormControl><Input placeholder="Addis Ababa University" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => (
              <FormItem>
                <FormLabel>Degree</FormLabel>
                <FormControl><Input placeholder="Bachelor of Science" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name={`education.${index}.fieldOfStudy`} render={({ field }) => (
              <FormItem>
                <FormLabel>Field of Study</FormLabel>
                <FormControl><Input placeholder="Computer Science" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name={`education.${index}.startYear`} render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Year</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2018" {...field}
                      onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name={`education.${index}.endYear`} render={({ field }) => (
                <FormItem>
                  <FormLabel>End Year (optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2022" {...field}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
              Remove
            </Button>
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={() =>
        append({ institution: '', degree: '', fieldOfStudy: '', startYear: new Date().getFullYear() })
      }>
        + Add Education
      </Button>
    </div>
  );
}
