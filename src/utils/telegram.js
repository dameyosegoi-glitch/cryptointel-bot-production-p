import { log, safeErr } from "../lib/logger.js";

export async function safeReply(ctx, text, options = {}) {
  try {
    return await ctx.reply(String(text || ""), { disable_web_page_preview: true, ...options });
  } catch (err) {
    log.warn("telegram.send.failure", { err: safeErr(err), fallback: "plain_short_message" });
    try {
      return await ctx.reply("I could not send the full response. Please try again.");
    } catch (fallbackErr) {
      log.error("telegram.send.fallback.failure", { err: safeErr(fallbackErr) });
      return null;
    }
  }
}
