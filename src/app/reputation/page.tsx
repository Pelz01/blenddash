"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

// ─── Signal data ────────────────────────────────────────────────────────────

type SignalStatus = "Live" | "In Development" | "Planned";

interface Signal {
  name: string;
  status: SignalStatus;
  description: string;
  source: string;
}

interface SignalCategory {
  category: string;
  signals: Signal[];
}

const signalCategories: SignalCategory[] = [
  {
    category: "Identity",
    signals: [
      {
        name: "FluentID Verification",
        status: "Live",
        description: "On-chain identity verification via FluentID attestations. Confirms unique human status without exposing PII.",
        source: "FluentID Registry",
      },
      {
        name: "ENS Integration",
        status: "Live",
        description: "Reputation tied to ENS primary names and avatar records. Boosts trust for named participants.",
        source: "ENS Protocol",
      },
      {
        name: "Gitcoin Passport Score",
        status: "In Development",
        description: "Aggregated sybil-resistance score from Gitcoin Passport stamps. Threshold-gated access tiers.",
        source: "Gitcoin",
      },
    ],
  },
  {
    category: "Activity",
    signals: [
      {
        name: "Transaction Volume (30d)",
        status: "Live",
        description: "Rolling 30-day on-chain transaction volume across Fluent ecosystem contracts. Weighted by USD value.",
        source: "Fluent Indexer",
      },
      {
        name: "Protocol Interaction Depth",
        status: "Live",
        description: "Number of unique protocols the address has interacted with. Broader footprint signals ecosystem engagement.",
        source: "BlendDash Analytics",
      },
      {
        name: "Contract Deployments",
        status: "In Development",
        description: "Verified smart contract deployments. Rewards builders who ship public goods on Fluent.",
        source: "FluentScan",
      },
      {
        name: "Liquidity Provision Score",
        status: "Planned",
        description: "Time-weighted average liquidity provided across Fluent AMM pools. Incentivizes deep, sticky liquidity.",
        source: "FluentSwap",
      },
    ],
  },
  {
    category: "Social",
    signals: [
      {
        name: "Governance Participation",
        status: "Live",
        description: "Snapshot vote count and proposal authorship across Fluent DAOs. Measures governance citizenship.",
        source: "Snapshot + Tally",
      },
      {
        name: "Community Endorsements",
        status: "In Development",
        description: "Peer-to-peer attestations from community members. Social graph trust weighted by endorser reputation.",
        source: "EAS / Fluent Attestation Service",
      },
      {
        name: "Discourse Activity",
        status: "Planned",
        description: "Forum post count, topic creation, and solution marks on Fluent governance forums.",
        source: "Discourse API",
      },
    ],
  },
  {
    category: "Governance",
    signals: [
      {
        name: "Delegation Weight",
        status: "Live",
        description: "Total voting power delegated to the address across Fluent governance contracts. Signal of community trust.",
        source: "Fluent Governor",
      },
      {
        name: "Proposal Success Rate",
        status: "Live",
        description: "Ratio of passed to total authored governance proposals. Quality filter for proposal authors.",
        source: "Tally",
      },
      {
        name: "Treasury Stewardship",
        status: "Planned",
        description: "Multi-sig signer status and treasury management history across Fluent ecosystem DAOs.",
        source: "Safe / Fluent DAOs",
      },
    ],
  },
];

// ─── Leaderboard data ───────────────────────────────────────────────────────

interface LeaderboardEntry {
  id: number;
  project: string;
  repScore: number;
  category: string;
  change7d: number; // positive = gain, negative = loss
}

const leaderboardData: LeaderboardEntry[] = [
  { id: 1, project: "FluentSwap", repScore: 9842, category: "DeFi", change7d: 142 },
  { id: 2, project: "LiquidityLens", repScore: 9215, category: "Analytics", change7d: 88 },
  { id: 3, project: "MintMatrix", repScore: 8976, category: "NFT", change7d: -34 },
  { id: 4, project: "BridgeBeam", repScore: 8430, category: "Bridge", change7d: 215 },
  { id: 5, project: "YieldYarn", repScore: 8102, category: "DeFi", change7d: 67 },
  { id: 6, project: "FluentPad", repScore: 7895, category: "Launchpad", change7d: -120 },
  { id: 7, project: "OracleOasis", repScore: 7611, category: "Oracle", change7d: 53 },
  { id: 8, project: "VaultVista", repScore: 7340, category: "DeFi", change7d: -89 },
  { id: 9, project: "FluentDAO", repScore: 7104, category: "Governance", change7d: 176 },
  { id: 10, project: "SwapSphere", repScore: 6892, category: "DeFi", change7d: 41 },
  { id: 11, project: "LedgerLoom", repScore: 6601, category: "Infra", change7d: -55 },
  { id: 12, project: "FluentLend", repScore: 6378, category: "Lending", change7d: 98 },
  { id: 13, project: "TokenTide", repScore: 6120, category: "DeFi", change7d: -203 },
  { id: 14, project: "CipherChain", repScore: 5894, category: "Privacy", change7d: 310 },
  { id: 15, project: "NexusNode", repScore: 5602, category: "Infra", change7d: 25 },
  { id: 16, project: "FluentVault", repScore: 5380, category: "DeFi", change7d: -77 },
  { id: 17, project: "ProofPulse", repScore: 5115, category: "Identity", change7d: 133 },
  { id: 18, project: "BlazeBlocks", repScore: 4870, category: "Infra", change7d: -41 },
  { id: 19, project: "FluentX", repScore: 4603, category: "Exchange", change7d: 290 },
  { id: 20, project: "AuraAgents", repScore: 4320, category: "AI", change7d: 55 },
];

type SortKey = keyof LeaderboardEntry;
type SortDir = "asc" | "desc";

// ─── Signal status helpers ──────────────────────────────────────────────────

const statusStyles: Record<SignalStatus, { variant: "default" | "secondary" | "outline"; className: string }> = {
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

// ─── Page component ─────────────────────────────────────────────────────────

export default function ReputationPage() {
  const [activeTab, setActiveTab] = useState("map");

  // Leaderboard state
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filteredSorted = useMemo(() => {
    const term = search.toLowerCase();
    const filtered = leaderboardData.filter(
      (entry) =>
        entry.project.toLowerCase().includes(term) ||
        entry.category.toLowerCase().includes(term)
    );

    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return sorted;
  }, [search, sortKey, sortDir]);

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

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as string)}>
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
                          <span className="text-[11px] text-muted-foreground/70">
                            Source: {signal.source}
                          </span>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </TabsContent>

        {/* ── Leaderboard ─────────────────────────────────────────────── */}
        <TabsContent value="leaderboard" className="mt-6">
          <div className="mb-4">
            <Input
              placeholder="Search projects or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

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
                {filteredSorted.map((entry, idx) => (
                  <TableRow
                    key={entry.id}
                    className={`${rankHighlight(idx + 1)} transition-colors`}
                  >
                    <TableCell className="font-mono tabular-nums text-xs text-muted-foreground">
                      {rankMedal(idx + 1)} {String(idx + 1).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {entry.project}
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
                ))}
                {filteredSorted.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No results match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
