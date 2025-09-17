import type { ScholarshipRecommendationOutput } from '@/ai/flows/personalized-scholarship-recommendations';
import { ObjectId } from 'mongodb';

export type User = {
    _id?: string | ObjectId;
    id?: string;
    name: string | null;
    email: string;
};

export type Profile = {
  _id?: string | ObjectId;
  userId?: string | ObjectId;
  academicInfo: string;
  financialInfo: string;
  achievementInfo: string;
  categoryInfo: string;
};

export type Scholarship = ScholarshipRecommendationOutput[0];

export type ApplicationStatus = 'Interested' | 'Applied' | 'Under Review' | 'Accepted' | 'Rejected' | 'Not a Fit';

export type ChecklistItem = {
    _id: string | ObjectId;
    task: string;
    completed: boolean;
};

export type Application = {
  _id?: string | ObjectId;
  userId?: string | ObjectId;
  scholarship: Scholarship;
  status: ApplicationStatus;
  checklist?: ChecklistItem[];
};
