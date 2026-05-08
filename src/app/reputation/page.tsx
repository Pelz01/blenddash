"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import reputationData from "@/data/reputation.json";

// ─── Types ───────────────────────────────────────────────────────────────────

type SignalStatus = "Live" | "In Development" | "Planned";

interface Signal {
  name: string;
  status: SignalStatus;
  description: string;
  source: string;
  sourceUrl?: string;
}

interface SignalCategory {
  category: string;
  signals: Signal[];
}

interface LeaderboardEntry {
  id: string;
  project: string;
  repScore: number;
  category: string;
  change7d: number;
  description?: string;
  url?: string;
  verified?: boolean;
}

// ─── Signal data (curated from Fluent docs & on-chain activity) ───────────────

const signalCategories: SignalCategory[] = [
  {
    category: "Identity",
    signals: [
      {
        name: "Fluent Prints Score",
        status: "Live",
        description:
          "On-chain reputation primitives (Prints) that build portable trust scores. Create and collect Prints to establish your Fluent identity without exposing PII.",
        source: "Fluent Prints",
        sourceUrl: "https://portal.fluent.xyz/user",
      },
      {
        name: "ENS / FNS Integration",
        status: "In Development",
        description:
          "Reputation tied to ENS primary names and Fluent native name service records. Boosts trust for named participants in governance and DeFi.",
        source: "ENS Protocol",
        sourceUrl: "https://ens.domains",
      },
      {
        name: "Gitcoin Passport Score",
        status: "In Development",
        description:
          "Aggregated sybil-resistance score from Gitcoin Passport stamps. Threshold-gated access tiers for airdrops and community membership.",
        source: "Gitcoin Passport",
        sourceUrl: "https://passport.gitcoin.co",
      },
    ],
  },
  {
    category: "Activity",
    signals: [
      {
        name: "Transaction Volume (30d)",
        status: "Live",
        description:
          "Rolling 30-day on-chain transaction volume across Fluent ecosystem contracts. Weighted by USD value and gas consumption.",
        source: "FluentScan API",
        sourceUrl: "https://fluentscan.xyz",
      },
      {
        name: "Protocol Interaction Depth",
        status: "Live",
        description:
          "Number of unique protocols the address has interacted with on Fluent. Broader footprint signals ecosystem engagement and organic usage.",
        source: "BlendDash Analytics",
        sourceUrl: "https://github.com/Pelz01/blenddash",
      },
      {
        name: "Contract Deployments",
        status: "In Development",
        description:
          "Verified smart contract deployments on Fluent. Rewards builders who ship public goods and developer tooling.",
        source: "FluentScan Verified Contracts",
        sourceUrl: "https://fluentscan.xyz",
      },
      {
        name: "Liquidity Provision Score",
        status: "Planned",
        description:
          "Time-weighted average liquidity provided across Fluent AMM pools. Incentivizes deep, sticky liquidity as the ecosystem matures.",
        source: "Fluent DeFi (Roadmap)",
      },
    ],
  },
  {
    category: "Social",
    signals: [
      {
        name: "Governance Participation",
        status: "In Development",
        description:
          "Snapshot vote count and proposal authorship across Fluent DAOs. Measures governance citizenship and community stewardship.",
        source: "Snapshot + Tally",
        sourceUrl: "https://snapshot.org",
      },
      {
        name: "Community Endorsements",
        status: "Planned",
        description:
          "Peer-to-peer attestations via EAS on Fluent. Social graph trust weighted by endorser reputation score.",
        source: "EAS / Fluent Attestation Service",
        sourceUrl: "https://attest.org",
      },
      {
        name: "Discord & Forum Activity",
        status: "In Development",
        description:
          "Meaningful contributions across Fluent Discord and governance forums. Topic creation, solution marks, and community help.",
        source: "Fluent Discord",
        sourceUrl: "https://discord.com/invite/fluentxyz",
      },
    ],
  },
  {
    category: "Governance",
    signals: [
      {
        name: "Delegation Weight",
        status: "In Development",
        description:
          "Total voting power delegated to the address across Fluent governance contracts. Signal of community trust and mandate.",
        source: "Fluent Governance",
        sourceUrl: "https://docs.fluent.xyz",
      },
      {
        name: "Proposal Success Rate",
        status: "Planned",
        description:
          "Ratio of passed to total authored governance proposals. Quality filter for proposal authors and protocol stewards.",
        source: "Tally / Fluent Governor",
        sourceUrl: "https://tally.xyz",
      },
      {
        name: "Treasury Stewardship",
        status: "Planned",
        description:
          "Multi-sig signer status and treasury management history across Fluent ecosystem DAOs and protocol treasuries.",
        source: "Safe / Fluent DAOs",
        sourceUrl: "https://safe.global",
      },
    ],
  },
];

// ─── Signal status helpers ──────────────────────────────────────────────────

const statusStyles: Record<
  SignalStatus,
  { variant: "default" | "secondary" | "outline"; className: string }
> = {
  Live: {
    variant: "default",
    className: "bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/30",
  },
  "In Development": {
    variant: "secondary",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  Planned: {
    variant: "outline",
    className: "border-muted-foreground/30 text-muted-foreground",
  },
};

// ─── Rank podium styles ─────────────────────────────────────────────────────

function rankHighlight(rank: number): string {
  if (rank === 1) return "bg-[#FFD700]/8 border-l-2 border-l-[#FFD700]/60";
  if (rank === 2) return "bg-[#C0C0C0]/6 border-l-2 border-l-[#C0C0C0]/50";
  if (rank === 3) return "bg-[#CD7F32]/6 border-l-2 border-l-[#CD7F32]/40";
  return "";
}

function rankMedal(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "";
}

// ─── Leaderboard sub-components ─────────────────────────────────────────────

type SortKey = keyof LeaderboardEntry;
type SortDir = "asc" | "desc";

function LeaderboardEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <svg
          className="h-6 w-6 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
          />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-foreground/80">
        Leaderboard data is community-maintained
      </h3>
      <p className="mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
        The reputation leaderboard is driven by{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
          src/data/reputation.json
        </code>
        . No entries exist yet or none match your search. Help grow the
        ecosystem — submit a PR to add your project!
      </p>
      <a
        href="https://github.com/Pelz01/blenddash/edit/main/src/data/reputation.json"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "mt-5 gap-2 text-xs",
        )}
      >
        <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Submit a PR to Add Your Project
      </a>
    </div>
  );
}

// ─── Page component ─────────────────────────────────────────────────────────

export default function ReputationPage() {
  const [activeTab, setActiveTab] = useState("map");

  // Leaderboard state
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("repScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Read entries from JSON data file
  const entries: LeaderboardEntry[] = useMemo(
    () => (reputationData?.entries ?? []) as LeaderboardEntry[],
    [],
  );

  const filteredSorted = useMemo(() => {
    const term = search.toLowerCase();
    const filtered = entries.filter(
      (entry) =>
        entry.project.toLowerCase().includes(term) ||
        entry.category.toLowerCase().includes(term) ||
        (entry.description ?? "").toLowerCase().includes(term),
    );

    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal ?? "").localeCompare(String(bVal ?? ""))
        : String(bVal ?? "").localeCompare(String(aVal ?? ""));
    });
    return sorted;
  }, [entries, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "project" || key === "category" ? "asc" : "desc");
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-[-0.02em]">Reputation</h1>
        <p className="text-muted-foreground max-w-2xl">
          Explore the reputation signals that power trust in the Fluent
          ecosystem. Browse the signal map or check the leaderboard to see how
          projects and entities rank.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as string)}
      >
        <TabsList>
          <TabsTrigger value="map">Reputation Map</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* ── Reputation Map ──────────────────────────────────────────── */}
        <TabsContent value="map" className="mt-6">
          <div className="space-y-10">
            {signalCategories.map((cat) => (
              <section key={cat.category}>
                <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground/90">
                  {cat.category}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cat.signals.map((signal) => {
                    const st = statusStyles[signal.status];
                    return (
                      <Card
                        key={signal.name}
                        size="sm"
                        className="border-border/50 bg-card/60 hover:bg-card hover:border-primary/15 transition-colors duration-200"
                      >
                        <CardHeader className="border-b border-border/30 pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-sm font-semibold leading-snug">
                              {signal.name}
                            </CardTitle>
                            <Badge
                              variant={st.variant}
                              className={`shrink-0 text-[10px] ${st.className}`}
                            >
                              {signal.status}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs leading-relaxed pt-1">
                            {signal.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                          {signal.sourceUrl ? (
                            <a
                              href={signal.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-primary/70 hover:text-primary transition-colors underline underline-offset-2"
                            >
                              Source: {signal.source} ↗
                            </a>
                          ) : (
                            <span className="text-[11px] text-muted-foreground/70">
                              Source: {signal.source}
                            </span>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Data source note */}
          <div className="mt-10 rounded-lg border border-border/30 bg-muted/30 px-4 py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground/70">Data sources:</strong>{" "}
              Signal descriptions and statuses are curated from{" "}
              <a
                href="https://docs.fluent.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/70 hover:text-primary underline underline-offset-2"
              >
                Fluent documentation
              </a>
              ,{" "}
              <a
                href="https://github.com/fluentlabs-xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/70 hover:text-primary underline underline-offset-2"
              >
                Fluent Labs GitHub
              </a>
              ,{" "}
              <a
                href="https://fluent.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/70 hover:text-primary underline underline-offset-2"
              >
                fluent.xyz
              </a>
              , and on-chain activity. Status reflects current development
              phase: <span className="text-[#4ade80]">Live</span> = deployed on
              mainnet/testnet,{" "}
              <span className="text-amber-400">In Development</span> = mentioned
              in docs/roadmap with active work,{" "}
              <span className="text-muted-foreground">Planned</span> = roadmap
              item. Last reviewed: May 2026.
            </p>
          </div>
        </TabsContent>

        {/* ── Leaderboard ─────────────────────────────────────────────── */}
        <TabsContent value="leaderboard" className="mt-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search projects, categories, or descriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <p className="text-[11px] text-muted-foreground shrink-0">
              Data from{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                src/data/reputation.json
              </code>{" "}
              ·{" "}
              <a
                href="https://github.com/Pelz01/blenddash/edit/main/src/data/reputation.json"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/70 hover:text-primary underline underline-offset-2"
              >
                Submit a PR ↗
              </a>
            </p>
          </div>

          {entries.length === 0 ? (
            <LeaderboardEmptyState />
          ) : (
            <Card className="border-border/50 bg-card/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="w-16 cursor-pointer select-none hover:text-primary transition-colors"
                      onClick={() => handleSort("id")}
                    >
                      Rank{sortIndicator("id")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:text-primary transition-colors"
                      onClick={() => handleSort("project")}
                    >
                      Project / Entity{sortIndicator("project")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:text-primary transition-colors text-right"
                      onClick={() => handleSort("repScore")}
                    >
                      Rep Score{sortIndicator("repScore")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:text-primary transition-colors"
                      onClick={() => handleSort("category")}
                    >
                      Category{sortIndicator("category")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:text-primary transition-colors text-right"
                      onClick={() => handleSort("change7d")}
                    >
                      Change (7d){sortIndicator("change7d")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSorted.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-16"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <p className="text-sm text-muted-foreground">
                            No results match your search.
                          </p>
                          <a
                            href="https://github.com/Pelz01/blenddash/edit/main/src/data/reputation.json"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              buttonVariants({ variant: "outline", size: "sm" }),
                              "gap-2 text-xs",
                            )}
                          >
                            <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Add Your Project via PR
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSorted.map((entry, idx) => (
                      <TableRow
                        key={entry.id}
                        className={`${rankHighlight(idx + 1)} transition-colors`}
                      >
                        <TableCell className="font-mono tabular-nums text-xs text-muted-foreground">
                          {rankMedal(idx + 1)}{" "}
                          {String(idx + 1).padStart(2, "0")}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {entry.url ? (
                              <a
                                href={entry.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors"
                              >
                                {entry.project}
                              </a>
                            ) : (
                              entry.project
                            )}
                            {entry.verified && (
                              <Badge
                                variant="outline"
                                className="text-[9px] h-4 px-1 border-[#4ade80]/30 text-[#4ade80]/80"
                              >
                                ✓ verified
                              </Badge>
                            )}
                          </div>
                          {entry.description && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 max-w-xs">
                              {entry.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="font-mono tabular-nums text-right">
                          {entry.repScore.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px] border-border/40 text-muted-foreground"
                          >
                            {entry.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono tabular-nums text-right">
                          <span
                            className={
                              entry.change7d >= 0
                                ? "text-[#4ade80]"
                                : "text-destructive"
                            }
                          >
                            {entry.change7d >= 0 ? "+" : ""}
                            {entry.change7d.toLocaleString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Bottom CTA for community contributions */}
          <div className="mt-6 rounded-lg border border-border/30 bg-muted/30 px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">
              The leaderboard is community-maintained.{" "}
              <a
                href="https://github.com/Pelz01/blenddash/blob/main/src/data/reputation.json"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/70 hover:text-primary underline underline-offset-2 font-medium"
              >
                View the data file
              </a>{" "}
              and{" "}
              <a
                href="https://github.com/Pelz01/blenddash/edit/main/src/data/reputation.json"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/70 hover:text-primary underline underline-offset-2 font-medium"
              >
                submit a PR
              </a>{" "}
              to add or update projects. Reputation scores are
              community-estimated and not official Fluent Labs rankings. For
              on-chain reputation, use{" "}
              <a
                href="https://portal.fluent.xyz/user"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/70 hover:text-primary underline underline-offset-2 font-medium"
              >
                Fluent Prints
              </a>
              .
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
