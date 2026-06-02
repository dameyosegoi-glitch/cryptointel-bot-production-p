import { runWithBackpressure } from "../lib/backpressure.js";
import { analyzeSentiment } from "../services/intel.js";
import { safeReply } from "../utils/telegram.js";

export default function register(bot) {
  bot.command("sentiment", async (ctx) => {
    const input = String(ctx.match || "").trim();
    if (!input) return safeReply(ctx, "🎯 SENTIMENT\nUsage: /sentiment SOL");
    await runWithBackpressure(ctx, async () => {
      await safeReply(ctx, await analyzeSentiment(input));
    });
  });
}
