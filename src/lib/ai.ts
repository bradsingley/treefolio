import OpenAI from 'openai'

const endpoint = process.env.AZURE_OPENAI_ENDPOINT!
const apiKey = process.env.AZURE_OPENAI_API_KEY!

// Azure AI Foundry uses the resource-level /models inference API
const resourceBase = new URL(endpoint).origin

export const ai = new OpenAI({
  baseURL: `${resourceBase}/models`,
  apiKey,
})
