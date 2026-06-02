import "dotenv/config";
import { run } from "@grammyjs/runner";
import { cfg } from "./lib/config.js";
import { log, safeErr } from "./lib/logger.js";

process.on("unhandledRejection", (reason) => {
  log.error("process.unhandledRejection", { err: safeErr(reason) });
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  log.error("process.uncaughtException", { err: safeErr(err) });
  process.exit(1);
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function boot() {
  log.info("boot.start", {
    platform: "telegram",
    telegramTokenSet: Boolean(cfg.TELEGRAM_BOT_TOKEN),
    aiEndpointSet: Boolean(cfg.COOKMYBOTS_AI_ENDPOINT),
    aiKeySet: Boolean(cfg.COOKMYBOTS_AI_KEY),
    openSeaKeySet: Boolean(cfg.OPENSEA_API_KEY)
  });

  if (!cfg.TELEGRAM_BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is required. Add it in your environment and redeploy.");
    process.exit(1);
  }

  try {
    const { createBot } = await import("./bot.js");
    const bot = await createBot(cfg.TELEGRAM_BOT_TOKEN);

    await bot.init();

    await bot.api.setMyCommands([
      { command: "start", description: "Welcome and supported chains" },
      { command: "help", description: "Show command examples" },
      { command: "scan", description: "Token security scan" },
      { command: "price", description: "Market and price analysis" },
      { command: "nft", description: "NFT collection intelligence" },
      { command: "wallet", description: "Public wallet summary" },
      { command: "news", description: "Latest crypto news" },
      { command: "sentiment", description: "Token sentiment analysis" },
      { command: "about", description: "Capabilities and limitations" }
    ]);

    log.info("telegram.webhook.clear.start", { dropPendingUpdates: true });
    await bot.api.deleteWebhook({ drop_pending_updates: true });

    let lastMemLog = 0;
    const memTimer = setInterval(() => {
      const now = Date.now();
      if (now - lastMemLog < 60_000) return;
      lastMemLog = now;
      const m = process.memoryUsage();
      log.info("mem", {
        rssMB: Math.round(m.rss / 1e6),
        heapUsedMB: Math.round(m.heapUsed / 1e6)
      });
    }, 60_000);
    memTimer.unref?.();

    let backoffMs = 2_000;

    while (true) {
      let runner = null;
      try {
        log.info("telegram.polling.start", { concurrency: 1 });
        runner = run(bot, {
          sink: { concurrency: 1 },
          runner: {
            fetch: {
              allowed_updates: ["message"]
            }
          }
        });

        await runner.task();
        log.warn("telegram.polling.stopped", {});
        backoffMs = 2_000;
      } catch (err) {
        const msg = safeErr(err);
        const isConflict = msg.includes("409") || msg.toLowerCase().includes("conflict");
        const isRateLimit = msg.includes("429") || msg.toLowerCase().includes("too many requests");
        const isTimeout = msg.toLowerCase().includes("timeout") || msg.toLowerCase().includes("etimedout");

        log.error("telegram.polling.failure", {
          err: msg,
          conflict: isConflict,
          rateLimit: isRateLimit,
          timeout: isTimeout,
          retryInMs: backoffMs
        });

        try {
          await runner?.stop?.();
        } catch (stopErr) {
          log.warn("telegram.polling.stop.failure", { err: safeErr(stopErr) });
        }

        await sleep(backoffMs);
        backoffMs = Math.min(backoffMs === 2_000 ? 5_000 : backoffMs * 2, 20_000);
      }
    }
  } catch (err) {
    log.error("boot.failure", { err: safeErr(err), code: err?.code || "" });
    if (err?.code === "ERR_MODULE_NOT_FOUND") {
      console.error("Check that all relative imports include .js and all files exist under src/.");
    }
    process.exit(1);
  }
}

boot();
