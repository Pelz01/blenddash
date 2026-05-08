import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────
interface ChainData {
  name: string;
  tvl: number;
  chainId: number | null;
  gecko_id: string | null;
  symbol: string;
}

interface ChainEntry {
  name: string;
  tvl: number;
  symbol: string;
  listed: boolean;
  gecko_id?: string | null;
}

// ── Data fetch (build time) ────────────────────────────────
async function fetchChains(): Promise<{ entries: ChainEntry[]; fetchedAt: string }> {
  const res = await fetch("https://api.llama.fi/v2/chains", {
    next: { revalidate: 900 }, // 15 min cache
  });

  if (!res.ok) throw new Error(`DefiLlama API error: ${res.status}`);

  const chains: ChainData[] = await res.json();

  const targets = [
    { name: "Fluent", lookup: "fluent" },
    { name: "Monad", lookup: "monad" },
    { name: "Eclipse", lookup: "eclipse" },
    { name: "MegaETH", lookup: "megaeth" },
    { name: "Abstract", lookup: "abstract" },
  ];

  const entries: ChainEntry[] = targets.map((t) => {
    const found = chains.find(
      (c) => c.name.toLowerCase() === t.lookup.toLowerCase()
    );
    return {
      name: t.name,
      tvl: found?.tvl ?? 0,
      symbol: found?.symbol ?? t.name.substring(0, 4).toUpperCase(),
      listed: !!found,
      gecko_id: found?.gecko_id ?? null,
    };
  });

  return { entries, fetchedAt: new Date().toISOString() };
}

// ── Formatting helpers ─────────────────────────────────────
function fmtCurrency(n: number): string {
  if (n === 0 && !Number.isFinite(n)) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

function fmtCompact(n: number): string {
  if (n === 0 && !Number.isFinite(n)) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
}

// ── MetricCard ─────────────────────────────────────────────
function MetricCard({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
}) {
  return (
    <Card className="border-border/50 bg-card/60">
      <CardHeader className="pb-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold font-mono tabular-nums tracking-tight">
          {value}
        </p>
        {delta && (
          <p
            className={`mt-1 text-xs font-mono tabular-nums ${
              positive
                ? "text-[#4ade80]"
                : "text-destructive"
            }`}
          >
            {positive ? "+" : ""}
            {delta}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Page ───────────────────────────────────────────────────
export default async function RevenuePage() {
  let data: { entries: ChainEntry[]; fetchedAt: string };
  let error: string | null = null;

  try {
    data = await fetchChains();
  } catch (e: any) {
    error = e.message;
    data = {
      entries: [],
      fetchedAt: new Date().toISOString(),
    };
  }

  const fluent = data.entries.find((e) => e.name === "Fluent");
  const compare = data.entries.filter((e) => e.name !== "Fluent");
  const sorted = [...data.entries].sort((a, b) => b.tvl - a.tvl);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Revenue Comparison
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Fluent vs Comparable Chains
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live TVL data from DefiLlama
          {" · "}
          <span className="font-mono text-[11px]">
            updated {new Date(data.fetchedAt).toLocaleString()}
          </span>
        </p>
      </div>

      {/* Fluent not listed banner */}
      {fluent && !fluent.listed && (
        <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Badge
              variant="outline"
              className="border-amber-500/50 text-amber-400 shrink-0"
            >
              Action Needed
            </Badge>
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">Fluent is not yet listed on DefiLlama.</strong>{" "}
              TVL/fee data is unavailable. The community can{" "}
              <a
                href="https://github.com/DefiLlama/defillama-server#submit-a-protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                submit a PR to add it ↗
              </a>
              {" "}or{" "}
              <a
                href="https://docs.llama.fi/list-your-project/submit-a-chain"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                request chain listing ↗
              </a>
              .
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Card className="mb-6 border-destructive/30 bg-destructive/5">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">
              Failed to fetch data from DefiLlama: {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {sorted.map((chain) => (
              <MetricCard
                key={chain.name}
                label={`${chain.name} TVL`}
                value={chain.listed ? fmtCurrency(chain.tvl) : "—"}
                delta={chain.name === "Fluent" ? undefined : undefined}
              />
            ))}
          </div>

          <Card className="border-border/50 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight">
                TVL Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sorted
                  .filter((c) => c.listed)
                  .map((chain) => {
                    const maxTvl = sorted[0]?.tvl || 1;
                    const pct = (chain.tvl / maxTvl) * 100;
                    return (
                      <div key={chain.name} className="flex items-center gap-3">
                        <span className="w-20 text-sm font-mono text-muted-foreground shrink-0">
                          {chain.name}
                        </span>
                        <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden">
                          <div
                            className="h-full bg-primary/60 rounded-sm transition-all duration-500"
                            style={{ width: `${Math.max(pct, 2)}%` }}
                          />
                        </div>
                        <span className="w-24 text-sm font-mono tabular-nums text-right shrink-0">
                          {fmtCurrency(chain.tvl)}
                        </span>
                      </div>
                    );
                  })}
                {!sorted.some((c) => c.listed) && (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No TVL data available. Fluent and comparable chains are not
                    yet listed on DefiLlama.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compare tab */}
        <TabsContent value="compare">
          <Card className="border-border/50 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight">
                Chain Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead className="text-xs">Chain</TableHead>
                    <TableHead className="text-xs text-right">TVL</TableHead>
                    <TableHead className="text-xs text-right">
                      Listed on DefiLlama
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      Data Available
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((chain, i) => (
                    <TableRow
                      key={chain.name}
                      className={
                        chain.name === "Fluent"
                          ? "bg-primary/[0.03] border-border/40"
                          : "border-border/40"
                      }
                    >
                      <TableCell className="text-sm">
                        <span className="font-medium">{chain.name}</span>
                        {chain.name === "Fluent" && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-[10px] border-primary/40 text-primary"
                          >
                            you
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-mono tabular-nums text-right">
                        {chain.listed ? fmtCurrency(chain.tvl) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {chain.listed ? (
                          <Badge
                            variant="default"
                            className="text-[10px] bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/30"
                          >
                            Listed
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-[10px]"
                          >
                            Not Listed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {chain.listed ? (
                          <span className="text-xs text-muted-foreground">
                            TVL only
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            None
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About tab */}
        <TabsContent value="about">
          <Card className="border-border/50 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight">
                About This Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Data is sourced from the{" "}
                <a
                  href="https://defillama.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  DefiLlama API ↗
                </a>
                , the most widely-used DeFi TVL aggregator. Data refreshes every
                15 minutes.
              </p>
              <p>
                <strong className="text-foreground">Current limitation:</strong>{" "}
                Fluent is not yet listed on DefiLlama. Once Fluent is added,
                revenue/fee metrics, historical charts, and protocol-level
                breakdowns will become available.
              </p>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  To add Fluent or a Fluent protocol to DefiLlama:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-muted-foreground">
                  <li>
                    <a
                      href="https://docs.llama.fi/list-your-project/submit-a-chain"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Submit a chain listing ↗
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/DefiLlama/defillama-server#submit-a-protocol"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Submit a protocol adapter PR ↗
                    </a>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
