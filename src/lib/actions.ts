'use server';

import {
  answerScholarshipQuestion as answerScholarshipQuestionFlow,
  AnswerScholarshipQuestionInput,
  AnswerScholarshipQuestionOutput
} from '@/ai/flows/ai-chat-assistant-scholarship-info';

import {
  getScholarshipRecommendations as getScholarshipRecommendationsFlow,
  ScholarshipRecommendationInput,
  ScholarshipRecommendationOutput
} from '@/ai/flows/personalized-scholarship-recommendations';

import {
  generateApplicationChecklist as generateApplicationChecklistFlow,
  GenerateApplicationChecklistInput,
  GenerateApplicationChecklistOutput,
} from '@/ai/flows/generate-application-checklist';


export async function getScholarshipRecommendations(input: ScholarshipRecommendationInput): Promise<ScholarshipRecommendationOutput> {
    console.log('Fetching scholarship recommendations for:', input);
    const recommendations = await getScholarshipRecommendationsFlow(input);
    console.log('Received recommendations:', recommendations);
    return recommendations;
}

export async function answerScholarshipQuestion(input: AnswerScholarshipQuestionInput): Promise<AnswerScholarshipQuestionOutput> {
    console.log('Answering question:', input.question);
    const answer = await answerScholarshipQuestionFlow(input);
    console.log('Generated answer:', answer);
    return answer;
}

export async function generateApplicationChecklist(input: GenerateApplicationChecklistInput): Promise<GenerateApplicationChecklistOutput> {
    console.log('Generating checklist for:', input.scholarshipName);
    const checklist = await generateApplicationChecklistFlow(input);
    console.log('Generated checklist:', checklist);
    return checklist;
}
