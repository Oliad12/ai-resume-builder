'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { ProfileFormValues } from './ProfileWizard';

export function StepExperience({ form }: { form: UseFormReturn<ProfileFormValues> }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'experience',
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardContent className="pt-4 space-y-3">
            <FormField control={form.control} name={`experience.${index}.company`} render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl><Input placeholder="Ethio Telecom" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name={`experience.${index}.title`} render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl><Input placeholder="Software Engineer" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name={`experience.${index}.startDate`} render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl><Input type="month" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name={`experience.${index}.endDate`} render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date (optional)</FormLabel>
                  <FormControl><Input type="month" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name={`experience.${index}.description`} render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe your responsibilities and achievements..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
              Remove
            </Button>
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={() =>
        append({ company: '', title: '', startDate: '', description: '' })
      }>
        + Add Experience
      </Button>
    </div>
  );
}
