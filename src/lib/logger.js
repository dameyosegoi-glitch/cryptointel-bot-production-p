export function safeErr(err) {
  return err?.response?.data?.error?.message ||
    err?.response?.data?.message ||
    err?.message ||
    String(err);
}

function cleanMeta(meta = {}) {
  const out = {};
  for (const [key, value] of Object.entries(meta || {})) {
    const k = String(key).toLowerCase();
    if (k.includes("token") || k.includes("key") || k.includes("authorization") || k.includes("secret")) {
      out[key] = Boolean(value);
      continue;
    }
    if (typeof value === "string" && value.length > 600) {
      out[key] = value.slice(0, 600) + "…";
      continue;
    }
    out[key] = value;
  }
  return out;
}

function write(level, event, meta = {}) {
  const payload = {
    level,
    event,
    ts: new Date().toISOString(),
    ...cleanMeta(meta)
  };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  info: (event, meta = {}) => write("info", event, meta),
  warn: (event, meta = {}) => write("warn", event, meta),
  error: (event, meta = {}) => write("error", event, meta)
};
