'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAppContext } from '@/context/AppContext';
import { ArrowRight, Bot, FileText, GraduationCap, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';

export default function DashboardPage() {
  const { profile, applications } = useAppContext();
  
  const heroImage = placeholderImages.find(img => img.id === 'dashboard-hero');

  const profileCompletion =
    (Object.values(profile).filter(Boolean).length / Object.keys(profile).length) * 100;

  const quickLinks = [
    { title: 'My Profile', description: 'Keep your profile updated for the best matches.', href: '/profile', icon: User },
    { title: 'Find Scholarships', description: 'Get personalized scholarship recommendations.', href: '/scholarships', icon: GraduationCap },
    { title: 'My Applications', description: 'Track your application status and deadlines.', href: '/applications', icon: FileText },
    { title: 'AI Assistant', description: 'Ask anything about scholarships and financial aid.', href: '/assistant', icon: Bot },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-4">
        <Card className="col-span-1 lg:col-span-2 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            <div className="p-8 space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-primary">Welcome to ScholarAI</h1>
              <p className="text-muted-foreground">Your journey to securing financial aid starts here. Let our AI-powered assistant guide you to the perfect scholarships.</p>
              <Button asChild>
                <Link href="/scholarships">
                  Find Scholarships <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            {heroImage && (
              <div className="h-full w-full hidden md:block">
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={600}
                  height={400}
                  data-ai-hint={heroImage.imageHint}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>
        </Card>
        
        <div className="grid gap-4 md:grid-cols-2">
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(profileCompletion)}%</div>
              <Progress value={profileCompletion} className="mt-2 h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tracked Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
              <p className="text-xs text-muted-foreground">
                {applications.filter(a => a.status === 'Applied').length} submitted
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {quickLinks.map((link) => (
             <Card key={link.href} className="hover:bg-muted/50 transition-colors">
                <Link href={link.href} className="block h-full">
                 <CardHeader className="flex flex-row items-center gap-4">
                   <div className="bg-primary/10 p-3 rounded-lg">
                     <link.icon className="h-6 w-6 text-primary" />
                   </div>
                   <div>
                     <CardTitle>{link.title}</CardTitle>
                     <CardDescription>{link.description}</CardDescription>
                   </div>
                 </CardHeader>
                </Link>
             </Card>
           ))}
        </div>
      </div>
    </div>
  );
}
