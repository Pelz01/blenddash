"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = "DeFi" | "Tooling" | "Infrastructure" | "Social";
type Status = "Open" | "In Progress" | "Funded";
type SortMode = "votes" | "newest";

interface RFA {
  id: string;
  title: string;
  description: string;
  category: Category;
  submitter: string;
  votes: number;
  status: Status;
  createdAt: string; // ISO date string for sort
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockRFAs: RFA[] = [
  {
    id: "rfa-001",
    title: "Cross-Chain Yield Aggregator",
    description:
      "Automatically route stablecoin deposits across Fluent, Solana, and Ethereum L2s to capture the best risk-adjusted yield. Dashboard with APY comparisons and portfolio rebalancing suggestions.",
    category: "DeFi",
    submitter: "0xalice",
    votes: 247,
    status: "Open",
    createdAt: "2026-05-01T12:00:00Z",
  },
  {
    id: "rfa-002",
    title: "Fluent Developer CLI Toolkit",
    description:
      "A unified CLI that scaffolds Fluent dApps, manages local testnets, runs integration tests, and deploys contracts. Built-in templates for common patterns like token launches and DAOs.",
    category: "Tooling",
    submitter: "dev_bob",
    votes: 189,
    status: "In Progress",
    createdAt: "2026-04-28T08:30:00Z",
  },
  {
    id: "rfa-003",
    title: "On-Chain Reputation Oracle",
    description:
      "Decentralized oracle that aggregates reputation signals from multiple protocols and DAOs into a portable on-chain score. Use cases: undercollateralized lending, gated communities.",
    category: "Infrastructure",
    submitter: "rep_dao",
    votes: 312,
    status: "Open",
    createdAt: "2026-05-05T15:45:00Z",
  },
  {
    id: "rfa-004",
    title: "Fluent Social Feed dApp",
    description:
      "A decentralized social feed where users post updates, tip content creators in FLUENT, and curate feeds via token-weighted voting. NFT badges for top contributors.",
    category: "Social",
    submitter: "social_whale",
    votes: 156,
    status: "Open",
    createdAt: "2026-04-20T09:00:00Z",
  },
  {
    id: "rfa-005",
    title: "MEV-Resistant DEX Router",
    description:
      "A DEX aggregation router that uses batch auctions and encrypted mempools to protect traders from MEV. Supports all major Fluent AMMs and cross-chain routes.",
    category: "DeFi",
    submitter: "mev_research",
    votes: 431,
    status: "Funded",
    createdAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "rfa-006",
    title: "Smart Contract Fuzzing as a Service",
    description:
      "Continuous fuzzing pipeline for Fluent Move contracts. GitHub integration, differential fuzzing against Solidity equivalents, and coverage reports in CI.",
    category: "Tooling",
    submitter: "sec_eng",
    votes: 203,
    status: "Open",
    createdAt: "2026-05-02T14:20:00Z",
  },
  {
    id: "rfa-007",
    title: "Decentralized Compute Marketplace",
    description:
      "A marketplace where users bid for off-chain compute (ZK proofs, ML inference) verified on Fluent. Reputation staking ensures honest execution with slashing.",
    category: "Infrastructure",
    submitter: "compute_guild",
    votes: 178,
    status: "In Progress",
    createdAt: "2026-04-10T11:00:00Z",
  },
  {
    id: "rfa-008",
    title: "Fluent Governance Dashboard",
    description:
      "Track all active and historical governance proposals across Fluent DAOs. Visualize voter turnout, delegation graphs, and simulate proposal outcomes.",
    category: "Social",
    submitter: "gov_nerd",
    votes: 94,
    status: "Open",
    createdAt: "2026-05-07T07:00:00Z",
  },
  {
    id: "rfa-009",
    title: "Perpetual Futures AMM",
    description:
      "A virtual AMM for perpetual futures with dynamic funding rates, partial liquidation engine, and insurance fund backed by staked FLUENT.",
    category: "DeFi",
    submitter: "perp_trader",
    votes: 523,
    status: "Funded",
    createdAt: "2026-02-20T16:00:00Z",
  },
  {
    id: "rfa-010",
    title: "Account Abstraction SDK",
    description:
      "Batteries-included SDK for building Fluent apps with ERC-4337 account abstraction. Social recovery, session keys, gas sponsorship, and paymaster integrations.",
    category: "Infrastructure",
    submitter: "aa_labs",
    votes: 367,
    status: "In Progress",
    createdAt: "2026-03-28T13:00:00Z",
  },
  {
    id: "rfa-011",
    title: "Fluent Block Explorer Redesign",
    description:
      "A modern, fast block explorer for Fluent with real-time transaction tracing, contract verification UI, token holdings view, and developer API.",
    category: "Tooling",
    submitter: "explorer_team",
    votes: 288,
    status: "Open",
    createdAt: "2026-05-03T10:30:00Z",
  },
  {
    id: "rfa-012",
    title: "Decentralized Identity Provider",
    description:
      "Self-sovereign identity on Fluent using verifiable credentials. One-click KYC/AML compliance for dApps, with zero-knowledge proofs for privacy-preserving verification.",
    category: "Social",
    submitter: "id_foundation",
    votes: 145,
    status: "Open",
    createdAt: "2026-04-25T12:00:00Z",
  },
];

// ─── Constants ───────────────────────────────────────────────────────────────

const ALL_CATEGORIES = ["All", "DeFi", "Tooling", "Infrastructure", "Social"] as const;
type FilterCategory = (typeof ALL_CATEGORIES)[number];

const statusVariant: Record<Status, "default" | "secondary" | "outline"> = {
  Open: "default",
  "In Progress": "secondary",
  Funded: "outline",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatVotes(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CategoryBadgeButton({
  category,
  isActive,
  onClick,
}: {
  category: FilterCategory;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-all",
        isActive
          ? "border-primary/60 bg-primary/15 text-primary"
          : "border-border/60 bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
      )}
    >
      {category}
    </button>
  );
}

function SortToggle({
  mode,
  current,
  onSelect,
  children,
}: {
  mode: SortMode;
  current: SortMode;
  onSelect: (m: SortMode) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={() => onSelect(mode)}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        current === mode
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <svg
          className="h-5 w-5 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        No RFAs found
      </p>
      <p className="mt-1 text-xs text-muted-foreground/60">
        Try selecting a different category or check back later.
      </p>
    </div>
  );
}

function UpvoteButton({ votes, disabled = true }: { votes: number; disabled?: boolean }) {
  return (
    <Button
      variant="ghost"
      size="xs"
      disabled={disabled}
      className="group/upvote h-auto gap-1 px-1.5 py-0.5 text-muted-foreground disabled:opacity-60"
    >
      <svg
        className="h-3.5 w-3.5 transition-colors group-hover/upvote:text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
      <span className="font-mono text-xs tabular-nums">{formatVotes(votes)}</span>
    </Button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RFAPage() {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("All");
  const [sortMode, setSortMode] = useState<SortMode>("votes");

  const filtered = useMemo(() => {
    let list = [...mockRFAs];

    // Filter by category
    if (activeCategory !== "All") {
      list = list.filter((rfa) => rfa.category === activeCategory);
    }

    // Sort
    if (sortMode === "votes") {
      list.sort((a, b) => b.votes - a.votes);
    } else {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return list;
  }, [activeCategory, sortMode]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* ── Heading ── */}
      <div className="mb-8">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Request for Apps
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          RFA Board
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Ideas the Fluent team and community find compelling. Browse, upvote,
          and submit your own proposals for projects that grow the ecosystem.
        </p>
      </div>

      {/* ── Filters & Sort ── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((cat) => (
            <CategoryBadgeButton
              key={cat}
              category={cat}
              isActive={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>

        {/* Sort toggles */}
        <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-0.5">
          <SortToggle mode="votes" current={sortMode} onSelect={setSortMode}>
            Most Voted
          </SortToggle>
          <SortToggle mode="newest" current={sortMode} onSelect={setSortMode}>
            Newest
          </SortToggle>
        </div>
      </div>

      {/* ── Card Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map((rfa) => (
            <Card
              key={rfa.id}
              size="sm"
              className="group/card border-border/50 bg-card/60 hover:bg-card hover:border-primary/20 transition-all duration-200"
            >
              <CardHeader className="border-b border-border/30 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold leading-snug tracking-tight">
                    {rfa.title}
                  </CardTitle>
                  <Badge
                    variant={statusVariant[rfa.status]}
                    className="shrink-0 text-[10px] leading-none"
                  >
                    {rfa.status}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 text-xs leading-relaxed">
                  {rfa.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-normal bg-secondary/50"
                    >
                      {rfa.category}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      by {rfa.submitter}
                    </span>
                  </div>
                  <UpvoteButton votes={rfa.votes} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
