'use client';

import useSWR from 'swr';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApplicationStatus, Application, ChecklistItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Loader2, ListChecks, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const statusColors: { [key in ApplicationStatus]: string } = {
  'Interested': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Applied': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Under Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Accepted': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Not a Fit': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
};

const statusOptions: ApplicationStatus[] = ['Interested', 'Applied', 'Under Review', 'Accepted', 'Rejected', 'Not a Fit'];

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function ApplicationsPage() {
  const { toast } = useToast();
  const { data: applications, error, mutate, isLoading } = useSWR<Application[]>('/api/applications', fetcher);

  const updateApplicationStatus = async (applicationId: string, status: ApplicationStatus) => {
    try {
      await axios.put(`/api/applications`, { applicationId, status });
      mutate(applications?.map(app => app._id === applicationId ? { ...app, status } : app), false);
      toast({
        title: "Status Updated",
        description: `Application status changed to "${status}".`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the application status.",
      });
    }
  };

  const updateChecklistItem = async (applicationId: string, checklistItemId: string, completed: boolean) => {
    try {
      await axios.put(`/api/applications/checklist`, { applicationId, checklistItemId, completed });
      mutate(
        applications?.map(app =>
          app._id === applicationId
            ? {
                ...app,
                checklist: app.checklist?.map(item =>
                  item._id === checklistItemId ? { ...item, completed } : item
                ),
              }
            : app
        ),
        false
      );
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Checklist Update Failed",
        description: "Could not update the checklist item.",
      });
    }
  }

  const getChecklistProgress = (checklist: ChecklistItem[] = []) => {
    if (checklist.length === 0) return 0;
    const completed = checklist.filter(item => item.completed).length;
    return (completed / checklist.length) * 100;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My Applications</h2>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
             <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                 <Skeleton className="h-6 w-20" />
                 <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error || !applications ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Could Not Load Applications</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            There was an error fetching your applications. Please try again later.
          </p>
        </div>
      ) : applications.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {applications.map((app) => (
            <Card key={app._id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{app.scholarship.scholarshipName}</CardTitle>
                <CardDescription>Amount: {app.scholarship.amount} | Deadline: {app.scholarship.deadline}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Select
                    value={app.status}
                    onValueChange={(value: ApplicationStatus) => updateApplicationStatus(app._id as string, value)}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {app.checklist && app.checklist.length > 0 && (
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="checklist">
                      <AccordionTrigger>
                        <div className='flex items-center gap-2'>
                          <ListChecks className="h-5 w-5" />
                          <span>Application Checklist ({Math.round(getChecklistProgress(app.checklist))}% complete)</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 pt-2">
                        {app.checklist.map(item => (
                          <div key={item._id as string} className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
                            <Checkbox 
                              id={item._id as string}
                              checked={item.completed}
                              onCheckedChange={(checked) => updateChecklistItem(app._id as string, item._id as string, !!checked)}
                            />
                            <Label htmlFor={item._id as string} className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {item.task}
                            </Label>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-4">
                <Badge className={`${statusColors[app.status]} border-0`}>{app.status}</Badge>
                <Button variant="outline" size="sm" asChild>
                  <a href={app.scholarship.link} target="_blank" rel="noopener noreferrer">
                    Visit Site <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Tracked Applications</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Start by finding scholarships and tracking them.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/scholarships">Find Scholarships</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
