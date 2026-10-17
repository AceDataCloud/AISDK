import { createSunoTools } from '@acedatacloud/ai-sdk-suno';
import { createSeedanceTools } from '@acedatacloud/ai-sdk-seedance';
import { createHappyHorseTools } from '@acedatacloud/ai-sdk-happyhorse';
import { createGPTImageTools } from '@acedatacloud/ai-sdk-gpt-image';
import { createNanoBananaTools } from '@acedatacloud/ai-sdk-nano-banana';
import { generateText, type LanguageModel } from 'ai';
async function example(model: LanguageModel) {
  const clients=await Promise.all([createSunoTools(),createSeedanceTools(),createHappyHorseTools(),createGPTImageTools(),createNanoBananaTools()]);
  try { await generateText({model,prompt:'Query a saved task.',tools:clients[0].tools}); }
  finally { await Promise.all(clients.map(c=>c.close())); }
}
void example;
