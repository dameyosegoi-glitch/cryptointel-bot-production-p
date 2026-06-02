import { runWithBackpressure } from "../lib/backpressure.js";
import { analyzeNft } from "../services/intel.js";
import { safeReply } from "../utils/telegram.js";

export default function register(bot) {
  bot.command("nft", async (ctx) => {
    const input = String(ctx.match || "").trim();
    if (!input) return safeReply(ctx, "🖼️ NFT\nUsage: /nft Pudgy Penguins");
    await runWithBackpressure(ctx, async () => {
      await safeReply(ctx, await analyzeNft(input));
    });
  });
}
