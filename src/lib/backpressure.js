import { cfg } from "./config.js";
import { safeReply } from "../utils/telegram.js";

const chatLocks = new Set();
let globalInFlight = 0;

function keyFor(ctx) {
  return String(ctx.chat?.id || ctx.from?.id || "unknown");
}

export async function runWithBackpressure(ctx, fn) {
  const key = keyFor(ctx);
  const cap = Math.max(1, Number(cfg.GLOBAL_AI_CAP || 1));

  if (chatLocks.has(key)) {
    await safeReply(ctx, "I’m working on your last request. Please wait a moment.");
    return;
  }

  if (globalInFlight >= cap) {
    await safeReply(ctx, "Busy right now. Try again in a moment.");
    return;
  }

  chatLocks.add(key);
  globalInFlight += 1;

  try {
    await fn();
  } finally {
    chatLocks.delete(key);
    globalInFlight = Math.max(0, globalInFlight - 1);
  }
}
