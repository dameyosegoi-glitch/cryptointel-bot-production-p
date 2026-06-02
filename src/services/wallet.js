import { postJson } from "../lib/http.js";

export async function getWalletSummary(address, type) {
  const sources = [];
  const notes = [];
  let nativeBalance = null;

  if (type === "solana") {
    const res = await postJson("https://api.mainnet-beta.solana.com", {
      source: "Solana RPC",
      operation: "getBalance",
      body: {
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [address]
      }
    });
    if (res.ok && Number.isFinite(res.data?.result?.value)) {
      nativeBalance = res.data.result.value / 1_000_000_000;
      sources.push("Solana RPC");
    } else {
      notes.push("Solana native balance unavailable from public RPC");
    }
  } else {
    notes.push("EVM token holdings require an indexed wallet data source; no keyed wallet indexer is configured in this no-extra-key build");
  }

  notes.push("NFT portfolio, token USD values, recent transaction pattern, and PnL are limited unless public indexed data is available");

  return {
    address,
    type,
    nativeBalance,
    notes,
    sources
  };
}
