// ─── RFA Board — React Server Component ───────────────────────────────────────
// Fetches real RFA ideas from Fluent's GitHub issues at build time.
// Falls back to seed data + submission CTA when no GitHub RFAs exist (current state).

import RFABoard from "./rfa-board";
import { seedRFAs, type SeedRFA } from "@/data/rfa-seed";
import type { GitHubRFA } from "./rfa-board";

// ─── GitHub API fetch (build time) ───────────────────────────────────────────

const GITHUB_API = "https://api.github.com";
const FLUENT_ORG = "fluentlabs-xyz";

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  repository_url: string;
  user: { login: string } | null;
  created_at: string;
  reactions: { "+1": number; "-1": number };
  labels: Array<{ name: string }>;
  state: string;
}

/**
 * Search Fluent's GitHub org for issues labeled as RFA / idea / feature-request.
 * Returns empty array on any failure (network, rate limit, no results).
 */
async function fetchGitHubRFAs(): Promise<GitHubRFA[]> {
  try {
    // Try the labelled-issues search first
    const query = encodeURIComponent(
      `org:${FLUENT_ORG} label:rfa,request-for-apps,idea,feature-request type:issue`
    );
    const url = `${GITHUB_API}/search/issues?q=${query}&per_page=30`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        // Include token if available (rate limit: 60/hr unauthenticated, 5000/hr with token)
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      // Next.js 16: fetch is NOT cached by default in Server Components
      // Revalidate every 15 minutes for freshness
      next: { revalidate: 900 },
    });

    if (!res.ok) {
      console.warn(`[rfa] GitHub search returned ${res.status}`);
      return [];
    }

    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      // No labelled issues found — try searching all issues for RFA-related terms
      return await searchAllIssues();
    }

    return data.items.map(mapGitHubIssue);
  } catch (err) {
    console.warn("[rfa] GitHub fetch failed:", err);
    return [];
  }
}

/**
 * Fallback: search all Fluent org issues for RFA-related keywords in title/body.
 */
async function searchAllIssues(): Promise<GitHubRFA[]> {
  try {
    const query = encodeURIComponent(
      `org:${FLUENT_ORG} (RFA OR "request for app" OR "app idea" OR "project idea") in:title,body type:issue`
    );
    const url = `${GITHUB_API}/search/issues?q=${query}&per_page=30`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      next: { revalidate: 900 },
    });

    if (!res.ok) return [];
    const data = await res.json();
    if (!data.items) return [];
    return data.items.map(mapGitHubIssue);
  } catch {
    return [];
  }
}

// ─── Mapping ─────────────────────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, GitHubRFA["category"]> = {
  defi: "DeFi",
  dex: "DeFi",
  yield: "DeFi",
  lending: "DeFi",
  stablecoin: "DeFi",
  amm: "DeFi",
  perp: "DeFi",
  trading: "DeFi",
  tooling: "Tooling",
  cli: "Tooling",
  sdk: "Tooling",
  dev: "Tooling",
  explorer: "Tooling",
  ide: "Tooling",
  testing: "Tooling",
  fuzzing: "Tooling",
  infra: "Infrastructure",
  infrastructure: "Infrastructure",
  oracle: "Infrastructure",
  bridge: "Infrastructure",
  identity: "Infrastructure",
  compute: "Infrastructure",
  social: "Social",
  governance: "Social",
  dao: "Social",
  feed: "Social",
  community: "Social",
  nft: "Social",
  reputation: "Social",
};

function inferCategory(title: string, body: string | null): GitHubRFA["category"] {
  const text = `${title} ${body ?? ""}`.toLowerCase();
  for (const [keyword, cat] of Object.entries(CATEGORY_KEYWORDS)) {
    if (text.includes(keyword)) return cat;
  }
  return "Tooling"; // default
}

function inferStatus(
  state: string,
  labels: Array<{ name: string }>
): GitHubRFA["status"] {
  if (state === "closed") return "Funded";
  const labelNames = labels.map((l) => l.name.toLowerCase());
  if (labelNames.some((n) => n.includes("in progress") || n.includes("wip")))
    return "In Progress";
  if (labelNames.some((n) => n.includes("funded") || n.includes("grant")))
    return "Funded";
  return "Open";
}

function mapGitHubIssue(issue: GitHubIssue): GitHubRFA {
  return {
    id: `gh-${issue.number}`,
    title: issue.title,
    description: (issue.body ?? "").slice(0, 280),
    category: inferCategory(issue.title, issue.body),
    submitter: issue.user?.login ?? "anonymous",
    votes: issue.reactions?.["+1"] ?? 0,
    status: inferStatus(issue.state, issue.labels ?? []),
    createdAt: issue.created_at,
    url: issue.html_url,
  };
}

// ─── Seed conversion ─────────────────────────────────────────────────────────

function seedToGitHubRFA(seed: SeedRFA): GitHubRFA {
  return { ...seed, isSeed: true };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function RFAPage() {
  // 1. Try GitHub API first
  const githubRFAs = await fetchGitHubRFAs();

  if (githubRFAs.length > 0) {
    return (
      <RFABoard initialRFAs={githubRFAs} fetchedFrom="github" />
    );
  }

  // 2. Fall back to seed data (Dino's tweet-inspired ideas)
  const seedEntries = seedRFAs.map(seedToGitHubRFA);
  return (
    <RFABoard initialRFAs={seedEntries} fetchedFrom="seed" />
  );
}
