import { runWithBackpressure } from "../lib/backpressure.js";
import { analyzeScan } from "../services/intel.js";
import { safeReply } from "../utils/telegram.js";

export default function register(bot) {
  bot.command("scan", async (ctx) => {
    const input = String(ctx.match || "").trim();
    if (!input) return safeReply(ctx, "🔍 SECURITY\nUsage: /scan 0xcontractaddress");
    await runWithBackpressure(ctx, async () => {
      await safeReply(ctx, await analyzeScan(input));
    });
  });
}
