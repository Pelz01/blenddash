import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tools = [
  {
    title: "Revenue Compare",
    description: "Side-by-side dashboards comparing Fluent revenue streams with other projects.",
    href: "/revenue",
    badge: "Live Data",
    badgeVariant: "default" as const,
  },
  {
    title: "RFA Board",
    description: "Browse and upvote Request for Apps ideas from the Fluent team and community.",
    href: "/rfa",
    badge: "Community",
    badgeVariant: "secondary" as const,
  },
  {
    title: "Reputation",
    description: "Visual map of reputation signals and leaderboards across different contexts.",
    href: "/reputation",
    badge: "On-chain",
    badgeVariant: "outline" as const,
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24">
      {/* Hero */}
      <div className="mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Fluent Ecosystem Tools
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-[-0.03em] leading-tight">
          Community tools for
          <br />
          <span className="text-primary">the Fluent ecosystem</span>
        </h1>
        <p className="max-w-xl text-base text-muted-foreground leading-relaxed">
          Dashboards, idea boards, reputation signals, and leaderboards — everything
          the Fluent community needs to build, discover, and track what matters.
        </p>
      </div>

      {/* Tool Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <Card className="h-full border-border/50 bg-card/60 hover:bg-card hover:border-primary/20 transition-all duration-200 group cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                    {tool.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant={tool.badgeVariant} className="text-[10px]">
                  {tool.badge}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
