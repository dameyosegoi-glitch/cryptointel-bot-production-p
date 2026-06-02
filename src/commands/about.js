import { safeReply } from "../utils/telegram.js";

export default function register(bot) {
  bot.command("about", async (ctx) => {
    await safeReply(ctx, [
      "CryptoIntel Bot is a Telegram-only crypto intelligence assistant.",
      "Capabilities: token security scans, price and market analysis, NFT collection intelligence, public wallet summaries, news, and sentiment.",
      "Sources used when available: DEXScreener, CoinGecko, GoPlus, Honeypot.is, OpenSea, Magic Eden, Solana RPC, and CookMyBots AI Gateway for concise synthesis.",
      "Limitations: public APIs may be stale, rate-limited, missing chain coverage, or unavailable. Some wallet, holder, PnL, whale, lock, and social metrics need indexed data that may not be available in this no-extra-key build.",
      "I never ask for seed phrases or private keys. Educational analysis only, DYOR, not financial advice."
    ].join("\n"));
  });
}
