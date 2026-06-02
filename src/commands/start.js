import { safeReply } from "../utils/telegram.js";

export default function register(bot) {
  bot.command("start", async (ctx) => {
    await safeReply(ctx, [
      "Welcome to CryptoIntel Bot.",
      "I provide token security scans, market analysis, NFT intelligence, public wallet summaries, crypto news, and sentiment analysis.",
      "Important commands: /scan, /price, /nft, /wallet, /news, /sentiment, /about, /help.",
      "Supported chains: Ethereum, Solana, Base, BSC, Arbitrum, and Polygon.",
      "Scam safety: never share seed phrases or private keys, avoid fake airdrops, and review token approvals carefully.",
      "Educational analysis only, DYOR, not financial advice."
    ].join("\n"));
  });
}
