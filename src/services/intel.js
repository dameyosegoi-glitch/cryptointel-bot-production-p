import { synthesize } from "../lib/ai.js";
import { detectAddress, isIndonesian } from "../utils/address.js";
import { sourceList, usd, pct } from "../utils/format.js";
import { getMarketBundle } from "./market.js";
import { scanToken } from "./security.js";
import { getNftCollection } from "./nft.js";
import { getWalletSummary } from "./wallet.js";
import { getNewsBundle } from "./news.js";

function lang(text) {
  return isIndonesian(text) ? "id" : "en";
}

export async function analyzeScan(input) {
  const language = lang(input);
  const detected = detectAddress(input);
  if (detected.type !== "evm") {
    return language === "id"
      ? "🔍 SECURITY\nAlamat kontrak EVM tidak valid. Gunakan /scan 0xcontractaddress. Educational analysis only, bukan financial advice."
      : "🔍 SECURITY\nInvalid EVM contract address. Use /scan 0xcontractaddress. Educational analysis only, not financial advice.";
  }

  const data = await scanToken(detected.address);
  const fallback = [
    "══════════════════════",
    "🔍 SCAN RESULTS",
    `Token: ${data.token} (${data.symbol}) | Chain: ${data.chain}`,
    `Verdict: ${data.verdict}`,
    "Key findings:",
    ...(data.flags.length ? data.flags.slice(0, 6).map((x) => `• ${x}`) : ["• No critical live security flags found, but absence of data is not proof of safety"]),
    `• Liquidity: ${usd(data.market.liquidity)} | 24h volume: ${usd(data.market.volume24h)}`,
    `Sources: ${sourceList(data.sources)}`,
    "Disclaimer: Watch for fake airdrops, phishing links, malicious approvals, and seed phrase requests. Educational analysis only, DYOR, not financial advice.",
    "══════════════════════"
  ].join("\n");

  return synthesize({
    feature: "scan",
    language,
    facts: data,
    fallback,
    instruction: "Return exactly a clear scan block with the borders, title 🔍 SCAN RESULTS, Token line, Verdict line, key findings bullets, Sources, Disclaimer, and border. Keep the verdict first and preserve factual flags."
  });
}

export async function analyzePrice(input) {
  const language = lang(input);
  const query = String(input || "").trim();
  if (!query) return "📊 PRICE\nUsage: /price ETH or /price 0xcontractaddress";

  const data = await getMarketBundle(query);
  const label = data.pair?.baseToken?.symbol || data.market?.symbol?.toUpperCase() || query.toUpperCase();
  const fallback = [
    `📊 ${label}/USDT`,
    `Price: ${usd(data.price)} | 24h: ${pct(data.change24h)}`,
    `Market Cap: ${usd(data.marketCap)} | Volume 24h: ${usd(data.volume24h)}`,
    `Signal: ${data.signal}`,
    `Key levels: Support ${usd(data.indicators.support)} | Resistance ${usd(data.indicators.resistance)}`,
    `Indicators: RSI unavailable; MACD unavailable; EMA trend unavailable because sufficient public OHLC history was not available.`,
    `Sources: ${sourceList(data.sources)}`,
    "Disclaimer: Educational analysis only, DYOR, not financial advice."
  ].join("\n");

  return synthesize({
    feature: "price",
    language,
    facts: data,
    fallback,
    instruction: "Create a concise 📊 PRICE response. Include price, 24h change, market cap, volume, signal, support/resistance, indicator availability, sources, and disclaimer."
  });
}

export async function analyzeNft(input) {
  const language = lang(input);
  const query = String(input || "").trim();
  if (!query) return "🖼️ NFT\nUsage: /nft Pudgy Penguins";

  const data = await getNftCollection(query);
  const os = data.openSea?.total || data.openSea || {};
  const me = data.magicEden || {};
  const fallback = [
    `🖼️ NFT ${query}`,
    `Floor: ${os.floor_price ?? me.floorPrice ?? "unavailable"}`,
    `24h/7d trend: unavailable unless returned by marketplace data`,
    `Total volume: ${os.volume ?? me.volumeAll ?? "unavailable"}`,
    `Unique holders: ${os.num_owners ?? "unavailable"} | Listings: ${os.listed_count ?? "unavailable"}`,
    "Notable sales and whale activity: unavailable from public data in this request.",
    `Risk: ${data.sources.length ? "Review liquidity, holder distribution, and suspicious volume before acting." : "Insufficient marketplace data for reliable assessment."}`,
    `Notes: ${data.notes.join("; ") || "None"}`,
    `Sources: ${sourceList(data.sources)}`,
    "Disclaimer: Educational analysis only, DYOR, not financial advice."
  ].join("\n");

  return synthesize({
    feature: "nft",
    language,
    facts: data,
    fallback,
    instruction: "Create a concise 🖼️ NFT intelligence response with floor, trends, volume, holders, listings, notable sales, whale activity if available, risk assessment, unavailable metrics, sources, and disclaimer."
  });
}

export async function analyzeWallet(input) {
  const language = lang(input);
  const detected = detectAddress(input);
  if (detected.type === "none") return "💼 PORTFOLIO\nInvalid wallet address. Use /wallet 0xaddress or /wallet SolanaAddress.";

  const data = await getWalletSummary(detected.address, detected.type);
  const fallback = [
    "💼 PORTFOLIO",
    `Address: ${detected.address}`,
    `Chain type: ${detected.type === "solana" ? "Solana" : "EVM"}`,
    `Native balance: ${data.nativeBalance === null ? "unavailable" : `${data.nativeBalance} SOL`}`,
    "Token holdings USD values: unavailable unless indexed wallet data is available.",
    "NFT overview: unavailable from public indexed data in this request.",
    "Recent transaction pattern: insufficient data from configured sources.",
    "PnL: cannot be reliably estimated without historical cost basis and transaction history.",
    "Safety: Never share seed phrases, private keys, or sign unknown approvals.",
    `Sources: ${sourceList(data.sources)}`,
    "Disclaimer: Educational analysis only, not financial advice."
  ].join("\n");

  return synthesize({
    feature: "wallet",
    language,
    facts: data,
    fallback,
    instruction: "Create a concise 💼 PORTFOLIO response. Do not ask for seed phrases or private keys. State unavailable metrics clearly and include sources and disclaimer."
  });
}

export async function analyzeNews(input = "") {
  const language = lang(input);
  const data = await getNewsBundle();
  const fallback = [
    "📰 NEWS",
    `Trending coins: ${data.trendingCoins.map((x) => `${x.symbol || x.name}`).filter(Boolean).join(", ") || "unavailable"}`,
    `Narratives to watch: ${data.narratives.join(", ")}`,
    `Upcoming events: ${data.events}`,
    `Headlines: ${Array.isArray(data.headlines) && data.headlines.length ? "available from gateway feed" : "unavailable from configured public sources"}`,
    `Sources: ${sourceList(data.sources)}`,
    "Disclaimer: Educational analysis only, DYOR, not financial advice."
  ].join("\n");

  return synthesize({
    feature: "news",
    language,
    facts: data,
    fallback,
    instruction: "Summarize and rank latest crypto headlines and trends. Head with 📰 NEWS. Include major narratives, events if available, limitations, sources, and disclaimer."
  });
}

export async function analyzeSentiment(input) {
  const language = lang(input);
  const query = String(input || "").trim();
  if (!query) return "🎯 SENTIMENT\nUsage: /sentiment SOL";

  const [market, news] = await Promise.all([
    getMarketBundle(query),
    getNewsBundle()
  ]);

  const change = Number(market.change24h);
  let ratio = "33% bullish / 34% neutral / 33% bearish";
  if (Number.isFinite(change)) {
    if (change > 3) ratio = "55% bullish / 30% neutral / 15% bearish";
    else if (change < -3) ratio = "20% bullish / 30% neutral / 50% bearish";
    else ratio = "30% bullish / 50% neutral / 20% bearish";
  }

  const data = { query, market, news, ratio };
  const fallback = [
    `🎯 SENTIMENT ${query.toUpperCase()}`,
    `Estimate: ${ratio}`,
    `Bullish drivers: ${Number.isFinite(change) && change > 0 ? "positive 24h price action" : "insufficient confirmed bullish signals"}`,
    `Bearish drivers: ${Number.isFinite(change) && change < 0 ? "negative 24h price action" : "insufficient confirmed bearish signals"}`,
    "Limitations: social API coverage is not configured; estimate uses available market and news/trending data only.",
    `Sources: ${sourceList([...market.sources, ...news.sources])}`,
    "Disclaimer: Educational analysis only, DYOR, not financial advice."
  ].join("\n");

  return synthesize({
    feature: "sentiment",
    language,
    facts: data,
    fallback,
    instruction: "Create a 🎯 SENTIMENT section with bullish/bearish/neutral ratio estimate, main drivers, data limitations, sources, and disclaimer."
  });
}
