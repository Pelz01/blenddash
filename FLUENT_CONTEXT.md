# Fluent Ecosystem Tools Context

This document captures the working context for building the four tools requested in Dino's X post:

https://x.com/blendino/status/2052398736756633761

## Source Tweet

Dino said @Eli5defi has continued building `blendiction.xyz`, called it an increasingly useful resource for the Fluent community, and asked for more tools like it.

Suggested ideas from the tweet:

1. Dashboards that compare Fluent revenue streams with other projects
2. Request for apps aggregator of ideas the team and community find compelling
3. Visual representations of existing, in-development, and desired reputation signals
4. Reputation leaderboards across different contexts

## What Fluent Is

Fluent is an Ethereum L2 built around blended execution. It aims to let EVM, Wasm, and SVM-style applications or contracts run in one shared execution environment and compose atomically.

The practical thesis:

- Developers can use Solidity, Rust, Wasm-style tooling, and eventually SVM-style apps in one environment.
- Apps from different VM ecosystems can share state and interact without bridges.
- Users should not need separate wallets or flows for each VM ecosystem.
- Fluent is positioning itself as the chain for reputation-based apps.

Important technical concepts:

- `rWasm`: Fluent's low-level VM/intermediate representation.
- Blended execution: different VMs are not separate silos; they are compiled/simulated into one execution model.
- Fluentbase SDK: framework for deploying Wasm/Rust contracts and blended apps.
- `gblend`: CLI tooling for Fluent app development.
- Prints: Fluent's reputation primitive.
- Fluent Connect: user/app layer around reputation, identity, social data, and perks.

## Official Fluent Network Details

From Fluent docs:

- Network Name: Fluent Mainnet
- RPC: https://rpc.fluent.xyz/
- Chain ID: `25363`
- Gas Symbol: `ETH`
- Explorer: https://fluentscan.xyz/
- Portal / bridge: https://portal.fluent.xyz/

Important correction:

- Do not assume BLEND is the gas token. Official network docs list gas symbol as `ETH`.

## Key Fluent Links

- Main site: https://www.fluent.xyz/
- Docs: https://docs.fluent.xyz/
- Fluent overview: https://docs.fluent.xyz/knowledge-base/fluent-overview/
- Blended 101: https://www.fluent.xyz/blended-101
- Connect to Fluent: https://docs.fluent.xyz/connect-to-fluent/
- FluentScan: https://fluentscan.xyz/
- Portal: https://portal.fluent.xyz/
- Fluent Connect: https://connect.fluent.xyz/
- Unofficial ecosystem map: https://blendiction.xyz/
- Goldsky Fluent page: https://goldsky.com/chains/fluent
- DefiLlama Fluent page: https://defillama.com/chain/fluent

## Current Ecosystem Notes

The unofficial ecosystem map at `blendiction.xyz` lists Fluent ecosystem apps and presents Fluent as mainnet live.

Apps/examples mentioned there include:

- Fluent
- Fluent Connect
- Vena Finance
- Flux
- Blend
- Sprout
- Yumi Finance
- Nerona
- Pump Pals
- Sunrise
- Pulse Predictor

Notable ecosystem framing:

- Prints is the reputation primitive every Fluent app can read from.
- Pulse Predictor's Predictor Score is described as feeding into a user's Print.
- Vena Finance is framed around reputation-priced capital.
- Flux is framed as a native DEX for Fluent.
- Fluent Connect is framed around building a Print and reputation identity.

## Confirmed Data Sources

### FluentScan / Blockscout

Mainnet API endpoint tested:

```txt
https://fluentscan.xyz/api/v2/stats
```

It returns live values such as:

- average block time
- gas prices
- gas used today
- total addresses
- total blocks
- total transactions
- transactions today
- network utilization

Transaction endpoint tested:

```txt
https://fluentscan.xyz/api/v2/transactions?filter=validated
```

Useful fields:

- transaction hash
- from / to
- contract verification status
- method name
- gas used
- fee value
- timestamp
- block number
- decoded input where available

### Goldsky

Goldsky has a Fluent chain page and says Fluent is supported for:

- Mainnet
- Testnet
- Public Devnet

Products listed:

- Mirror
- Subgraphs
- Turbo
- Compose

This is probably the strongest indexing route for production data pipelines.

### DefiLlama

DefiLlama has a Fluent page:

```txt
https://defillama.com/chain/fluent
```

Important caveat:

- The page exists, but the surfaced TVL snapshot showed `$0`.
- Do not assume complete Fluent protocol-level coverage.
- Use DefiLlama for peer comparisons, but source-check Fluent-specific values.

### Fluent Connect / Prints

The Fluent Connect privacy policy confirms Fluent Connect may use:

- X / Twitter account information
- GitHub account information
- Discord account information
- wallet address / transaction data
- third-party reputation data sources
- reputation tiers or scores

Important caveat:

- Public API availability for Prints was not confirmed.
- Treat Prints data as partner/API-needed until official docs or access exists.

## Unconfirmed Or Risky Assumptions

Do not treat these as facts until verified:

- Dune has public Fluent raw tables
- Prints has a public API available to all builders
- Ethos Score is directly integrated into Fluent Prints
- BLEND is the gas token
- DefiLlama has complete Fluent fees/revenue/TVL coverage
- All app-specific reputation scores are public
- Global Prints leaderboard can be built without opt-in or partner access

## Idea 1: Revenue Comparables Dashboard

### Product Goal

Compare Fluent revenue streams and ecosystem activity against other chains/projects while making source confidence explicit.

### Core Features

- Fluent-native revenue dashboard
- Sequencer fee tracking
- App-specific fees where sourceable
- USDnr / sUSDnr flows if contract/API sources are identified
- BLEND buyback tracking only if official/contracts confirm it
- Peer comparisons against Base, Arbitrum, Optimism, Solana, and other relevant ecosystems
- TVL, fees, revenue, transactions, fees per transaction, growth trends
- Filters by time range:
  - 24h
  - 7d
  - 30d
  - all time
- Filters by category:
  - chain-level
  - DeFi
  - social
  - gaming
  - reputation apps
  - individual protocols
- Export CSV
- Shareable report links
- Revenue Health Score

### Revenue Health Score Draft

Possible inputs:

- source coverage
- fee activity
- peer comparability
- app attribution
- revenue diversity
- growth trend
- percentage of metrics verified

Important rule:

The score must show its formula and source confidence. No fake precision.

### Data Sources

Primary:

- FluentScan / Blockscout API
- Fluent RPC
- Goldsky indexing
- app contracts and verified ABIs

Secondary:

- DefiLlama
- app APIs
- official Fluent announcements
- official app docs

Peer comparison:

- DefiLlama fees/revenue/TVL
- chain explorers
- public APIs

### Current Risk

Revenue data is the most source-sensitive module. It should be built with placeholder/sample data until contracts and data sources are mapped.

## Idea 2: Request For Apps Aggregator

### Product Goal

Create a public board of app ideas the Fluent team and community want built.

This is likely the fastest first module to make useful.

### Core Features

- Public idea submission
- Fields:
  - title
  - description
  - category
  - why it fits Fluent
  - why it fits Prints
  - why it needs blended execution
  - links / references
  - expected difficulty
  - bounty/grant status
- Upvotes
- Comments
- Tags
- Official labels:
  - High priority
  - Grant-eligible
  - Prints-native
  - Needs blended execution
  - Team requested
  - Community requested
- Kanban board:
  - Backlog
  - In Progress
  - Shipped
- Adopted-by section showing builders or teams working on ideas
- Shipped-app archive
- X / Discord auto-posting for top ideas
- Builder profile pages

### Suggested Categories

- Reputation / Prints
- DeFi
- Analytics
- Consumer
- Social
- Gaming
- Infrastructure
- Developer tooling
- Distribution
- Identity

### Why This Matters

This turns Dino's request into a live coordination surface. The community can see what is wanted, builders can claim ideas, and Fluent can point grants or attention at the right work.

### Data Sources

- Manual submissions
- Fluent team/community tags
- Discord discussions
- X posts
- GitHub repos
- shipped app links

### Current Risk

Low technical risk. Main risk is moderation and official/community signal quality.

## Idea 3: Reputation Signal Map

### Product Goal

Make the Prints reputation system legible by showing signals that are live, in development, and desired.

### Core Features

- Interactive signal map
- Three main states:
  - Live
  - In Development
  - Community Desired
- Click a signal to view:
  - what data it uses
  - source
  - owner
  - verification status
  - apps consuming it
  - example integration
  - privacy considerations
  - related app requests
- Community suggestion form for new signals
- Version history:
  - added this week
  - added this month
  - deprecated
  - changed weighting
- Export as image/PDF for presentations

### Example Signals

Live or plausible:

- wallet activity
- social verification
- prediction accuracy from Pulse Predictor
- onchain transaction history
- lending/borrowing behavior from Vena if integrated

In development or needs validation:

- app analytics
- creator/fan score
- Prints API
- partner app scores

Desired:

- builder reliability
- new-user onboarding help
- cross-app composability score
- content creation quality
- governance participation quality
- useful community support

### Important Product Rule

Do not flatten reputation into one score too early.

Better model:

- Prints as a container of contextual signals
- each signal has source, scope, freshness, and confidence
- apps choose which signals matter for their use case

### Data Sources

- Fluent Connect / Prints if accessible
- FluentScan / RPC
- app-specific APIs or indexed contracts
- community submissions
- Discord/X/GitHub where appropriate

### Current Risk

Medium risk. It is product-critical but may require partner/API access for real Prints data.

## Idea 4: Contextual Reputation Leaderboards

### Product Goal

Build leaderboards that rank users by context, not a generic global clout score.

### Core Features

- Global Prints leaderboard only if official/public data supports it
- Context-specific tabs:
  - Predictors
  - DeFi lenders
  - Traders
  - Social contributors
  - Builders
  - DAO/governance participants
  - Liquidity providers
  - App reviewers
  - New-user helpers
- Filters:
  - 7d
  - 30d
  - all time
  - minimum activity threshold
  - app
  - signal type
- User profile pages:
  - signal breakdown
  - apps used
  - rank history
  - confidence/source labels
- Rising Stars section
- Historical rank changes
- Embeddable widgets for Fluent apps

### Example Contexts

Predictors:

- source: Pulse Predictor
- metric: prediction accuracy, streaks, breadth of markets, recency

Lenders:

- source: Vena / partner API
- metric: repayment history, utilization, risk behavior

Traders:

- source: Flux indexed events
- metric: volume quality, pool interaction, retention

Builders:

- source: Request board + GitHub + manual review
- metric: accepted ideas, shipped apps, maintenance

Social contributors:

- source: Fluent Connect / X / Discord
- metric: useful posts, support, verified identity

### Current Risk

High if using real user reputation. Need opt-in, source clarity, privacy care, and potentially official Fluent/Prints access.

## Current Frontend Implementation

Project root:

```txt
C:\Users\faley\Documents\New project 2
```

Current local app:

```txt
http://127.0.0.1:5173/
```

Implemented as a Vite React app.

Files:

```txt
package.json
index.html
src/main.jsx
src/App.jsx
src/styles.css
```

Current frontend modules:

- left-side module navigation
- Revenue tab
- Requests tab
- Signals tab
- Leaderboards tab
- summary metrics
- request idea form
- local upvotes
- kanban columns
- signal map columns
- revenue source-confidence table

## Suggested Build Order

1. Request For Apps aggregator
2. Reputation Signal Map
3. Revenue Comparables
4. Contextual Leaderboards

Why:

- Requests can ship fastest and coordinate builders immediately.
- Signal Map explains Fluent/Prints and creates the taxonomy for later modules.
- Revenue requires careful source validation.
- Leaderboards require the most care around privacy, opt-in, and real reputation data.

## Product Principle

This is not a marketing site.

The product should feel like an ecosystem operating desk:

- dense
- usable
- source-aware
- builder-focused
- honest about what is verified
- useful even before all APIs exist

## Design Direction

The interface should prioritize:

- app/workbench layout over landing-page layout
- clear tabs or side navigation
- tables, boards, filters, and forms
- compact cards
- provenance labels
- state tags
- zero fake metrics

Avoid:

- generic crypto landing page
- oversized hero with no function
- decorative bento sections that do not help builders
- invented revenue numbers
- pretending unconfirmed APIs exist

## Open Questions

- Is there an official Prints API?
- Which Fluent apps expose public APIs?
- Which contracts correspond to USDnr, sUSDnr, sequencer fees, relayer fees, and app revenue?
- Are BLEND buybacks visible onchain?
- Does Fluent have an official grants/bounty process?
- Should request tags be community-only, team-only, or both?
- What moderation model should the request board use?
- Should user leaderboards require wallet/social opt-in?

## Useful API Starting Points

FluentScan stats:

```txt
https://fluentscan.xyz/api/v2/stats
```

FluentScan transactions:

```txt
https://fluentscan.xyz/api/v2/transactions?filter=validated
```

Fluent RPC:

```txt
https://rpc.fluent.xyz/
```

DefiLlama Fluent:

```txt
https://defillama.com/chain/fluent
```

Goldsky Fluent:

```txt
https://goldsky.com/chains/fluent
```

## Notes From Research

Confirmed:

- Fluent mainnet exists in official docs.
- Chain ID is `25363`.
- Gas symbol is `ETH`.
- FluentScan is live and exposes Blockscout-style APIs.
- Goldsky supports Fluent.
- DefiLlama has a Fluent page.
- Fluent Connect privacy docs mention reputation tiers/scores and connected accounts.

Not confirmed:

- Dune raw Fluent tables.
- public Prints API.
- Ethos direct integration.
- complete DefiLlama Fluent metrics.
- official buyback contracts.

Keep these distinctions visible in the product.
