const EVM_RE = /0x[a-fA-F0-9]{40}/;
const SOL_RE = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/;

export function firstEvmAddress(text) {
  return String(text || "").match(EVM_RE)?.[0] || "";
}

export function firstSolanaAddress(text) {
  const matches = String(text || "").match(new RegExp(SOL_RE.source, "g")) || [];
  return matches.find((value) => !value.startsWith("0x")) || "";
}

export function detectAddress(text) {
  const evm = firstEvmAddress(text);
  if (evm) return { type: "evm", address: evm, chain: "EVM" };
  const solana = firstSolanaAddress(text);
  if (solana) return { type: "solana", address: solana, chain: "Solana" };
  return { type: "none", address: "", chain: "" };
}

export function isIndonesian(text) {
  const t = String(text || "").toLowerCase();
  return /\b(apa|tolong|harga|dompet|berita|analisa|analisis|risiko|aman|bahaya|kontrak|koin|token|saya|bahasa indonesia|indonesia)\b/.test(t);
}

export function slugifyCollection(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
