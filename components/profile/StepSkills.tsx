'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ProfileFormValues } from './ProfileWizard';

export function StepSkills({ form }: { form: UseFormReturn<ProfileFormValues> }) {
  const [input, setInput] = useState('');
  const skills = form.watch('skills') ?? [];

  function addSkill() {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      form.setValue('skills', [...skills, trimmed], { shouldValidate: true });
    }
    setInput('');
  }

  function removeSkill(skill: string) {
    form.setValue('skills', skills.filter(s => s !== skill), { shouldValidate: true });
  }

  return (
    <FormField control={form.control} name="skills" render={() => (
      <FormItem>
        <FormLabel>Skills</FormLabel>
        <div className="flex gap-2">
          <FormControl>
            <Input
              placeholder="e.g. JavaScript"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            />
          </FormControl>
          <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map(skill => (
            <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
              {skill} ✕
            </Badge>
          ))}
        </div>
        <FormMessage />
      </FormItem>
    )} />
  );
}
