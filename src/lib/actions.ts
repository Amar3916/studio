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
