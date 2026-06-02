import { runWithBackpressure } from "../lib/backpressure.js";
import { analyzeWallet } from "../services/intel.js";
import { safeReply } from "../utils/telegram.js";

export default function register(bot) {
  bot.command("wallet", async (ctx) => {
    const input = String(ctx.match || "").trim();
    if (!input) return safeReply(ctx, "💼 PORTFOLIO\nUsage: /wallet 0xaddress or /wallet SolanaAddress");
    await runWithBackpressure(ctx, async () => {
      await safeReply(ctx, await analyzeWallet(input));
    });
  });
}
