import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {googleSearchTool} from '@genkit-ai/googleai/tools';

export const ai = genkit({
  plugins: [
    googleAI(),
    googleSearchTool({
      apiKey: process.env.GOOGLE_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
