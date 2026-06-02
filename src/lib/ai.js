import { cfg } from "./config.js";
import { createBotProfile } from "./botProfile.js";
import { log, safeErr } from "./logger.js";

function trimSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readJson(response) {
  const text = await response.text();
  try {
    return { text, json: JSON.parse(text) };
  } catch {
    return { text, json: null };
  }
}

function withTimeout(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { controller, clear: () => clearTimeout(timer) };
}

function isRetryable(status) {
  return status === 408 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

export async function aiChat({ feature, messages = [], meta = {}, timeoutMs = cfg.AI_TIMEOUT_MS } = {}) {
  const base = trimSlash(cfg.COOKMYBOTS_AI_ENDPOINT);
  const key = cfg.COOKMYBOTS_AI_KEY;

  log.info("ai.chat.start", {
    platform: "telegram",
    feature,
    endpointSet: Boolean(base),
    keySet: Boolean(key)
  });

  if (!base || !key) {
    log.warn("ai.chat.failure", { platform: "telegram", feature, err: "AI gateway not configured" });
    return { ok: false, content: "", error: "AI gateway not configured" };
  }

  const body = {
    messages: [
      { role: "system", content: createBotProfile() },
      ...messages
    ],
    meta: {
      platform: "telegram",
      feature,
      ...meta
    }
  };

  let attempt = 0;
  const maxRetries = Math.max(0, Number(cfg.AI_MAX_RETRIES || 0));

  while (true) {
    attempt += 1;
    const started = Date.now();
    const { controller, clear } = withTimeout(timeoutMs);

    try {
      const response = await fetch(`${base}/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      const { text, json } = await readJson(response);
      const ms = Date.now() - started;

      if (!response.ok) {
        const err = json?.error?.message || json?.message || json?.error || text || `HTTP ${response.status}`;
        log.warn("ai.chat.failure", { platform: "telegram", feature, status: response.status, attempt, ms, err: String(err).slice(0, 500) });
        if (attempt <= maxRetries && isRetryable(response.status)) {
          await sleep(750 * attempt);
          continue;
        }
        return { ok: false, content: "", error: String(err), status: response.status };
      }

      const content = json?.output?.content;
      if (typeof content !== "string" || !content.trim()) {
        const err = "AI response missing output.content";
        log.warn("ai.chat.failure", { platform: "telegram", feature, status: response.status, attempt, ms, err });
        return { ok: false, content: "", error: err, status: response.status };
      }

      log.info("ai.chat.success", { platform: "telegram", feature, status: response.status, attempt, ms });
      return { ok: true, content: content.trim(), status: response.status };
    } catch (err) {
      const msg = err?.name === "AbortError" ? "AI timeout" : safeErr(err);
      log.warn("ai.chat.failure", { platform: "telegram", feature, attempt, timeout: err?.name === "AbortError", err: msg });
      if (attempt <= maxRetries) {
        await sleep(750 * attempt);
        continue;
      }
      return { ok: false, content: "", error: msg };
    } finally {
      clear();
    }
  }
}

export async function aiCryptoNews({ limit = 5 } = {}) {
  const base = trimSlash(cfg.COOKMYBOTS_AI_ENDPOINT);
  const key = cfg.COOKMYBOTS_AI_KEY;
  const safeLimit = Math.max(1, Math.min(Number(limit || 5), 20));

  log.info("ai.news.start", {
    platform: "telegram",
    feature: "news",
    endpointSet: Boolean(base),
    keySet: Boolean(key)
  });

  if (!base || !key) return { ok: false, data: [], error: "AI gateway not configured" };

  const { controller, clear } = withTimeout(cfg.AI_TIMEOUT_MS);
  try {
    const response = await fetch(`${base}/chaingpt/news?limit=${encodeURIComponent(String(safeLimit))}`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: controller.signal
    });
    const { text, json } = await readJson(response);
    if (!response.ok) {
      const err = json?.error?.message || json?.message || json?.error || text || `HTTP ${response.status}`;
      log.warn("ai.news.failure", { platform: "telegram", feature: "news", status: response.status, err: String(err).slice(0, 500) });
      return { ok: false, data: [], error: String(err), status: response.status };
    }
    const data = json?.output?.data || [];
    log.info("ai.news.success", { platform: "telegram", feature: "news", status: response.status, count: Array.isArray(data) ? data.length : 0 });
    return { ok: true, data, status: response.status };
  } catch (err) {
    const msg = err?.name === "AbortError" ? "AI news timeout" : safeErr(err);
    log.warn("ai.news.failure", { platform: "telegram", feature: "news", err: msg });
    return { ok: false, data: [], error: msg };
  } finally {
    clear();
  }
}

export async function synthesize({ feature, language, facts, fallback, instruction }) {
  const prompt = [
    instruction || "Create the final user response from the collected facts.",
    "Keep it under 300 words. Cite only the sources present in the facts. Do not give financial advice.",
    language === "id" ? "Use basic Indonesian." : "Use English.",
    "Facts:",
    JSON.stringify(facts).slice(0, 9000)
  ].join("\n");

  const result = await aiChat({
    feature,
    messages: [
      { role: "user", content: prompt }
    ],
    meta: { language }
  });

  return result.ok && result.content ? result.content.slice(0, 3500) : fallback;
}
