'use server';
/**
 * @fileOverview Generates a personalized application checklist for a scholarship.
 *
 * - generateApplicationChecklist - A function that takes scholarship details and returns a list of checklist items.
 * - GenerateApplicationChecklistInput - The input type for the generateApplicationChecklist function.
 * - GenerateApplicationChecklistOutput - The return type for the generateApplicationChecklist function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the schema for the input
const GenerateApplicationChecklistInputSchema = z.object({
  scholarshipName: z.string().describe('The name of the scholarship.'),
  scholarshipDescription: z.string().describe('The description of the scholarship.'),
});
export type GenerateApplicationChecklistInput = z.infer<typeof GenerateApplicationChecklistInputSchema>;

// Define the schema for the output
const GenerateApplicationChecklistOutputSchema = z.object({
  tasks: z.array(z.string()).describe('A list of tasks required for the scholarship application.'),
});
export type GenerateApplicationChecklistOutput = z.infer<typeof GenerateApplicationChecklistOutputSchema>;

// Main exported function
export async function generateApplicationChecklist(input: GenerateApplicationChecklistInput): Promise<GenerateApplicationChecklistOutput> {
  return generateApplicationChecklistFlow(input);
}

// Define the prompt
const generateChecklistPrompt = ai.definePrompt({
  name: 'generateChecklistPrompt',
  input: {schema: GenerateApplicationChecklistInputSchema},
  output: {schema: GenerateApplicationChecklistOutputSchema},
  prompt: `You are an AI assistant that helps students create application checklists for scholarships.
  Based on the scholarship name and description, generate a list of common application tasks.

  Your tasks should be clear, actionable, and concise.
  Generate between 4 and 7 tasks.

  Examples of tasks:
  - "Write a 500-word essay on your career goals."
  - "Request two letters of recommendation from teachers."
  - "Obtain an official academic transcript."
  - "Complete the online application form."
  - "Prepare a portfolio of your creative work."

  Scholarship Name: {{{scholarshipName}}}
  Scholarship Description: {{{scholarshipDescription}}}

  Generate a list of likely tasks for this application.
  `,
});

// Define the Genkit flow
const generateApplicationChecklistFlow = ai.defineFlow(
  {
    name: 'generateApplicationChecklistFlow',
    inputSchema: GenerateApplicationChecklistInputSchema,
    outputSchema: GenerateApplicationChecklistOutputSchema,
  },
  async (input) => {
    const {output} = await generateChecklistPrompt(input);
    return output || { tasks: [] };
  }
);
