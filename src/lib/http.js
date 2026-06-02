import { cfg } from "./config.js";
import { log, safeErr } from "./logger.js";

function withTimeout(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { controller, clear: () => clearTimeout(timer) };
}

function sourceHost(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "unknown";
  }
}

export async function fetchJson(url, { source, operation, headers = {}, timeoutMs = cfg.EXTERNAL_TIMEOUT_MS } = {}) {
  const host = sourceHost(url);
  const started = Date.now();
  log.info("external.call.start", { source, operation, host });

  const { controller, clear } = withTimeout(timeoutMs);
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "CryptoIntelBot/1.0",
        ...headers
      },
      signal: controller.signal
    });

    const text = await response.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    const ms = Date.now() - started;
    if (!response.ok) {
      const err = data?.error?.message || data?.message || text || `HTTP ${response.status}`;
      log.warn("external.call.failure", { source, operation, host, status: response.status, ms, err: String(err).slice(0, 500) });
      return { ok: false, data: null, status: response.status, error: String(err) };
    }

    log.info("external.call.success", { source, operation, host, status: response.status, ms });
    return { ok: true, data, status: response.status, error: "" };
  } catch (err) {
    const msg = err?.name === "AbortError" ? "timeout" : safeErr(err);
    log.warn("external.call.failure", { source, operation, host, timeout: err?.name === "AbortError", err: msg });
    return { ok: false, data: null, status: 0, error: msg };
  } finally {
    clear();
  }
}

export async function postJson(url, { source, operation, body = {}, headers = {}, timeoutMs = cfg.EXTERNAL_TIMEOUT_MS } = {}) {
  const host = sourceHost(url);
  const started = Date.now();
  log.info("external.call.start", { source, operation, host });

  const { controller, clear } = withTimeout(timeoutMs);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "CryptoIntelBot/1.0",
        ...headers
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    const text = await response.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    const ms = Date.now() - started;
    if (!response.ok) {
      const err = data?.error?.message || data?.message || text || `HTTP ${response.status}`;
      log.warn("external.call.failure", { source, operation, host, status: response.status, ms, err: String(err).slice(0, 500) });
      return { ok: false, data: null, status: response.status, error: String(err) };
    }

    log.info("external.call.success", { source, operation, host, status: response.status, ms });
    return { ok: true, data, status: response.status, error: "" };
  } catch (err) {
    const msg = err?.name === "AbortError" ? "timeout" : safeErr(err);
    log.warn("external.call.failure", { source, operation, host, timeout: err?.name === "AbortError", err: msg });
    return { ok: false, data: null, status: 0, error: msg };
  } finally {
    clear();
  }
}
