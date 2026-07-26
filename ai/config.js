import dotenv from "dotenv";

dotenv.config({ path: ".env.ai" });

export default {

  ai: {
    apiUrl: process.env.OLLAMA_API_URL,
    apiKey: process.env.OLLAMA_API_KEY,
    model: process.env.OLLAMA_MODEL,
  },


  github: {
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    token:
      process.env.AI_GITHUB_TOKEN ||
      process.env.GITHUB_TOKEN,

    baseBranch:
      process.env.GITHUB_BASE_BRANCH || "dev",
  },


  repair: {
    maxContextFiles:
      Number(process.env.MAX_CONTEXT_FILES || 50),

    maxRetries:
      Number(process.env.MAX_RETRIES || 3),
  },


  output: {
    directory: "ai/output",

    contextFile:
      "ai/output/context.json",

    responseFile:
      "ai/output/ai-response.json",

    logFile:
      "ai/output/repair.log",
  },
};