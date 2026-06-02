export const cfg = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
  COOKMYBOTS_AI_ENDPOINT: process.env.COOKMYBOTS_AI_ENDPOINT || "https://api.cookmybots.com/api/ai",
  COOKMYBOTS_AI_KEY: process.env.COOKMYBOTS_AI_KEY || "",
  OPENSEA_API_KEY: process.env.OPENSEA_API_KEY || "",
  AI_TIMEOUT_MS: Number(process.env.AI_TIMEOUT_MS || 600000),
  AI_MAX_RETRIES: Number(process.env.AI_MAX_RETRIES || 2),
  CONCURRENCY: Number(process.env.CONCURRENCY || 20),
  GLOBAL_AI_CAP: Number(process.env.GLOBAL_AI_CAP || 1),
  EXTERNAL_TIMEOUT_MS: Number(process.env.EXTERNAL_TIMEOUT_MS || 20000)
};
