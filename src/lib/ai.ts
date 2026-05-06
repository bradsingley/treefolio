import OpenAI from 'openai'

let client: OpenAI | null = null

function getClient(): OpenAI {
  if (client) return client
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  if (!endpoint || !apiKey) {
    throw new Error('AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY must be set')
  }
  // Azure AI Foundry uses the resource-level /models inference API
  const resourceBase = new URL(endpoint).origin
  client = new OpenAI({
    baseURL: `${resourceBase}/models`,
    apiKey,
  })
  return client
}

// Proxy that lazily instantiates the client on first property access so the
// module can be imported during `next build` without env vars set.
export const ai: OpenAI = new Proxy({} as OpenAI, {
  get(_target, prop) {
    const c = getClient() as unknown as Record<string | symbol, unknown>
    const value = c[prop]
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(c) : value
  },
})
