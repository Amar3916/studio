import {genkit} from 'genkit';
import {googleAI, googleSearchTool} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI(),
    googleSearchTool({
      apiKey: process.env.GOOGLE_API_KEY,
      engineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
