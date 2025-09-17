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
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@/lib/types';
import { User, Book, DollarSign, Award, Loader2 } from 'lucide-react';
import useSWR, { useSWRConfig } from 'swr';
import axios from 'axios';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  academicInfo: z.string().min(10, 'Please provide more details about your academic background.').or(z.literal('')),
  financialInfo: z.string().min(10, 'Please provide more details about your financial situation.').or(z.literal('')),
  achievementInfo: z.string().min(10, 'Please list some of your achievements.').or(z.literal('')),
  categoryInfo: z.string().min(10, 'Please provide some personal background information.').or(z.literal('')),
});

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function ProfilePage() {
  const { toast } = useToast();
  const { data: profile, error, isLoading } = useSWR<Profile>('/api/profile', fetcher);
  const { mutate } = useSWRConfig();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      academicInfo: '',
      financialInfo: '',
      achievementInfo: '',
      categoryInfo: '',
    },
  });
  
  useEffect(() => {
    if (profile) {
      form.reset(profile);
    }
  }, [profile, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data } = await axios.post('/api/profile', values);
      mutate('/api/profile', data, false);
      toast({
        title: 'Profile Updated',
        description: 'Your information has been saved successfully.',
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not save your profile. Please try again.',
      });
    }
  }

  const fields = [
    { name: 'academicInfo', label: 'Academic Information', description: 'Include your GPA, major, school, and academic goals.', icon: Book },
    { name: 'financialInfo', label: 'Financial Background', description: 'Describe your family income, financial needs, and any special circumstances.', icon: DollarSign },
    { name: 'achievementInfo', label: 'Achievements & Activities', description: 'List your awards, honors, extracurricular activities, and volunteer work.', icon: Award },
    { name: 'categoryInfo', label: 'Personal Background', description: 'Share demographic information, first-generation status, or any other relevant personal details.', icon: User },
  ];

  if (isLoading) {
      return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    ))}
                    <Skeleton className="h-10 w-24" />
                </CardContent>
            </Card>
        </div>
      )
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Failed to load profile. Please try refreshing the page.</div>
  }

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

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
