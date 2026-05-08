"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { SeedRFA, Category, Status } from "@/data/rfa-seed";
import { RFA_SUBMIT_URL } from "@/data/rfa-seed";

// ─── Types ───────────────────────────────────────────────────────────────────

type SortMode = "votes" | "newest";

// GitHub issue RFA — raw from API + seed entries intermixed
export interface GitHubRFA {
  id: string;
  title: string;
  description: string;
  category: Category;
  submitter: string;
  votes: number;
  status: Status;
  createdAt: string;
  url: string;
  isSeed?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ALL_CATEGORIES = [
  "All",
  "DeFi",
  "Tooling",
  "Infrastructure",
  "Social",
] as const;
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

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
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

function EmptyState({ hasData }: { hasData: boolean }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        {hasData ? (
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
        ) : (
          <svg
            className="h-5 w-5 text-primary/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        )}
      </div>
      {hasData ? (
        <>
          <p className="text-sm font-medium text-muted-foreground">
            No RFAs match this filter
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Try selecting a different category or check back later.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground">
            Be the first to submit an RFA
          </p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground/80">
            The board is community-driven. Submit your idea for a project that
            grows the Fluent ecosystem and get feedback from builders.
          </p>
          <a
            href={RFA_SUBMIT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="default"
              size="sm"
              className="mt-4 gap-1.5"
            >
              <svg
                className="size-3.5"
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
              Submit an RFA on GitHub
            </Button>
          </a>
        </>
      )}
    </div>
  );
}

function UpvoteButton({
  votes,
  url,
}: {
  votes: number;
  url?: string;
}) {
  const hasUrl = !!url;

  if (hasUrl) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Button
          variant="ghost"
          size="xs"
          className="group/upvote h-auto gap-1 px-1.5 py-0.5 text-muted-foreground"
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
          <span className="font-mono text-xs tabular-nums">
            {formatVotes(votes)}
          </span>
        </Button>
      </a>
    );
  }

  return (
    <Button
      variant="ghost"
      size="xs"
      disabled
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
      <span className="font-mono text-xs tabular-nums">
        {formatVotes(votes)}
      </span>
    </Button>
  );
}

function RFACard({ rfa }: { rfa: GitHubRFA }) {
  return (
    <Card
      size="sm"
      className="group/card border-border/50 bg-card/60 hover:bg-card hover:border-primary/20 transition-all duration-200"
    >
      <CardHeader className="border-b border-border/30 pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold leading-snug tracking-tight">
            {rfa.url ? (
              <a
                href={rfa.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {rfa.title}
              </a>
            ) : (
              rfa.title
            )}
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
          <UpvoteButton votes={rfa.votes} url={rfa.url || undefined} />
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground/60">
          <span>{timeAgo(rfa.createdAt)}</span>
          {rfa.isSeed && (
            <span className="inline-flex items-center gap-1 rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-primary/70">
              seed
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Board ──────────────────────────────────────────────────────────────

interface RFABoardProps {
  initialRFAs: GitHubRFA[];
  fetchedFrom: "github" | "seed" | "none";
}

export default function RFABoard({ initialRFAs, fetchedFrom }: RFABoardProps) {
  const [activeCategory, setActiveCategory] =
    useState<FilterCategory>("All");
  const [sortMode, setSortMode] = useState<SortMode>("votes");

  const filtered = useMemo(() => {
    let list = [...initialRFAs];

    if (activeCategory !== "All") {
      list = list.filter((rfa) => rfa.category === activeCategory);
    }

    if (sortMode === "votes") {
      list.sort((a, b) => b.votes - a.votes);
    } else {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return list;
  }, [activeCategory, sortMode, initialRFAs]);

  const isEmpty = initialRFAs.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* ── Heading ── */}
      <div className="mb-8">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Request for Apps
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">RFA Board</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Ideas the Fluent team and community find compelling. Browse, upvote,
          and submit your own proposals for projects that grow the ecosystem.
        </p>
        {fetchedFrom === "seed" && !isEmpty && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground/70">
            <svg
              className="size-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Showing seed ideas —{" "}
            <a
              href={RFA_SUBMIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/80 hover:text-primary underline underline-offset-2"
            >
              submit yours on GitHub
            </a>
          </p>
        )}
      </div>

      {/* ── Filters & Sort ── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
      {isEmpty ? (
        <EmptyState hasData={false} />
      ) : filtered.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EmptyState hasData={true} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((rfa) => (
            <RFACard key={rfa.id} rfa={rfa} />
          ))}
        </div>
      )}

      {/* ── Submit CTA (always visible, even when empty state already shows it) ── */}
      <Separator className="my-10" />
      <div className="rounded-xl border border-border/50 bg-card/40 p-6 text-center">
        <h2 className="text-sm font-semibold tracking-tight">
          Have an idea for the Fluent ecosystem?
        </h2>
        <p className="mt-1.5 text-xs text-muted-foreground max-w-md mx-auto">
          Submit a Request for Apps on GitHub. The community reviews, discusses,
          and upvotes ideas that could become the next big Fluent dApp.
        </p>
        <a href={RFA_SUBMIT_URL} target="_blank" rel="noopener noreferrer">
          <Button variant="default" size="sm" className="mt-4 gap-1.5">
            <svg
              className="size-3.5"
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
            Submit an RFA on GitHub
          </Button>
        </a>
      </div>
    </div>
  );
}
