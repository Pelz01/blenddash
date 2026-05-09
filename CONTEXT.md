# BlendDash

Fluent ecosystem community tools — revenue dashboards, RFA board, reputation map, and leaderboards. Built for the Fluent community, inspired by [Dino's call for tools](https://x.com/blendino/status/2052398736756633761).

## Origin — The Tweet

On May 7, 2026, **Dino** ([@blendino](https://x.com/blendino)), co-founder of Fluent, quote-tweeted the Fluent Ecosystem account and said:

> *"Our good friend @Eli5defi has continued building upon blendiction.xyz, it's becoming an incredible resource for the community and I've been using it as a tool myself.*
>
> *Would love to see other tools like this. If you're interested, here are some ideas:*
> - *Dashboards that compare Fluent revenue streams with other projects*
> - *Request for apps aggregator of ideas the team and community find compelling*
> - *Visual representations of existing, in development and desired reputation signals*
> - *Reputation leaderboards across different contexts"*

This is an open call from the Fluent co-founder for community-built tooling. BlendDash is the answer — all four ideas in one site.

## What BlendDash Builds

| Section | Route | What it does | Data source |
|---|---|---|---|
| **Revenue Compare** | `/revenue` | Live TVL comparison across Fluent and comparable chains (Monad, MegaETH, Eclipse, Abstract) | [DefiLlama API](https://defillama.com) — real-time, 15-min cache |
| **RFA Board** | `/rfa` | Browse and submit "Request for Apps" ideas. Category filtering, voting, real GitHub submission pipeline | GitHub Issues → [Pelz01/blenddash](https://github.com/Pelz01/blenddash/issues/new?labels=rfa) with pre-filled RFA template |
| **Reputation** | `/reputation` | Signal map (13 signals across 4 categories: Identity, Activity, Social, Governance) + community-editable leaderboard (10 verified projects) | Fluent docs, GitHub org, fluent.xyz, and community PRs to `src/data/reputation.json` |

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Fonts:** Geist Sans (body), Geist Mono (data/numbers)
- **Deployment:** Vercel (auto-deploys on push to `main`)
- **Data:** React Server Components with ISR revalidation

## Design

Dark theme with this palette:
- **Background:** Near-black warm base (`oklch(0.10 0.006 280)`)
- **Cards:** Slightly elevated (`oklch(0.13 0.007 280)`)
- **Accent:** Teal-green (`oklch(0.65 0.15 175)`) — used sparingly
- **Borders:** Warm-toned, low contrast (`oklch(0.22 0.006 280)`)
- **Numbers:** All in `font-mono tabular-nums` — crypto/dashboard standard
- **Deltas:** Green with `+` and red with `-` for color-blind accessibility

Design rules:
- No pure black `#000000`
- No `transition: all` — per-property transitions only
- No default CSS `ease` curves
- Content lives in defined panels, never floating on bare background
- Single accent color with clear semantic role

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout (nav + footer)
│   ├── globals.css           # Design tokens + Tailwind theme
│   ├── revenue/
│   │   └── page.tsx          # Revenue Compare (server component, DefiLlama fetch)
│   ├── rfa/
│   │   ├── page.tsx          # RFA Board (server component, GitHub API fetch)
│   │   └── rfa-board.tsx     # RFA Board client (filtering, sorting, interactivity)
│   └── reputation/
│       └── page.tsx          # Reputation Map + Leaderboard (client component)
├── components/
│   ├── nav.tsx               # Sticky nav bar
│   └── ui/                   # shadcn/ui components (card, table, tabs, badge, etc.)
├── data/
│   ├── reputation.json       # Community-editable leaderboard data
│   └── rfa-seed.ts           # Seed RFA ideas + submission URL
└── lib/
    └── utils.ts              # cn() utility
```

## Data — What's Real vs What's Coming

### Revenue Compare
- **Real:** TVL data from DefiLlama for Monad ($385M), MegaETH ($725M), Eclipse ($1.3M), Abstract ($17M)
- **Missing:** Fluent is NOT listed on DefiLlama yet. The page shows how to submit a PR to get it added.
- **Missing:** Fee/revenue data — none of these newer chains have fee data on DefiLlama yet.

### RFA Board
- **Real:** Submission pipeline to GitHub Issues on this repo with pre-filled RFA template
- **Seed:** 3 ideas derived from Dino's public tweets about Fluent's blended execution
- **Missing:** Community submissions — the board grows as people submit

### Reputation
- **Real:** 10 verified Fluent ecosystem projects: Fluentbase SDK, rWasm, FluentScan, Fluent Prints, Nexus Bridge, gblend CLI, Native Bridge, revm-rwasm, Builder Mode, Hardhat Plugin
- **Sources:** fluent.xyz, docs.fluent.xyz, github.com/fluentlabs-xyz
- **Community-driven:** `src/data/reputation.json` has a contribution guide — submit PRs to update

## Key Design Decisions

1. **One site, four tools.** Revenue dashboards, RFA board, reputation map, and leaderboard share a design system and cross-link conceptually. A single Next.js app keeps deployment and maintenance simple.

2. **Real data where possible, honest where not.** DefiLlama API for TVL, GitHub API for RFAs, Fluent docs for ecosystem projects. Where data doesn't exist (Fluent not on DefiLlama, no community RFAs yet), the UI tells the user exactly why and how to fix it.

3. **Build-time fetching with ISR.** Revenue and RFA data revalidates every 15 minutes via Next.js ISR — fresh enough for dashboard data, fast enough for static serving.

4. **Community-editable data files.** The reputation leaderboard reads from a JSON file with contribution instructions — the community grows the data set via PRs.

5. **All numbers are `tabular-nums` monospace.** Non-negotiable for crypto dashboards. Green/red always paired with `+`/`-` signs.

## Contributing

- **Submit an RFA:** [Create an issue](https://github.com/Pelz01/blenddash/issues/new?labels=rfa) with the RFA template
- **Update the leaderboard:** Edit `src/data/reputation.json` and open a PR — follow the contribution guide in the file header
- **Add Fluent to DefiLlama:** Follow the [chain listing guide](https://docs.llama.fi/list-your-project/submit-a-chain) — once listed, revenue data will flow automatically
- **General improvements:** PRs welcome for any section

## Why "BlendDash"

From Fluent's core concept of **blended execution** — running programs across different VMs on a single chain. BlendDash blends multiple community tools into one dashboard, just like Fluent blends VMs.

---

Built by [@Pelz01](https://github.com/Pelz01)
