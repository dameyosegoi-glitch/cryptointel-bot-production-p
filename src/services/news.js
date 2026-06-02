import { aiCryptoNews } from "../lib/ai.js";
import { fetchJson } from "../lib/http.js";

export async function getNewsBundle() {
  const [trending, aiNews] = await Promise.all([
    fetchJson("https://api.coingecko.com/api/v3/search/trending", { source: "CoinGecko", operation: "trending" }),
    aiCryptoNews({ limit: 7 })
  ]);

  const coins = Array.isArray(trending.data?.coins)
    ? trending.data.coins.slice(0, 7).map((x) => ({ name: x.item?.name, symbol: x.item?.symbol, rank: x.item?.market_cap_rank }))
    : [];

  return {
    headlines: aiNews.data || [],
    trendingCoins: coins,
    narratives: ["AI", "DeFi", "Gaming", "RWA", "Memecoins"],
    events: "Upcoming events require a dedicated events feed; no public keyed events source is configured in this build.",
    sources: [
      ...(aiNews.ok ? ["CookMyBots ChainGPT News"] : []),
      ...(trending.ok ? ["CoinGecko"] : [])
    ],
    notes: [aiNews.error, trending.error].filter(Boolean)
  };
}
