import { fetchJson } from "../lib/http.js";

export async function fetchDexPairs(query) {
  const q = String(query || "").trim();
  if (!q) return { pairs: [], sources: [] };

  const isAddress = /^0x[a-fA-F0-9]{40}$/.test(q);
  const url = isAddress
    ? `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(q)}`
    : `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`;

  const res = await fetchJson(url, { source: "DEXScreener", operation: isAddress ? "token-pairs" : "search" });
  const pairs = Array.isArray(res.data?.pairs) ? res.data.pairs : [];
  pairs.sort((a, b) => Number(b?.liquidity?.usd || 0) - Number(a?.liquidity?.usd || 0));
  return { pairs, sources: res.ok ? ["DEXScreener"] : [], error: res.error };
}

export async function fetchCoinGecko(query) {
  const q = String(query || "").trim();
  if (!q) return { market: null, sources: [] };

  const search = await fetchJson(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`, {
    source: "CoinGecko",
    operation: "search"
  });

  const coin = search.data?.coins?.[0];
  if (!search.ok || !coin?.id) return { market: null, sources: search.ok ? ["CoinGecko"] : [], error: search.error || "Coin not found" };

  const market = await fetchJson(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(coin.id)}&price_change_percentage=24h`, {
    source: "CoinGecko",
    operation: "markets"
  });

  return {
    market: market.data?.[0] || null,
    sources: market.ok ? ["CoinGecko"] : ["CoinGecko"],
    error: market.error
  };
}

export async function getMarketBundle(query) {
  const [dex, cg] = await Promise.all([
    fetchDexPairs(query),
    fetchCoinGecko(query)
  ]);

  const pair = dex.pairs?.[0] || null;
  const market = cg.market || null;
  const price = Number(pair?.priceUsd || market?.current_price || 0);
  const change24h = Number(pair?.priceChange?.h24 ?? market?.price_change_percentage_24h ?? NaN);
  const volume24h = Number(pair?.volume?.h24 ?? market?.total_volume ?? NaN);
  const marketCap = Number(market?.market_cap ?? pair?.fdv ?? NaN);
  const liquidity = Number(pair?.liquidity?.usd ?? NaN);

  let signal = "🟡 NEUTRAL";
  if (Number.isFinite(change24h) && Number.isFinite(volume24h)) {
    if (change24h > 3 && volume24h > 100000) signal = "🟢 BULLISH";
    if (change24h < -3) signal = "🔴 BEARISH";
  }

  return {
    query,
    pair,
    market,
    price,
    change24h,
    volume24h,
    marketCap,
    liquidity,
    signal,
    indicators: {
      rsi: "unavailable: public OHLC history not sufficient in this build",
      macd: "unavailable: public OHLC history not sufficient in this build",
      ema: "unavailable: public OHLC history not sufficient in this build",
      support: Number.isFinite(price) && price > 0 ? price * 0.95 : null,
      resistance: Number.isFinite(price) && price > 0 ? price * 1.05 : null
    },
    sources: [...dex.sources, ...cg.sources],
    errors: [dex.error, cg.error].filter(Boolean)
  };
}
