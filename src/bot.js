import { Bot } from "grammy";
import { registerCommands } from "./commands/loader.js";
import { registerAgent } from "./features/agent.js";
import { log, safeErr } from "./lib/logger.js";

export async function createBot(token) {
  const bot = new Bot(token);

  await registerCommands(bot);
  registerAgent(bot);

  bot.catch((err) => {
    log.error("telegram.bot.catch", {
      err: safeErr(err.error || err),
      updateId: err.ctx?.update?.update_id || ""
    });
  });

  return bot;
}
