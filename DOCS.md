# CryptoIntel Bot

CryptoIntel Bot is a Telegram-only crypto intelligence assistant built with Node.js ES modules and grammY. It provides token security scans, market analysis, NFT intelligence, public wallet summaries, crypto news, and sentiment analysis.

All trading-related output is educational only, cites available sources, and avoids financial advice.

## Commands

### /start
Usage: /start

Welcomes the user, explains the bot purpose, lists important commands, mentions supported chains, and shows a scam-safety reminder.

### /help
Usage: /help

Shows all public commands with syntax and examples.

### /about
Usage: /about

Describes capabilities, supported data sources, limitations, and the no-financial-advice disclaimer.

### /scan
Usage: /scan 0xcontractaddress

Runs a token security scan for an EVM contract address. The bot attempts to gather token metadata, DEX liquidity and volume, GoPlus security flags, Honeypot.is sellability data, owner or mint risks when available, blacklist indicators, and liquidity depth.

Output includes a verdict first: SAFE, RISKY, SCAM, or insufficient data.

### /price
Usage: /price ETH
Usage: /price 0xcontractaddress

Fetches current price, 24h change, market cap, volume, pair data, and a short signal. RSI, MACD, and EMA are shown only when sufficient public OHLC data exists. Otherwise the bot says indicator data is unavailable.

### /nft
Usage: /nft Pudgy Penguins

Searches NFT collection data from OpenSea when OPENSEA_API_KEY is configured and Magic Eden public endpoints where possible. Missing keyed data is reported clearly without crashing.

### /wallet
Usage: /wallet 0xwalletaddress
Usage: /wallet SolanaWalletAddress

Validates public EVM or Solana-style wallet addresses. Solana native balance is fetched from public Solana RPC when available. EVM holdings, full NFT portfolio, and PnL are reported as unavailable unless indexed public data is available.

The bot never asks for seed phrases or private keys.

### /news
Usage: /news

Fetches latest crypto news and trends from CookMyBots ChainGPT news through the CookMyBots AI Gateway and CoinGecko trending data. AI is used to summarize and rank after source data is collected.

### /sentiment
Usage: /sentiment SOL

Collects market, trend, and news signals where available, then uses AI to summarize bullish, bearish, and neutral drivers with limitations.

## Normal chat routing

If a user pastes a likely EVM contract address, the bot runs a security-oriented scan.

If a user pastes a likely Solana wallet address, the bot runs a public wallet summary.

In groups, the bot only responds when mentioned by username or when a user replies to a bot message.

## Environment variables

TELEGRAM_BOT_TOKEN is required. It is the Telegram bot token from BotFather.

COOKMYBOTS_AI_ENDPOINT is required for AI synthesis. It must be a base URL such as https://api.cookmybots.com/api/ai and must not include /chat.

COOKMYBOTS_AI_KEY is required for AI synthesis and ChainGPT news access through CookMyBots.

OPENSEA_API_KEY is optional. If missing, NFT features use public endpoints where possible and clearly say OpenSea keyed data is unavailable.

AI_TIMEOUT_MS is optional and defaults to 600000.

AI_MAX_RETRIES is optional and defaults to 2.

CONCURRENCY is optional and defaults to 20.

GLOBAL_AI_CAP is optional and defaults to 1 to protect memory and avoid overlapping AI jobs.

EXTERNAL_TIMEOUT_MS is optional and defaults to 20000.

## Data sources

The bot uses these public or keyed sources when available:

1) DEXScreener for token pairs, liquidity, volume, and price.
2) CoinGecko for token market data and trending coins.
3) GoPlus for token security flags on supported EVM chains.
4) Honeypot.is for honeypot checks on supported chains.
5) OpenSea for NFT stats when OPENSEA_API_KEY is configured.
6) Magic Eden public endpoints for collection stats where available.
7) Solana public RPC for native SOL balance.
8) CookMyBots AI Gateway for AI synthesis and ChainGPT news.

## Limitations

Crypto data can be stale, incomplete, rate-limited, or unavailable.

The bot does not have private exchange data, private wallet data, seed phrases, private keys, or guaranteed token holder data.

Technical indicators are not invented. If there is not enough OHLC/history data, the bot says RSI, MACD, or EMA are unavailable.

Wallet PnL is only reliable when historical transaction and cost basis data exists. Otherwise the bot says PnL cannot be reliably estimated.

## Setup

1) Install dependencies with npm install.
2) Copy .env.sample to .env.
3) Set TELEGRAM_BOT_TOKEN.
4) Set COOKMYBOTS_AI_ENDPOINT and COOKMYBOTS_AI_KEY.
5) Optionally set OPENSEA_API_KEY.
6) Run npm run dev locally or npm start in production.

## Deployment

Use one Render-style Node.js service.

Build command: npm run build
Start command: npm start

The service uses grammY long polling and clears webhooks before polling starts. It retries polling conflicts and rate-limit failures with backoff.

## Safety

Never share seed phrases, private keys, or recovery phrases with the bot or anyone else.

Do not trust fake airdrops, unknown approval requests, impersonator links, or messages asking you to connect a wallet urgently.

All bot responses are educational analysis only, DYOR, and not financial advice.
