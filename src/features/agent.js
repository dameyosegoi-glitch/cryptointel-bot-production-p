import { runWithBackpressure } from "../lib/backpressure.js";
import { detectAddress } from "../utils/address.js";
import { safeReply } from "../utils/telegram.js";
import { analyzeScan, analyzeWallet } from "../services/intel.js";

function includesSecret(text) {
  const t = String(text || "").toLowerCase();
  return t.includes("seed phrase") || t.includes("private key") || /\b([a-z]+\s+){11,23}[a-z]+\b/.test(t);
}

function shouldReplyInGroup(ctx, raw) {
  const type = ctx.chat?.type || "private";
  if (type === "private") return true;

  const username = ctx.me?.username || ctx.botInfo?.username || "";
  const reply = ctx.message?.reply_to_message;
  const replyToBot = Boolean(reply?.from?.is_bot && username && String(reply.from.username || "").toLowerCase() === username.toLowerCase());
  const mentioned = username && String(raw).toLowerCase().includes(`@${username.toLowerCase()}`);
  return Boolean(replyToBot || mentioned);
}

export function registerAgent(bot) {
  bot.on("message:text", async (ctx, next) => {
    const raw = ctx.message?.text || "";
    if (raw.startsWith("/")) return next();
    if (!shouldReplyInGroup(ctx, raw)) return next();

    const username = ctx.me?.username || ctx.botInfo?.username || "";
    const text = username ? raw.replace(new RegExp(`@${username}\\b`, "ig"), "").trim() : raw.trim();
    if (!text) return safeReply(ctx, "Send a contract, wallet, or command like /scan, /price, /news, or /help.");

    if (includesSecret(text)) {
      return safeReply(ctx, "Never share seed phrases or private keys. I cannot process secrets. If you posted one, move funds to a fresh wallet immediately.");
    }

    const detected = detectAddress(text);
    if (detected.type === "evm") {
      return runWithBackpressure(ctx, async () => {
        await safeReply(ctx, "Detected a likely EVM contract or wallet address. Running a security-oriented scan now.");
        await safeReply(ctx, await analyzeScan(detected.address));
      });
    }

    if (detected.type === "solana") {
      return runWithBackpressure(ctx, async () => {
        await safeReply(ctx, "Detected a likely Solana wallet address. Running a public wallet summary now.");
        await safeReply(ctx, await analyzeWallet(detected.address));
      });
    }

    return safeReply(ctx, "I can analyze crypto assets with /scan, /price, /nft, /wallet, /news, and /sentiment. Paste a contract or wallet address and I’ll route it automatically.");
  });
}
