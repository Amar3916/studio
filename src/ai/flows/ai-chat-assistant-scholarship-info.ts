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

const deadlineReminderTool = ai.defineTool({
  name: 'deadlineReminderTool',
  description: 'This tool calculates when it would be relevant to mention specific facts about aid programs in its answer.',
  inputSchema: z.object({
    question: z.string().describe('The question about scholarships.'),
  }),
  outputSchema: z.boolean(),
}, async (input) => {
  // TODO: Implement the logic to determine when to mention specific facts about aid programs
  return false;
});

const prompt = ai.definePrompt({
  name: 'answerScholarshipQuestionPrompt',
  input: {schema: AnswerScholarshipQuestionInputSchema},
  output: {schema: AnswerScholarshipQuestionOutputSchema},
  tools: [deadlineReminderTool],
  prompt: `You are an AI assistant helping students with questions about scholarships.

  Answer the following question:
  {{question}}

  Use the available tools if needed.
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
