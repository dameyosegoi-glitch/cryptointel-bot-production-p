export function usd(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "unavailable";
  if (Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  if (Math.abs(n) < 0.01 && n !== 0) return `$${n.toPrecision(4)}`;
  return `$${n.toFixed(4)}`;
}

export function pct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "unavailable";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export function short(value, max = 3000) {
  const s = String(value || "").trim();
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

export function sourceList(sources) {
  const unique = [...new Set((sources || []).filter(Boolean))];
  return unique.length ? unique.join(", ") : "No live source returned usable data";
}
