'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@/lib/types';
import { User, Book, DollarSign, Award } from 'lucide-react';

const formSchema = z.object({
  academicInfo: z.string().min(10, 'Please provide more details about your academic background.'),
  financialInfo: z.string().min(10, 'Please provide more details about your financial situation.'),
  achievementInfo: z.string().min(10, 'Please list some of your achievements.'),
  categoryInfo: z.string().min(10, 'Please provide some personal background information.'),
});

export default function ProfilePage() {
  const { profile, setProfile } = useAppContext();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: profile,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setProfile(values as Profile);
    toast({
      title: 'Profile Updated',
      description: 'Your information has been saved successfully.',
    });
  }

  const fields = [
    { name: 'academicInfo', label: 'Academic Information', description: 'Include your GPA, major, school, and academic goals.', icon: Book },
    { name: 'financialInfo', label: 'Financial Background', description: 'Describe your family income, financial needs, and any special circumstances.', icon: DollarSign },
    { name: 'achievementInfo', label: 'Achievements & Activities', description: 'List your awards, honors, extracurricular activities, and volunteer work.', icon: Award },
    { name: 'categoryInfo', label: 'Personal Background', description: 'Share demographic information, first-generation status, or any other relevant personal details.', icon: User },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>
            This information will be used to find scholarships that match your profile. The more details you provide, the better the recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {fields.map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name as keyof Profile}
                  render={({ field: formField }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                         <field.icon className="h-5 w-5 text-muted-foreground" />
                         <FormLabel className="text-lg">{field.label}</FormLabel>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder={`E.g., ${field.description}`}
                          className="min-h-[100px]"
                          {...formField}
                        />
                      </FormControl>
                      <FormDescription>{field.description}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <Button type="submit">Save Profile</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
