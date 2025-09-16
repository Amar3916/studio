'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { getScholarshipRecommendations } from '@/lib/actions';
import { Scholarship } from '@/lib/types';
import { ArrowRight, Lightbulb, GraduationCap, DollarSign, Calendar, Percent, ExternalLink } from 'lucide-react';

export default function ScholarshipsPage() {
  const { profile, addApplication } = useAppContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Scholarship[]>([]);

  const isProfileComplete = Object.values(profile).every(value => value && value.length > 10);

  const handleFindScholarships = async () => {
    setLoading(true);
    setRecommendations([]);
    try {
      const result = await getScholarshipRecommendations(profile);
      if (result) {
        setRecommendations(result);
      } else {
        toast({
          variant: 'destructive',
          title: 'No Recommendations Found',
          description: 'We couldn\'t find any scholarships matching your profile at this time.',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: 'Failed to fetch scholarship recommendations. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTrackApplication = (scholarship: Scholarship) => {
    addApplication(scholarship);
    toast({
      title: 'Application Added',
      description: `"${scholarship.scholarshipName}" is now being tracked.`,
      action: <Button variant="link" size="sm" asChild><Link href="/applications">View</Link></Button>
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Find Scholarships</h2>
        {isProfileComplete && (
          <Button onClick={handleFindScholarships} disabled={loading}>
            {loading ? 'Searching...' : 'Get AI Recommendations'}
          </Button>
        )}
      </div>

      {!isProfileComplete ? (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Complete Your Profile!</AlertTitle>
          <AlertDescription>
            To get personalized scholarship recommendations, you need to complete your profile first.
            <Button asChild variant="link" className="px-1">
              <Link href="/profile">Go to Profile <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {recommendations.map((scholarship, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-xl">{scholarship.scholarshipName}</CardTitle>
                  <Badge variant={scholarship.matchScore > 80 ? 'default' : 'secondary'} className="flex-shrink-0">
                    <Percent className="mr-1 h-3 w-3" /> {scholarship.matchScore}% Match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <p className="text-muted-foreground text-sm">{scholarship.description}</p>
                <div className="flex items-center text-sm">
                  <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                  <span className="font-semibold">{scholarship.amount}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-red-500" />
                  <span>Deadline: {scholarship.deadline}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" asChild className="flex-1">
                  <a href={scholarship.link} target="_blank" rel="noopener noreferrer">
                    Visit Site <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button className="flex-1" onClick={() => handleTrackApplication(scholarship)}>
                  Track Application
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
         <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Ready to Find Scholarships?</h3>
            <p className="mt-1 text-sm text-muted-foreground">Click the button to get personalized recommendations from our AI.</p>
            <Button className="mt-6" onClick={handleFindScholarships} disabled={loading}>
                {loading ? 'Searching...' : 'Get AI Recommendations'}
            </Button>
        </div>
      )}
    </div>
  );
}
