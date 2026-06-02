import { runWithBackpressure } from "../lib/backpressure.js";
import { analyzePrice } from "../services/intel.js";
import { safeReply } from "../utils/telegram.js";

export default function register(bot) {
  bot.command("price", async (ctx) => {
    const input = String(ctx.match || "").trim();
    if (!input) return safeReply(ctx, "📊 PRICE\nUsage: /price ETH or /price 0xcontractaddress");
    await runWithBackpressure(ctx, async () => {
      await safeReply(ctx, await analyzePrice(input));
    });
  });
}
