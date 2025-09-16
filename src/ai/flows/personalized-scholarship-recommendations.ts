'use server';
/**
 * @fileOverview Provides personalized scholarship recommendations based on a student's profile.
 *
 * - getScholarshipRecommendations - A function that takes student profile data and returns a list of personalized scholarship recommendations.
 * - ScholarshipRecommendationInput - The input type for the getScholarshipRecommendations function, representing the student's profile data.
 * - ScholarshipRecommendationOutput - The return type for the getScholarshipRecommendations function, representing the list of recommended scholarships.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the schema for student profile data (input)
const ScholarshipRecommendationInputSchema = z.object({
  academicInfo: z.string().describe('Academic information of the student, including GPA, major, and education level.'),
  financialInfo: z.string().describe('Financial background of the student, including family income and financial needs.'),
  achievementInfo: z.string().describe('Achievements of the student, including awards, honors, and extracurricular activities.'),
  categoryInfo: z.string().describe('Category of student, including demographic information and any special circumstances.'),
});
export type ScholarshipRecommendationInput = z.infer<typeof ScholarshipRecommendationInputSchema>;

// Define the schema for scholarship recommendations (output)
const ScholarshipRecommendationOutputSchema = z.array(z.object({
  scholarshipName: z.string().describe('Name of the scholarship.'),
  description: z.string().describe('Brief description of the scholarship.'),
  amount: z.string().describe('Amount of the scholarship.'),
  deadline: z.string().describe('Application deadline for the scholarship.'),
  link: z.string().describe('Link to the scholarship application page.'),
  matchScore: z.number().describe('AI calculates % fit between student profile and each scholarship.'),
}));
export type ScholarshipRecommendationOutput = z.infer<typeof ScholarshipRecommendationOutputSchema>;

// Define the main function to get scholarship recommendations
export async function getScholarshipRecommendations(input: ScholarshipRecommendationInput): Promise<ScholarshipRecommendationOutput> {
  return personalizedScholarshipRecommendationsFlow(input);
}

// Define the prompt for generating scholarship recommendations
const personalizedScholarshipRecommendationsPrompt = ai.definePrompt({
  name: 'personalizedScholarshipRecommendationsPrompt',
  input: {schema: ScholarshipRecommendationInputSchema},
  output: {schema: ScholarshipRecommendationOutputSchema},
  prompt: `You are an AI assistant specializing in providing personalized scholarship recommendations to students.

  Based on the student's profile data, identify relevant scholarships and financial aid opportunities.
  Provide a list of scholarships with their names, descriptions, amounts, deadlines, and application links. Also include match score, AI calculates % fit between student profile and each scholarship.

  Student Profile:
  Academic Information: {{{academicInfo}}}
  Financial Background: {{{financialInfo}}}
  Achievements: {{{achievementInfo}}}
  Category: {{{categoryInfo}}}

  Scholarship Recommendations:
  `,
});

// Define the Genkit flow for personalized scholarship recommendations
const personalizedScholarshipRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedScholarshipRecommendationsFlow',
    inputSchema: ScholarshipRecommendationInputSchema,
    outputSchema: ScholarshipRecommendationOutputSchema,
  },
  async input => {
    const {output} = await personalizedScholarshipRecommendationsPrompt(input);
    return output!;
  }
);
