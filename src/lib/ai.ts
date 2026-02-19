import { AzureOpenAI } from 'openai'

const endpoint = process.env.AZURE_OPENAI_ENDPOINT!
const apiKey = process.env.AZURE_OPENAI_API_KEY!
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT!

export const ai = new AzureOpenAI({
  endpoint,
  apiKey,
  deployment,
  apiVersion: '2025-01-01-preview',
})

export { deployment }
