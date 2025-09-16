'use server';

/**
 * @fileOverview An AI Chat Assistant for answering questions about scholarships.
 *
 * - answerScholarshipQuestion - A function that answers questions about scholarships.
 * - AnswerScholarshipQuestionInput - The input type for the answerScholarshipQuestion function.
 * - AnswerScholarshipQuestionOutput - The return type for the answerScholarshipQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleSearchTool} from '@genkit-ai/googleai/tools';

const AnswerScholarshipQuestionInputSchema = z.object({
  question: z.string().describe('The question about scholarships.'),
});
export type AnswerScholarshipQuestionInput = z.infer<typeof AnswerScholarshipQuestionInputSchema>;

const AnswerScholarshipQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about scholarships.'),
});
export type AnswerScholarshipQuestionOutput = z.infer<typeof AnswerScholarshipQuestionOutputSchema>;

export async function answerScholarshipQuestion(input: AnswerScholarshipQuestionInput): Promise<AnswerScholarshipQuestionOutput> {
  return answerScholarshipQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerScholarshipQuestionPrompt',
  input: {schema: AnswerScholarshipQuestionInputSchema},
  output: {schema: AnswerScholarshipQuestionOutputSchema},
  tools: [googleSearchTool],
  prompt: `You are an AI assistant helping students with questions about scholarships.

  Your primary goal is to provide accurate and helpful information.
  If a user asks about a specific scholarship, current deadlines, or any information that requires up-to-date, real-world knowledge, use the googleSearchTool to find the most current details.
  Always encourage users to verify details on the official scholarship websites, and provide the source link when you can.

  Answer the following question:
  {{question}}
  `,
});

const answerScholarshipQuestionFlow = ai.defineFlow(
  {
    name: 'answerScholarshipQuestionFlow',
    inputSchema: AnswerScholarshipQuestionInputSchema,
    outputSchema: AnswerScholarshipQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
