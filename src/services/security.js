import { fetchJson } from "../lib/http.js";
import { getMarketBundle } from "./market.js";

const GOPLUS_CHAIN = {
  ethereum: "1",
  bsc: "56",
  polygon: "137",
  arbitrum: "42161",
  base: "8453"
};

function chainNameFromDex(chainId) {
  const c = String(chainId || "").toLowerCase();
  if (c === "ethereum" || c === "eth") return "Ethereum";
  if (c === "bsc") return "BSC";
  if (c === "polygon") return "Polygon";
  if (c === "arbitrum") return "Arbitrum";
  if (c === "base") return "Base";
  if (c === "solana") return "Solana";
  return chainId || "Unknown";
}

async function fetchGoPlus(chainId, address) {
  const id = GOPLUS_CHAIN[String(chainId || "").toLowerCase()];
  if (!id) return { data: null, sources: [], error: "GoPlus unsupported chain" };
  const url = `https://api.gopluslabs.io/api/v1/token_security/${id}?contract_addresses=${encodeURIComponent(address)}`;
  const res = await fetchJson(url, { source: "GoPlus", operation: "token-security" });
  return {
    data: res.data?.result?.[address.toLowerCase()] || res.data?.result?.[address] || null,
    sources: res.ok ? ["GoPlus"] : [],
    error: res.error
  };
}

async function fetchHoneypot(address, dexChainId) {
  const map = { ethereum: 1, bsc: 56, base: 8453 };
  const chainID = map[String(dexChainId || "").toLowerCase()];
  if (!chainID) return { data: null, sources: [], error: "Honeypot.is unsupported chain" };
  const url = `https://api.honeypot.is/v2/IsHoneypot?address=${encodeURIComponent(address)}&chainID=${chainID}`;
  const res = await fetchJson(url, { source: "Honeypot.is", operation: "is-honeypot" });
  return { data: res.data || null, sources: res.ok ? ["Honeypot.is"] : [], error: res.error };
}

export async function scanToken(address) {
  const market = await getMarketBundle(address);
  const pair = market.pair;
  const dexChainId = pair?.chainId || "";
  const chain = chainNameFromDex(dexChainId);

  const [goPlus, honeypot] = await Promise.all([
    fetchGoPlus(dexChainId, address),
    fetchHoneypot(address, dexChainId)
  ]);

  const flags = [];
  let score = 0;
  const gp = goPlus.data || {};

  if (honeypot.data?.honeypotResult?.isHoneypot === true || honeypot.data?.isHoneypot === true) {
    flags.push("Honeypot behavior detected: selling may be blocked");
    score += 60;
  }
  if (gp.is_honeypot === "1") {
    flags.push("GoPlus flags this token as honeypot");
    score += 60;
  }
  if (gp.is_blacklisted === "1" || gp.blacklist === "1") {
    flags.push("Blacklist controls detected");
    score += 25;
  }
  if (gp.is_mintable === "1") {
    flags.push("Mint function appears enabled");
    score += 20;
  }
  if (gp.owner_address && gp.owner_address !== "0x0000000000000000000000000000000000000000") {
    flags.push("Owner privileges may still be active");
    score += 15;
  }
  if (Number(market.liquidity || 0) > 0 && Number(market.liquidity || 0) < 50000) {
    flags.push("Low liquidity depth can increase slippage and exit risk");
    score += 15;
  }
  if (!pair) {
    flags.push("No active DEX pair found, market data is insufficient");
    score += 25;
  }
  if (!goPlus.data) flags.push("Security flags unavailable from GoPlus for this chain or token");
  if (!honeypot.data) flags.push("Honeypot simulation unavailable for this chain or token");

  let verdict = "✅ SAFE";
  if (score >= 60) verdict = "❌ SCAM";
  else if (score >= 20 || flags.length >= 3) verdict = "⚠️ RISKY";
  if (!pair && !goPlus.data && !honeypot.data) verdict = "insufficient data";

  return {
    address,
    token: pair?.baseToken?.name || gp.token_name || "Unknown token",
    symbol: pair?.baseToken?.symbol || gp.token_symbol || "Unknown",
    chain,
    verdict,
    score,
    flags,
    market,
    goPlus: gp,
    honeypot: honeypot.data,
    sources: [...market.sources, ...goPlus.sources, ...honeypot.sources]
  };
}
