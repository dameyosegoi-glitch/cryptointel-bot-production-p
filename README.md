# CryptoIntel Bot

Telegram-only crypto intelligence bot using Node.js ES modules and grammY.

## Features

1) Token security scans with SAFE, RISKY, SCAM, or insufficient data verdicts.
2) Market and price analysis from public token data sources.
3) NFT collection intelligence with optional OpenSea keyed data.
4) Public wallet summaries for EVM and Solana-style addresses.
5) Crypto news and trending narrative summaries.
6) Token sentiment analysis from available market and news signals.
7) Automatic address detection in normal chat.
8) Production-safe logs without printing secrets.

## Architecture

The service runs as a single Node.js process.

src/index.js starts the bot, clears Telegram webhooks, and runs grammY polling with retry backoff.
src/bot.js creates the grammY bot and wires commands before the catch-all agent.
src/commands contains one module per public command.
src/features/agent.js detects addresses in normal chat.
src/services contains domain services for security, market, NFT, wallet, news, and sentiment.
src/lib contains config, logging, AI Gateway, HTTP, and backpressure helpers.
src/utils contains address detection, formatting, and Telegram reply helpers.

## Setup

Requirements:

1) Node.js 18 or newer.
2) A Telegram bot token from BotFather.
3) CookMyBots AI Gateway endpoint and key.

Install:

npm install

Configure:

Copy .env.sample to .env and fill in TELEGRAM_BOT_TOKEN, COOKMYBOTS_AI_ENDPOINT, and COOKMYBOTS_AI_KEY.

Run locally:

npm run dev

Start production:

npm start

## Commands

/start
Expected output: welcome message, supported chains, scam-safety reminder.

/help
Expected output: full command list with examples.

/about
Expected output: capabilities, data sources, limitations, and disclaimer.

/scan 0xcontractaddress
Expected output: scan block with token, chain, verdict, findings, sources, and disclaimer.

/price ETH
Expected output: price, 24h change, market cap, volume, signal, key levels, sources, and disclaimer.

/nft Pudgy Penguins
Expected output: floor, trends when available, volume, holders, listings, risk, sources, and unavailable metrics.

/wallet 0xwalletaddress
Expected output: public wallet summary, unavailable metrics where source coverage is missing, and private-key warning.

/news
Expected output: latest news, trending narratives, source list, and disclaimer.

/sentiment SOL
Expected output: bullish, bearish, neutral estimate, main drivers, limitations, sources, and disclaimer.

## Integrations

Telegram is handled by grammY.

CookMyBots AI Gateway is called at COOKMYBOTS_AI_ENDPOINT/chat for synthesis and COOKMYBOTS_AI_ENDPOINT/chaingpt/news for crypto news. The bot reads normalized chat output from response.output.content.

DEXScreener is used for token pair, liquidity, price, and volume data.

CoinGecko is used for market search, market data, and trending coins.

GoPlus and Honeypot.is are used for supported token security checks.

OpenSea is optional and uses OPENSEA_API_KEY if configured.

Magic Eden public endpoints are used where collection slugs are supported.

Solana public RPC is used for simple native SOL balance checks.

All external calls have timeouts, safe logging, and graceful fallback behavior.

## Database

This cold-start version intentionally does not include MongoDB or persistent memory. It does not store seed phrases, private keys, or long-term chat memory.

## Deployment

Render-style deployment:

Build command: npm run build
Start command: npm start

Required environment variables:

TELEGRAM_BOT_TOKEN
COOKMYBOTS_AI_ENDPOINT
COOKMYBOTS_AI_KEY

Optional environment variables:

OPENSEA_API_KEY
AI_TIMEOUT_MS
AI_MAX_RETRIES
CONCURRENCY
GLOBAL_AI_CAP
EXTERNAL_TIMEOUT_MS

## Troubleshooting

If the bot exits on boot, verify TELEGRAM_BOT_TOKEN is set.

If AI summaries are missing, verify COOKMYBOTS_AI_ENDPOINT is a base URL and COOKMYBOTS_AI_KEY is set.

If NFT data is limited, set OPENSEA_API_KEY or try a collection slug supported by Magic Eden public endpoints.

If polling conflicts occur during deploy overlap, the bot logs the conflict and retries with backoff.

Logs only print presence booleans for secrets, never secret values.

## Extensibility

Add a new command by creating src/commands/name.js with a default register(bot) export.

Add source integrations under src/services and call them from src/services/intel.js.

Keep /help, DOCS.md, and Telegram command registration in sync with public commands.

## Safety note

Educational analysis only, DYOR, not financial advice. Never share seed phrases or private keys.
