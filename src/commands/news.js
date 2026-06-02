import { runWithBackpressure } from "../lib/backpressure.js";
import { analyzeNews } from "../services/intel.js";
import { safeReply } from "../utils/telegram.js";

export default function register(bot) {
  bot.command("news", async (ctx) => {
    await runWithBackpressure(ctx, async () => {
      await safeReply(ctx, await analyzeNews(ctx.message?.text || ""));
    });
  });
}
