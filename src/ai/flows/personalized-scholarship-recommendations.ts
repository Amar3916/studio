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
import scholarshipsData from '@/data/scholarships.json';
import clientPromise from '@/lib/mongodb';

// Define the schema for student profile data (input)
const ScholarshipRecommendationInputSchema = z.object({
  academicInfo: z.string().describe('Academic information of the student, including GPA, major, and education level.'),
  financialInfo: z.string().describe('Financial background of the student, including family income and financial needs.'),
  achievementInfo: z.string().describe('Achievements of the student, including awards, honors, and extracurricular activities.'),
  categoryInfo: z.string().describe('Category of student, including demographic information and any special circumstances.'),
});
export type ScholarshipRecommendationInput = z.infer<typeof ScholarshipRecommendationInputSchema>;

// Define the schema for a single scholarship from our data file
const ScholarshipSchema = z.object({
  scholarshipName: z.string(),
  description: z.string(),
  amount: z.string(),
  deadline: z.string(),
  link: z.string(),
});

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
  input: {
    schema: z.object({
      studentProfile: ScholarshipRecommendationInputSchema,
      scholarships: z.array(ScholarshipSchema)
    })
  },
  output: {schema: ScholarshipRecommendationOutputSchema},
  prompt: `You are an AI assistant specializing in providing personalized scholarship recommendations to students.

  Your task is to analyze the provided student profile and a list of available scholarships.
  Based on how well each scholarship matches the student's profile, you must generate a match score from 0 to 100.

  Return a list of the scholarships, including the calculated match score for each.
  Only return scholarships with a match score of 50 or higher.
  Order the results from the highest match score to the lowest.

  Student Profile:
  Academic Information: {{{studentProfile.academicInfo}}}
  Financial Background: {{{studentProfile.financialInfo}}}
  Achievements: {{{studentProfile.achievementInfo}}}
  Personal Background: {{{studentProfile.categoryInfo}}}

  Available Scholarships (JSON format):
  {{{json scholarships}}}

  Your response should be a JSON array of scholarship objects that includes the matchScore.
  `,
});

// Define the Genkit flow for personalized scholarship recommendations
const personalizedScholarshipRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedScholarshipRecommendationsFlow',
    inputSchema: ScholarshipRecommendationInputSchema,
    outputSchema: ScholarshipRecommendationOutputSchema,
  },
  async (studentProfile) => {
    const client = await clientPromise;
    const db = client.db();
    const scholarshipsCollection = db.collection('scholarships');

    // Seed the database if it's empty
    const count = await scholarshipsCollection.countDocuments();
    if (count === 0) {
      console.log('Seeding scholarships collection...');
      await scholarshipsCollection.insertMany(scholarshipsData);
    }
    
    const availableScholarships = await scholarshipsCollection.find({}).project({_id: 0}).toArray();
    
    const {output} = await personalizedScholarshipRecommendationsPrompt({
        studentProfile,
        scholarships: availableScholarships as z.infer<typeof ScholarshipSchema>[]
    });
    
    return output || [];
  }
);
