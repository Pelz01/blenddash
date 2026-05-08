'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { DollarSign, Users, Lock, Receipt } from 'lucide-react';

// ── Mock Data ───────────────────────────────────────────────────────────────────

const fluentOverview = {
  totalRevenue: 2_847_500,
  revenueDelta: 12.4,
  activeUsers: 84_700,
  usersDelta: 8.2,
  tvl: 156_200_000,
  tvlDelta: 15.3,
  fees: 142_300,
  feesDelta: 6.7,
};

const monthlyRevenue = [
  { label: 'Jun', value: 210_000 },
  { label: 'Jul', value: 225_000 },
  { label: 'Aug', value: 218_000 },
  { label: 'Sep', value: 242_000 },
  { label: 'Oct', value: 256_000 },
  { label: 'Nov', value: 248_000 },
  { label: 'Dec', value: 262_000 },
  { label: 'Jan', value: 275_000 },
  { label: 'Feb', value: 284_750 },
  { label: 'Mar', value: 290_000 },
  { label: 'Apr', value: 310_000 },
  { label: 'May', value: 325_000 },
];

type ProjectRow = {
  name: string;
  revenue30d: number;
  growth: number;
  marketShare: number;
};

const compareProjects: ProjectRow[] = [
  { name: 'Fluent', revenue30d: 2_847_500, growth: 12.4, marketShare: 28.5 },
  { name: 'Eclipse', revenue30d: 1_923_000, growth: -3.2, marketShare: 19.2 },
  { name: 'Monad', revenue30d: 2_189_000, growth: 5.1, marketShare: 21.9 },
  { name: 'Abstract', revenue30d: 1_560_800, growth: 8.7, marketShare: 15.6 },
  { name: 'MegaETH', revenue30d: 1_491_200, growth: -1.8, marketShare: 14.9 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────────

function fmtCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function fmtCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function Delta({ value, className }: { value: number; className?: string }) {
  const isPositive = value >= 0;
  return (
    <span
      className={cn(
        'font-mono tabular-nums text-xs',
        isPositive ? 'text-[#4ade80]' : 'text-destructive',
        className,
      )}
    >
      {isPositive ? '+' : ''}
      {value.toFixed(1)}%
    </span>
  );
}

// ── Sub-Components ───────────────────────────────────────────────────────────────

function MetricCard({
  title,
  value,
  delta,
  icon: Icon,
  fmt,
}: {
  title: string;
  value: number;
  delta: number;
  icon: React.ComponentType<{ className?: string }>;
  fmt: (v: number) => string;
}) {
  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="font-mono tabular-nums text-2xl font-semibold tracking-tight">
          {fmt(value)}
        </div>
        <Delta value={delta} className="mt-1 inline-block" />
      </CardContent>
    </Card>
  );
}

function OverviewTab() {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        Fluent Ecosystem
      </p>
      <h2 className="text-2xl font-semibold tracking-tight mb-6">
        Key Metrics · Last 30 Days
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={fluentOverview.totalRevenue}
          delta={fluentOverview.revenueDelta}
          icon={DollarSign}
          fmt={fmtCurrency}
        />
        <MetricCard
          title="Active Users"
          value={fluentOverview.activeUsers}
          delta={fluentOverview.usersDelta}
          icon={Users}
          fmt={fmtCompact}
        />
        <MetricCard
          title="TVL"
          value={fluentOverview.tvl}
          delta={fluentOverview.tvlDelta}
          icon={Lock}
          fmt={fmtCurrency}
        />
        <MetricCard
          title="Fees (30d)"
          value={fluentOverview.fees}
          delta={fluentOverview.feesDelta}
          icon={Receipt}
          fmt={fmtCurrency}
        />
      </div>
    </div>
  );
}

function MonthlyTab() {
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.value));

  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        Fluent Revenue Trend
      </p>
      <h2 className="text-2xl font-semibold tracking-tight mb-6">
        12-Month Revenue
      </h2>

      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-end gap-1.5 sm:gap-2 h-64">
            {monthlyRevenue.map((month) => {
              const heightPercent = (month.value / maxRevenue) * 100;
              const isLastMonth = month.label === 'May';

              return (
                <div
                  key={month.label}
                  className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0"
                >
                  <span className="font-mono tabular-nums text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                    {fmtCurrency(month.value).replace('.00', '')}
                  </span>
                  <div
                    className={cn(
                      'w-full max-w-[40px] rounded-t transition-all duration-300',
                      isLastMonth
                        ? 'bg-primary'
                        : 'bg-primary/50 hover:bg-primary/70',
                    )}
                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                  />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    {month.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CompareTab() {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        Ecosystem Comparison
      </p>
      <h2 className="text-2xl font-semibold tracking-tight mb-6">
        Revenue Leaderboard · 30 Days
      </h2>

      <Card className="border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead className="font-mono tabular-nums text-right">
                Revenue (30d)
              </TableHead>
              <TableHead className="font-mono tabular-nums text-right">
                Growth
              </TableHead>
              <TableHead className="font-mono tabular-nums text-right">
                Market Share
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {compareProjects.map((project) => (
              <TableRow
                key={project.name}
                className={
                  project.name === 'Fluent'
                    ? 'bg-primary/5 hover:bg-primary/10'
                    : undefined
                }
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {project.name}
                    {project.name === 'Fluent' && (
                      <Badge
                        variant="default"
                        className="text-[10px] h-4 px-1.5"
                      >
                        You
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono tabular-nums text-right">
                  {fmtCurrency(project.revenue30d)}
                </TableCell>
                <TableCell className="text-right">
                  <Delta value={project.growth} />
                </TableCell>
                <TableCell className="font-mono tabular-nums text-right text-muted-foreground">
                  {project.marketShare.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────────

export default function RevenuePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Revenue Analytics
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Revenue Comparison
        </h1>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="monthly">
          <MonthlyTab />
        </TabsContent>

        <TabsContent value="compare">
          <CompareTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
