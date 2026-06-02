import { cfg } from "../lib/config.js";
import { fetchJson } from "../lib/http.js";
import { slugifyCollection } from "../utils/address.js";

export async function getNftCollection(name) {
  const slug = slugifyCollection(name);
  const sources = [];
  const notes = [];
  let openSea = null;
  let magicEden = null;

  if (cfg.OPENSEA_API_KEY) {
    const res = await fetchJson(`https://api.opensea.io/api/v2/collections/${encodeURIComponent(slug)}/stats`, {
      source: "OpenSea",
      operation: "collection-stats",
      headers: { "x-api-key": cfg.OPENSEA_API_KEY }
    });
    openSea = res.data || null;
    if (res.ok) sources.push("OpenSea");
    else notes.push("OpenSea keyed data unavailable or collection slug not found");
  } else {
    notes.push("OpenSea keyed data unavailable because OPENSEA_API_KEY is not configured");
  }

  const me = await fetchJson(`https://api-mainnet.magiceden.dev/v2/collections/${encodeURIComponent(slug)}/stats`, {
    source: "Magic Eden",
    operation: "collection-stats"
  });
  magicEden = me.data || null;
  if (me.ok) sources.push("Magic Eden");
  else notes.push("Magic Eden public data unavailable for this collection slug");

  return {
    query: name,
    slug,
    openSea,
    magicEden,
    notes,
    sources
  };
}
