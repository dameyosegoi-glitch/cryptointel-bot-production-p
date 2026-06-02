import { safeReply } from "../utils/telegram.js";

export default function register(bot) {
  bot.command("help", async (ctx) => {
    await safeReply(ctx, [
      "CryptoIntel Bot commands:",
      "/start — welcome and supported chains. Example: /start",
      "/scan [contract_address] — token security scan. Example: /scan 0x1234...abcd",
      "/price [token_symbol_or_address] — market data and signal. Example: /price ETH",
      "/nft [collection_name] — NFT collection intelligence. Example: /nft Pudgy Penguins",
      "/wallet [address] — public wallet summary. Example: /wallet 0x1234...abcd",
      "/news — latest crypto news and narratives. Example: /news",
      "/sentiment [token] — bullish, bearish, neutral drivers. Example: /sentiment SOL",
      "/about — capabilities, sources, limitations, and disclaimer.",
      "You can also paste likely contract or wallet addresses in normal chat."
    ].join("\n"));
  });
}
