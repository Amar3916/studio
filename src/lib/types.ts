import type { ScholarshipRecommendationOutput } from '@/ai/flows/personalized-scholarship-recommendations';

export type Profile = {
  academicInfo: string;
  financialInfo: string;
  achievementInfo: string;
  categoryInfo: string;
};

export type Scholarship = ScholarshipRecommendationOutput[0];

export type ApplicationStatus = 'Interested' | 'Applied' | 'Under Review' | 'Accepted' | 'Rejected' | 'Not a Fit';

export type Application = {
  scholarship: Scholarship;
  status: ApplicationStatus;
};
