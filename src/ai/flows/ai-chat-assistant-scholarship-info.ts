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

const webSearchTool = ai.defineTool(
  {
    name: 'webSearch',
    description: 'Searches the web for information on a given topic. Use this for questions about specific scholarships, financial aid programs, or any other topic that requires up-to-date information.',
    inputSchema: z.object({
      query: z.string(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    // In a real app, this would be a call to a search API like Google Search.
    // For now, we will simulate a search result.
    console.log(`Simulating web search for: ${input.query}`);
    return `Web search results for "${input.query}" indicate that details should be looked up on the official website for the most accurate information.`;
  }
);


const prompt = ai.definePrompt({
  name: 'answerScholarshipQuestionPrompt',
  input: {schema: AnswerScholarshipQuestionInputSchema},
  output: {schema: AnswerScholarshipQuestionOutputSchema},
  tools: [webSearchTool],
  prompt: `You are an AI assistant helping students with questions about scholarships.

  Your primary goal is to provide accurate and helpful information.
  If a user asks about a specific scholarship, use the webSearch tool to find the most current details.
  Always encourage users to verify details on the official scholarship websites.

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
