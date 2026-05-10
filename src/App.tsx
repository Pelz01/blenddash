import { useState, useEffect, useMemo } from "react";
import { ChevronRight, ChevronDown, BarChart3, Network, Trophy, MessageSquarePlus, Zap, CheckCircle2, ShieldCheck, Flame, Plus, Search, Filter } from "lucide-react";
import { motion } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import fluentHeroImage from "./assets/fluent-hero.png";
import revenueIcon from "./assets/product-icons/revenue.png";
import requestsIcon from "./assets/product-icons/requests.png";
import signalsIcon from "./assets/product-icons/signals.png";
import leaderboardsIcon from "./assets/product-icons/leaderboards.png";

type LogoItem = {
  src: string;
  alt: string;
  gradient: {
    from: string;
    to: string;
  };
};

const logos: LogoItem[] = [
  {
    src: "https://blendiction.xyz/logos/x-fluentxyz.png",
    alt: "Fluent Connect",
    gradient: { from: "#b567c2", to: "#f28482" },
  },
  {
    src: "https://blendiction.xyz/logos/x-venafinance.png",
    alt: "Vena Finance",
    gradient: { from: "#0f172a", to: "#64748b" },
  },
  {
    src: "https://blendiction.xyz/logos/x-fluxflowfi.png",
    alt: "Flux",
    gradient: { from: "#1d4ed8", to: "#60a5fa" },
  },
  {
    src: "https://blendiction.xyz/logos/x-blend_money.png",
    alt: "Blend",
    gradient: { from: "#22c55e", to: "#dcfce7" },
  },
  {
    src: "https://blendiction.xyz/logos/x-sproutfi_xyz.png",
    alt: "Sprout",
    gradient: { from: "#10b981", to: "#a7f3d0" },
  },
  {
    src: "https://blendiction.xyz/logos/x-YumiFinance.png",
    alt: "Yumi Finance",
    gradient: { from: "#0a0a0a", to: "#bef264" },
  },
  {
    src: "https://blendiction.xyz/logos/x-Neronaxyz.png",
    alt: "Nerona",
    gradient: { from: "#6d28d9", to: "#c4b5fd" },
  },
  {
    src: "https://blendiction.xyz/logos/x-PumpPals.png",
    alt: "Pump Pals",
    gradient: { from: "#ec4899", to: "#f9a8d4" },
  },
  {
    src: "https://blendiction.xyz/logos/x-sunrisedefi.png",
    alt: "Sunrise",
    gradient: { from: "#fb7185", to: "#fed7aa" },
  },
  {
    src: "https://blendiction.xyz/logos/pulsepredictor.svg",
    alt: "Pulse Predictor",
    gradient: { from: "#38bdf8", to: "#22c55e" },
  },
];

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COMING_SOON = "Coming soon";
const FLUENTSCAN = "/api/fluentscan";
const FLUENTSCAN_LINES = "/api/fluentscan-lines";
const LLAMA = "/api/llama";
const LLAMA_COINS = "/api/llama-coins";
const FEE_MANAGER_ADDRESS = "0x0000000000000000000000000000000000520feE";
const USDNR_TOKEN_ADDRESS = "0xD48e565561416dE59DA1050ED70b8d75e8eF28f9";

const peerConfigs = [
  { project: "Base", category: "L2 peer", slug: "base", chainName: "Base" },
  { project: "Arbitrum", category: "L2 peer", slug: "arbitrum", chainName: "Arbitrum" },
  { project: "Solana", category: "SVM peer", slug: "solana", chainName: "Solana" },
];

function formatNumber(value: any) {
  const number = Number(value);
  if (!Number.isFinite(number)) return COMING_SOON;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(number);
}

function formatUsd(value: any) {
  const number = Number(value);
  if (!Number.isFinite(number)) return COMING_SOON;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: number >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: number >= 1_000_000 ? 2 : 0,
  }).format(number);
}

function formatUsdValue(value: any) {
  const number = Number(value);
  if (!Number.isFinite(number)) return COMING_SOON;
  if (number > 0 && number < 0.01) return `$${number.toLocaleString("en-US", { maximumFractionDigits: 4 })}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: number >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: number >= 1_000_000 ? 2 : 2,
  }).format(number);
}

function formatNativeFromWei(value: any, symbol = "ETH") {
  const number = Number(value);
  if (!Number.isFinite(number)) return COMING_SOON;
  const eth = number / 1e18;
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: eth >= 1 ? 4 : 6,
  }).format(eth)} ${symbol}`;
}

function formatNativeAmount(value: any, symbol = "ETH") {
  const number = Number(value);
  if (!Number.isFinite(number)) return COMING_SOON;
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: number >= 1 ? 4 : 6,
  }).format(number)} ${symbol}`;
}

function formatEthWithUsd(value: any, ethPrice: any) {
  const eth = Number(value);
  if (!Number.isFinite(eth)) return COMING_SOON;
  const ethText = formatNativeAmount(eth);
  const price = Number(ethPrice);
  if (!Number.isFinite(price)) return ethText;
  return `${ethText} (${formatUsdValue(eth * price)})`;
}

function formatWeiWithUsd(value: any, ethPrice: any) {
  const wei = Number(value);
  if (!Number.isFinite(wei)) return COMING_SOON;
  return formatEthWithUsd(wei / 1e18, ethPrice);
}

function getUtcDateString(daysAgo = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function formatTokenAmount(value: any, decimals: any, symbol: string) {
  const amount = Number(value);
  const places = Number(decimals);
  if (!Number.isFinite(amount) || !Number.isFinite(places)) return COMING_SOON;
  return `${new Intl.NumberFormat("en-US", {
    notation: amount / 10 ** places >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: 2,
  }).format(amount / 10 ** places)} ${symbol}`;
}

function formatGasPrice(value: any) {
  const number = Number(value);
  if (!Number.isFinite(number)) return COMING_SOON;
  return `${number.toLocaleString("en-US", { maximumFractionDigits: 4 })} Gwei`;
}

async function getJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

function useLiveFluentData() {
  const [state, setState] = useState<{loading: boolean, error: string, fluentStats: any, transactionStats: any, transactionChart: any[], feeChart: any[], feeManager: any, feeManagerCounters: any, feeManagerHistory: any[], usdnrToken: any, ethPrice: number | null, peerRows: any[]}>({
    loading: true,
    error: "",
    fluentStats: null,
    transactionStats: null,
    transactionChart: [],
    feeChart: [],
    feeManager: null,
    feeManagerCounters: null,
    feeManagerHistory: [],
    usdnrToken: null,
    ethPrice: null,
    peerRows: [],
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const from = getUtcDateString(7);
        const to = getUtcDateString();
        const [fluentStats, transactionStats, chart, feeChart, feeManager, feeManagerCounters, feeManagerHistory, usdnrToken, ethPriceData, chains, ...peerData] = await Promise.all([
          getJson(`${FLUENTSCAN}/stats`),
          getJson(`${FLUENTSCAN}/transactions/stats`),
          getJson(`${FLUENTSCAN}/stats/charts/transactions`),
          getJson(`${FLUENTSCAN_LINES}/txnsFee?from=${from}&to=${to}&resolution=DAY`),
          getJson(`${FLUENTSCAN}/addresses/${FEE_MANAGER_ADDRESS}`),
          getJson(`${FLUENTSCAN}/addresses/${FEE_MANAGER_ADDRESS}/counters`),
          getJson(`${FLUENTSCAN}/addresses/${FEE_MANAGER_ADDRESS}/coin-balance-history-by-day`),
          getJson(`${FLUENTSCAN}/tokens/${USDNR_TOKEN_ADDRESS}`),
          getJson(`${LLAMA_COINS}/prices/current/coingecko:ethereum`),
          getJson(`${LLAMA}/v2/chains`),
          ...peerConfigs.map((peer) => getJson(`${LLAMA}/summary/fees/${peer.slug}`)),
          ...peerConfigs.map((peer) => getJson(`${LLAMA}/summary/fees/${peer.slug}?dataType=dailyRevenue&excludeTotalDataChart=true`)),
        ]);
        const peerFees = peerData.slice(0, peerConfigs.length);
        const peerRevenues = peerData.slice(peerConfigs.length);
        const peerRows = peerConfigs.map((peer, index) => {
          const chain = chains.find((item: any) => item.name === peer.chainName);
          const fees = peerFees[index];
          const revenue = peerRevenues[index];
          return {
            project: peer.project,
            category: peer.category,
            tvl: formatUsd(chain?.tvl),
            fees7d: formatUsd(fees?.total7d),
            revenue7d: formatUsd(revenue?.total7d),
            txs: COMING_SOON,
            confidence: "Live",
            source: "DefiLlama",
          };
        });
        if (!cancelled) {
          setState({
            loading: false,
            error: "",
            fluentStats,
            transactionStats,
            transactionChart: chart.chart_data || [],
            feeChart: feeChart.chart || [],
            feeManager,
            feeManagerCounters,
            feeManagerHistory: feeManagerHistory.items || [],
            usdnrToken,
            ethPrice: ethPriceData?.coins?.["coingecko:ethereum"]?.price || null,
            peerRows,
          });
        }
      } catch (error: any) {
        if (!cancelled) setState((current) => ({ ...current, loading: false, error: error.message || "Unable to load live data" }));
      }
    }
    load();
    const interval = window.setInterval(load, 60_000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, []);

  return state;
}

const tabs = [
  { id: "requests", label: "Requests", icon: MessageSquarePlus, desc: "Community ideas the team and builders want built" },
  { id: "revenue", label: "Revenue", icon: BarChart3, desc: "Source-audited Fluent revenue vs. peer ecosystems" },
  { id: "signals", label: "Signals", icon: Network, desc: "Live, planned, and desired reputation signals" },
  { id: "leaderboards", label: "Leaderboards", icon: Trophy, desc: "Contextual rankings where reputation matters" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const liveData = useLiveFluentData();

  if (activeTab === "home") {
    return (
      <main className="min-h-screen bg-[#f9fafb] px-4 py-8 md:px-8 md:py-12">
        <HeroSection onNavigate={setActiveTab} />
        <MarqueeScroller items={logos} />
        <CoreProductsSection onNavigate={setActiveTab} />
      </main>
    );
  }

  return (
    <DashboardLayout activeTab={activeTab} onNavigate={setActiveTab}>
      {activeTab === "requests" && <RequestsPage />}
      {activeTab === "revenue" && <RevenuePage liveData={liveData} />}
      {activeTab === "signals" && <SignalsPage />}
      {activeTab === "leaderboards" && <LeaderboardsPage />}
    </DashboardLayout>
  );
}

function HeroSection({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return (
    <section className="relative w-full max-w-[1400px] mx-auto rounded-[48px] bg-white border border-slate-200/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.03)] overflow-hidden h-[600px] flex flex-col">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <img
          src={fluentHeroImage}
          alt=""
          className="w-full h-full object-cover scale-105 transition-transform duration-1000"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 flex-1 px-8 md:px-16 pt-12 md:pt-16 flex flex-col items-start"
      >
        <h1 className="font-display text-[42px] md:text-[56px] font-medium tracking-tight leading-[0.96] text-[#0a1b33]">
          Ecosystem tools
          <br />
          for Fluent.
        </h1>
        <p className="mt-5 max-w-[420px] font-sans text-[14px] md:text-[15px] leading-6 text-[#64748b]">
          Revenue tracking, app requests, reputation signals, and contextual
          leaderboards — everything the Fluent community needs in one place.
        </p>
        <motion.button
          onClick={() => onNavigate("revenue")}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="mt-8 rounded-full bg-[#0a152d] px-6 py-3 text-[13px] font-semibold text-white shadow-[0_10px_30px_rgba(10,21,45,0.16)]"
        >
          View live metrics
        </motion.button>
      </motion.div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
        <motion.nav
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34, duration: 0.64, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center bg-white/90 backdrop-blur-2xl px-1.5 py-1.5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200/40"
        >
          <div className="grid w-9 h-9 place-items-center rounded-full bg-white border border-slate-100 shadow-sm text-[#0a1b33]">
            ✦
          </div>
          <button 
            onClick={() => onNavigate("requests")}
            className="ml-2 rounded-full px-4 py-2 text-[12px] font-semibold text-slate-500 hover:text-[#0a1b33] transition-colors"
          >
            Tools
          </button>
          <a href="https://docs.fluent.xyz/" target="_blank" rel="noreferrer" className="rounded-full px-4 py-2 text-[12px] font-semibold text-slate-500 hover:text-[#0a1b33] transition-colors">
            Docs
          </a>
          <button 
            onClick={() => onNavigate("revenue")}
            className="ml-1 flex items-center gap-1.5 bg-white px-5 py-2 rounded-full text-[12px] font-semibold text-[#0a1b33] border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all"
          >
            Open dashboard
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        </motion.nav>
      </div>
    </section>
  );
}

function MarqueeScroller({ items }: { items: LogoItem[] }) {
  const renderedItems = [...items, ...items];

  return (
    <section
      className="mt-10 mb-14 mx-auto w-full max-w-[1400px] overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div className="marquee-track flex w-max gap-4 py-2 hover:[animation-play-state:paused]">
        {renderedItems.map((logo, index) => (
          <LogoCard key={`${logo.alt}-${index}`} logo={logo} />
        ))}
      </div>
    </section>
  );
}

function LogoCard({ logo }: { logo: LogoItem }) {
  return (
    <div className="group relative h-24 w-40 shrink-0 flex items-center justify-center rounded-full bg-white border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all overflow-hidden">
      <div
        className="absolute inset-0 scale-150 opacity-0 transition-all duration-500 ease-out group-hover:scale-100 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${logo.gradient.from}, ${logo.gradient.to})`,
        }}
      />
      <img
        src={logo.src}
        alt={logo.alt}
        loading="lazy"
        className={cn(
          "relative z-10 max-h-14 max-w-[96px] rounded-[18px] object-contain transition duration-300",
          "group-hover:scale-105"
        )}
      />
    </div>
  );
}

function CoreProductsSection({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return (
    <section className="c1-shell">
      <div className="c1-container">
        <div className="c1-header">
          <div className="c1-badge">Core Products</div>
          <h2 className="c1-title">Built for Fluent builders</h2>
          <p className="c1-subtitle">
            Four ecosystem tools
            <br />
            from request to reputation
          </p>
        </div>

        <div className="c1-grid">
          <article className="c1-card c1-card-1 cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => onNavigate("revenue")}>
            <img className="c1-product-icon" src={revenueIcon} alt="" />
            <h3>Revenue Comparables</h3>
          </article>

          <article className="c1-card c1-card-2 cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => onNavigate("requests")}>
            <img className="c1-product-icon" src={requestsIcon} alt="" />
            <h3>Request for Apps</h3>
          </article>

          <article className="c1-card c1-card-3 cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => onNavigate("signals")}>
            <img className="c1-product-icon" src={signalsIcon} alt="" />
            <h3>Reputation Signal Map</h3>
          </article>

          <article className="c1-card c1-card-4 cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => onNavigate("leaderboards")}>
            <img className="c1-product-icon" src={leaderboardsIcon} alt="" />
            <h3>Contextual Leaderboards</h3>
          </article>
        </div>
      </div>
    </section>
  );
}

// --- Dashboard Pages ---

function DashboardLayout({ activeTab, onNavigate, children }: { activeTab: string, onNavigate: (tab: string) => void, children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 grid grid-cols-[auto_1fr_auto] items-center">
          <button onClick={() => onNavigate("home")} className="flex items-center gap-2.5 text-black font-semibold text-[17px] tracking-tight hover:opacity-80 transition-opacity">
            <div className="grid w-8 h-8 place-items-center rounded-[10px] bg-black text-white text-sm shadow-sm">✦</div>
            <span className="hidden sm:inline">Fluent Tools</span>
          </button>
          
          <nav className="flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar">
            {tabs.map(t => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onNavigate(t.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap",
                    isActive ? "bg-black text-white shadow-sm" : "text-slate-500 hover:text-black hover:bg-slate-100"
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </nav>

          <div className="w-[140px] hidden sm:block"></div>
        </div>
      </header>
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 md:px-8 py-10">
        {children}
      </main>
    </div>
  );
}

function SectionHead({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) {
  return (
    <div className="flex items-start gap-5 mb-10">
      <div className="grid w-12 h-12 place-items-center rounded-2xl bg-white border border-slate-200/60 shadow-sm text-[#0a1b33] shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-[#0a1b33] tracking-tight">{title}</h2>
        <p className="mt-1.5 text-[15px] text-slate-500 max-w-2xl leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}

function ComingSoonCard({ title, body }: { title: string, body: string }) {
  return (
    <div className="p-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50">
      <span className="inline-block px-2.5 py-1 mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200/50 rounded-md">Coming Soon</span>
      <h4 className="text-[15px] font-semibold text-[#0a1b33] mb-2">{title}</h4>
      <p className="text-[14px] text-slate-500 leading-relaxed">{body}</p>
    </div>
  );
}

function RequestsPage() {
  const [ideas, setIdeas] = useState<any[]>([
    { id: 1, title: "Yield Aggregator for LP tokens", category: "DeFi", fit: "Need a way to compound yields from Fluent DEXs natively.", votes: 42, stage: "Backlog", tag: "Ecosystem" },
    { id: 2, title: "On-chain Identity & Reputation Map", category: "Prints", fit: "Ties directly into the contextual leaderboards vision.", votes: 128, stage: "In Progress", tag: "Core Infrastructure" },
    { id: 3, title: "Gasless NFT Minting API", category: "Infrastructure", fit: "Reduces friction for consumer apps onboarding new users.", votes: 85, stage: "In Progress", tag: "Tooling" },
    { id: 4, title: "Native Bridge Aggregator", category: "DeFi", fit: "Seamless bridging between Fluent and Ethereum mainnet.", votes: 312, stage: "Shipped", tag: "Completed" },
  ]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ title: "", category: "Prints", fit: "" });

  const filteredIdeas = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return ideas;
    return ideas.filter((i) =>
      [i.title, i.category, i.tag, i.stage, i.fit].join(" ").toLowerCase().includes(q)
    );
  }, [ideas, query]);

  function addIdea(e: any) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setIdeas((prev) => [
      {
        id: Date.now(),
        title: form.title.trim(),
        category: form.category,
        tag: "Community submitted",
        votes: 1,
        stage: "Backlog",
        fit: form.fit.trim() || "Needs a sharper Fluent-specific rationale.",
      },
      ...prev,
    ]);
    setForm({ title: "", category: "Prints", fit: "" });
  }

  function upvote(id: number) {
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, votes: i.votes + 1 } : i)));
  }

  const stages = ["Backlog", "In Progress", "Shipped"];

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Dark Premium Header + Submission Form */}
      <div className="relative mb-12 p-8 md:p-12 rounded-[32px] bg-black border border-slate-800 shadow-2xl overflow-hidden">
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
            <div className="flex items-start gap-5">
              <div className="grid w-14 h-14 place-items-center rounded-2xl bg-white/10 border border-white/20 shadow-sm text-white shrink-0 backdrop-blur-md">
                <MessageSquarePlus className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-white tracking-tight">Request for Apps</h2>
                <p className="mt-2 text-[15px] md:text-[16px] text-slate-400 max-w-xl leading-relaxed">Community ideas the team and builders want built. Upvote, submit, and track the ecosystem's most wanted features.</p>
              </div>
            </div>
            
            <div className="shrink-0 flex gap-2">
              <button className="flex items-center gap-2 px-5 h-12 bg-white/10 border border-white/20 rounded-xl text-[14px] font-semibold text-white hover:bg-white/20 transition-colors backdrop-blur-md shadow-sm">
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <form onSubmit={addIdea} className="grid grid-cols-1 lg:grid-cols-[1fr_160px_1.5fr_auto] gap-4">
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="App idea title" className="h-12 px-5 bg-black/40 border border-slate-700/60 text-white placeholder:text-slate-500 rounded-xl text-[14px] outline-none focus:border-slate-500 transition-all" />
              <div className="relative">
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="h-12 w-full pl-5 pr-10 bg-black/40 border border-slate-700/60 text-white rounded-xl text-[14px] outline-none focus:border-slate-500 transition-all cursor-pointer appearance-none">
                  <option className="bg-black text-white">Prints</option><option className="bg-black text-white">Revenue</option><option className="bg-black text-white">Community</option><option className="bg-black text-white">DeFi</option><option className="bg-black text-white">Distribution</option><option className="bg-black text-white">Infrastructure</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <input value={form.fit} onChange={e => setForm({ ...form, fit: e.target.value })} placeholder="Why it fits Fluent / Prints" className="h-12 px-5 bg-black/40 border border-slate-700/60 text-white placeholder:text-slate-500 rounded-xl text-[14px] outline-none focus:border-slate-500 transition-all" />
              <button type="submit" className="flex items-center justify-center gap-2 h-12 px-8 bg-white/90 backdrop-blur-xl text-black rounded-xl text-[14px] font-bold hover:bg-white transition-colors shadow-sm">
                <Plus className="w-5 h-5" /> Submit Idea
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 flex items-center gap-3 px-5 h-12 bg-white border border-slate-200/80 rounded-xl shadow-sm focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-50 transition-all">
          <Search className="w-5 h-5 text-slate-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search backlog, in-progress, or shipped ideas..." className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {stages.map((stage, idx) => {
          return (
          <div key={stage} className="rounded-3xl p-5 min-h-[500px] border border-slate-200/60 bg-slate-50/50">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="font-display font-semibold text-[18px] text-[#0a1b33]">{stage}</h3>
              <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-slate-200/60 text-slate-600">{filteredIdeas.filter(i => i.stage === stage).length}</span>
            </div>
            <div className="flex flex-col gap-4">
              {filteredIdeas.filter(i => i.stage === stage).map(idea => (
                <div key={idea.id} className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing group">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{idea.category}</span>
                    <button onClick={() => upvote(idea.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/40 bg-white/80 backdrop-blur-md shadow-sm text-[13px] font-bold text-slate-600 hover:border-slate-300 transition-all">
                      <Flame className={cn("w-4 h-4", idea.votes > 100 ? "text-orange-500" : "text-slate-400")} /> {idea.votes}
                    </button>
                  </div>
                  <h4 className="text-[17px] font-semibold text-[#0a1b33] leading-snug mb-2.5">{idea.title}</h4>
                  <p className="text-[14px] text-slate-500 leading-relaxed mb-5">{idea.fit}</p>
                  <div className="flex items-center justify-between">
                     <span className="inline-block text-[11px] font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">{idea.tag}</span>
                     <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-[9px] font-bold text-slate-500">FL</div>
                  </div>
                </div>
              ))}
              {filteredIdeas.filter(i => i.stage === stage).length === 0 && (
                <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300/50 bg-white/50 text-center">
                   <p className="text-[14px] text-slate-500 font-medium">No ideas here yet.</p>
                </div>
              )}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-200/60 last:border-0">
      <span className="text-[14px] font-medium text-slate-500">{label}</span>
      <span className={cn("text-[15px] font-mono font-semibold", value === COMING_SOON ? "text-slate-400 text-[11px] uppercase tracking-wider" : "text-[#0a1b33]")}>
        {value}
      </span>
    </div>
  );
}

function RevenueStreamCard({ title, value, subtitle, trend }: { title: string, value: string, subtitle: string, trend: string }) {
  const isLive = trend === "Live";
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <h4 className="text-[14px] font-semibold text-slate-500 group-hover:text-black transition-colors">{title}</h4>
        <span className={cn(
          "text-[11px] font-mono font-bold px-2 py-0.5 rounded border",
          isLive ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-slate-500 bg-slate-100 border-slate-200"
        )}>{trend}</span>
      </div>
      <div className="mb-1">
        <span className={cn("text-2xl font-display font-semibold", value === COMING_SOON ? "text-slate-300 text-sm uppercase tracking-wider" : "text-black")}>{value}</span>
      </div>
      <p className="text-[13px] text-slate-400">{subtitle}</p>
    </div>
  );
}

function RevenuePage({ liveData }: { liveData: any }) {
  const { loading, error, fluentStats, transactionStats, transactionChart, feeChart, feeManager, feeManagerCounters, feeManagerHistory, usdnrToken, ethPrice, peerRows } = liveData;
  const sevenDayTxs = transactionChart.slice(0, 7).reduce((sum: number, point: any) => sum + Number(point.transactions_count || 0), 0);
  const sevenDayFees = feeChart.slice(-7).reduce((sum: number, point: any) => sum + Number(point.value || 0), 0);
  const [selectedPeerIndex, setSelectedPeerIndex] = useState(0);
  const latestFeeManagerBalance = feeManagerHistory?.[feeManagerHistory.length - 1];
  const previousFeeManagerBalance = feeManagerHistory?.[feeManagerHistory.length - 2];
  const feeManagerDailyChange =
    latestFeeManagerBalance && previousFeeManagerBalance
      ? Number(latestFeeManagerBalance.value) - Number(previousFeeManagerBalance.value)
      : null;

  const fluentData = {
    project: "Fluent",
    category: "Blended L2",
    tvl: fluentStats?.tvl ? formatUsd(fluentStats.tvl) : COMING_SOON,
    fees7d: sevenDayFees ? formatEthWithUsd(sevenDayFees, ethPrice) : COMING_SOON,
    revenue7d: COMING_SOON,
    txs: sevenDayTxs ? `${formatNumber(sevenDayTxs)} / 7d` : COMING_SOON,
    confidence: fluentStats ? "Partial" : COMING_SOON,
    source: "FluentScan",
  };

  const revenueRows = [fluentData, ...peerRows];
  const verifiedNetworkMetrics = [
    { label: "Transactions today", value: formatNumber(fluentStats?.transactions_today) },
    { label: "Transactions 24h", value: formatNumber(transactionStats?.transactions_count_24h) },
    { label: "Gas used today", value: formatNumber(fluentStats?.gas_used_today) },
    { label: "Blocks validated", value: formatNumber(feeManagerCounters?.validations_count) },
    { label: "Total addresses", value: formatNumber(fluentStats?.total_addresses) },
    { label: "USDnr supply", value: formatTokenAmount(usdnrToken?.total_supply, usdnrToken?.decimals, usdnrToken?.symbol || "USDnr") },
    { label: "Avg block time", value: fluentStats?.average_block_time ? `${Number(fluentStats.average_block_time) / 1000}s` : COMING_SOON },
    { label: "Avg gas price", value: formatGasPrice(fluentStats?.gas_prices?.average) },
    { label: "Network utilization", value: Number.isFinite(Number(fluentStats?.network_utilization_percentage)) ? `${Number(fluentStats.network_utilization_percentage).toFixed(2)}%` : COMING_SOON },
  ];
  
  const selectedPeer = peerRows[selectedPeerIndex] || {
    project: loading ? "Loading..." : "No peers found",
    category: "L2 peer",
    tvl: COMING_SOON,
    fees7d: COMING_SOON,
    revenue7d: COMING_SOON,
    txs: COMING_SOON,
  };



  return (
    <div className="max-w-6xl">
      <SectionHead icon={BarChart3} title="Revenue Comparables" subtitle="Source-audited Fluent revenue vs. peer ecosystems. Every metric carries provenance." />

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-200 text-[14px] text-orange-800 font-medium flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          Live data request failed: {error}. Unavailable values are marked 'Coming soon'.
        </div>
      )}

      {/* Fluent Revenue Streams */}
      <div className="mb-12">
        <h3 className="text-xl font-display font-semibold text-black mb-5">Verified Fluent Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <RevenueStreamCard 
            title="24h Network Fees" 
            value={formatWeiWithUsd(transactionStats?.transaction_fees_sum_24h, ethPrice)} 
            subtitle="Gas fees paid across Fluent"
            trend={transactionStats ? "Live" : "Pending"}
          />
          <RevenueStreamCard 
            title="Avg Tx Fee" 
            value={formatWeiWithUsd(transactionStats?.transaction_fees_avg_24h, ethPrice)} 
            subtitle="24h average transaction fee"
            trend={transactionStats ? "Live" : "Pending"}
          />
          <RevenueStreamCard 
            title="Fee Manager Balance" 
            value={formatWeiWithUsd(feeManager?.coin_balance, ethPrice)} 
            subtitle={feeManagerDailyChange ? `${formatNativeFromWei(feeManagerDailyChange)} daily balance change` : "System fee account balance"}
            trend={feeManager ? "Live" : "Pending"}
          />
          <RevenueStreamCard 
            title="Revenue Buckets" 
            value={COMING_SOON} 
            subtitle="Sequencer, app fees, buybacks, treasury need official source mapping"
            trend="Needs API"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
        {verifiedNetworkMetrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <span className="text-[13px] font-semibold text-slate-500">{metric.label}</span>
            <span className={cn("font-mono text-[14px] font-semibold text-[#0a1b33]", metric.value === COMING_SOON && "text-slate-400 text-[11px] uppercase tracking-wider")}>{metric.value}</span>
          </div>
        ))}
      </div>

      {/* Head to Head Comparison */}
      <h3 className="text-xl font-display font-semibold text-black mb-5">Project Comparison</h3>
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 md:p-10 mb-10">
        <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12 relative">
          
          {/* Fluent Side */}
          <div className="flex-1 w-full p-8 rounded-2xl bg-[radial-gradient(circle_at_20%_0%,rgba(245,195,68,0.34),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(181,103,194,0.22),transparent_32%),linear-gradient(145deg,#ffffff_0%,#f4f8f9_100%)] border border-slate-200/70 relative overflow-hidden shadow-md flex flex-col justify-between">
             <div className="absolute -top-12 -right-12 h-52 w-52 rounded-full border border-white/80 bg-white/30 blur-2xl pointer-events-none" />
             <div className="relative z-10 flex flex-col h-full">
               <div className="mb-8">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="grid w-10 h-10 place-items-center rounded-2xl bg-black border border-slate-200/60 shadow-sm overflow-hidden">
                     <img src="https://blendiction.xyz/logos/x-fluentxyz.png" alt="Fluent" className="h-8 w-8 object-contain" />
                   </div>
                   <h3 className="text-3xl font-display font-semibold text-[#0a1b33]">Fluent</h3>
                 </div>
                 <p className="text-sm text-slate-500 ml-[52px]">Blended L2 Ecosystem</p>
               </div>

               <div className="space-y-1 bg-white/72 p-5 rounded-xl border border-white/80 shadow-sm backdrop-blur-xl mt-auto">
                  <div className="flex items-center justify-between py-2.5 border-b border-slate-200/70 last:border-0">
                    <span className="text-[14px] font-medium text-slate-500">Total Value Locked</span>
                    <span className={cn("text-[15px] font-mono font-semibold", fluentData.tvl === COMING_SOON ? "text-slate-400 text-[11px] uppercase tracking-wider" : "text-[#0a1b33]")}>{fluentData.tvl}</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 border-b border-slate-200/70 last:border-0">
                    <span className="text-[14px] font-medium text-slate-500">7D Fees</span>
                    <span className={cn("text-[15px] font-mono font-semibold", fluentData.fees7d === COMING_SOON ? "text-slate-400 text-[11px] uppercase tracking-wider" : "text-[#0a1b33]")}>{fluentData.fees7d}</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 border-b border-slate-200/70 last:border-0">
                    <span className="text-[14px] font-medium text-slate-500">7D Revenue</span>
                    <span className={cn("text-[15px] font-mono font-semibold", fluentData.revenue7d === COMING_SOON ? "text-slate-400 text-[11px] uppercase tracking-wider" : "text-[#0a1b33]")}>{fluentData.revenue7d}</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 border-b border-slate-200/70 last:border-0">
                    <span className="text-[14px] font-medium text-slate-500">Transactions</span>
                    <span className={cn("text-[15px] font-mono font-semibold", fluentData.txs === COMING_SOON ? "text-slate-400 text-[11px] uppercase tracking-wider" : "text-[#0a1b33]")}>{fluentData.txs}</span>
                  </div>
               </div>
             </div>
          </div>

          {/* VS Badge */}
          <div className="lg:absolute left-1/2 top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 shrink-0 flex flex-col items-center justify-center z-20 h-16 lg:h-auto my-4 lg:my-0">
            <div className="w-16 h-16 rounded-full bg-white text-[#0a1b33] flex items-center justify-center font-display font-black text-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-slate-100">
              VS
            </div>
          </div>

          {/* Peer Side */}
          <div className="flex-1 w-full p-8 rounded-2xl bg-white border border-slate-200 relative overflow-hidden shadow-md flex flex-col justify-between">
             <div className="absolute -bottom-10 -right-10 p-4 opacity-[0.03] pointer-events-none"><Network className="w-64 h-64 text-[#0a1b33]" /></div>
             
             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10 gap-4">
               <div>
                 <h3 className="text-3xl font-display font-semibold text-[#0a1b33] mb-1">{selectedPeer.project}</h3>
                 <p className="text-sm text-slate-500">{selectedPeer.category}</p>
               </div>
               
               <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm shrink-0">
                 {peerRows.map((peer: any, idx: number) => (
                   <button 
                     key={peer.project}
                     onClick={() => setSelectedPeerIndex(idx)}
                     className={cn(
                       "px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all",
                       selectedPeerIndex === idx ? "bg-[#0a1b33] text-white shadow-sm" : "text-slate-500 hover:text-[#0a1b33] hover:bg-slate-100/50"
                     )}
                   >
                     {peer.project}
                   </button>
                 ))}
                 {peerRows.length === 0 && (
                   <span className="px-3 py-1.5 text-[13px] text-slate-400">Loading peers...</span>
                 )}
               </div>
             </div>

             <div className="space-y-1 bg-slate-50/80 p-5 rounded-xl border border-slate-100 relative z-10 mt-auto">
                <MetricRow label="Total Value Locked" value={selectedPeer.tvl} />
                <MetricRow label="7D Fees" value={selectedPeer.fees7d} />
                <MetricRow label="7D Revenue" value={selectedPeer.revenue7d} />
                <MetricRow label="Transactions" value={selectedPeer.txs} />
             </div>
          </div>
        </div>
      </div>



      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-12">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-lg font-semibold text-[#0a1b33]">All Peer Ecosystems</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">Project</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">Category</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">TVL</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">Fees 7d</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">Revenue 7d</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">Transactions</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {revenueRows.map(r => (
                <tr key={r.project} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 text-[14px] font-semibold text-[#0a1b33]">{r.project}</td>
                  <td className="py-4 px-6 text-[14px] text-slate-600">{r.category}</td>
                  <td className="py-4 px-6 text-[13px] font-mono text-slate-600">{r.tvl}</td>
                  <td className="py-4 px-6 text-[13px] font-mono text-slate-600">{r.fees7d}</td>
                  <td className="py-4 px-6 text-[13px] font-mono text-slate-600">{r.revenue7d}</td>
                  <td className="py-4 px-6 text-[13px] font-mono text-slate-600">{r.txs}</td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded",
                      r.confidence === "Live" ? "bg-green-50 text-green-700 border border-green-200" :
                      r.confidence === "Partial" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                      "bg-slate-100 text-slate-500 border border-slate-200"
                    )}>
                      {loading && r.project !== "Fluent" ? "Loading" : r.confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SignalsPage() {
  const columns = [
    { name: "Live", color: "bg-green-500" },
    { name: "In Development", color: "bg-orange-400" },
    { name: "Desired", color: "bg-blue-400" },
  ];

  return (
    <div className="max-w-6xl">
      <SectionHead icon={Network} title="Reputation Signal Map" subtitle="Which Prints signals are live, in development, or desired by the community." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {columns.map(col => (
          <div key={col.name} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <strong className="text-[15px] text-[#0a1b33]">{col.name}</strong>
              </div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">{COMING_SOON}</span>
            </div>
            <ComingSoonCard title="Prints signal data" body="Public Prints/signal API access is not confirmed yet. This column will populate once we have a verified source." />
          </div>
        ))}
      </div>
    </div>
  );
}

function LeaderboardsPage() {
  const [period, setPeriod] = useState("7d");

  return (
    <div className="max-w-6xl">
      <SectionHead icon={Trophy} title="Contextual Leaderboards" subtitle="Separate rankings for contexts where reputation actually means something." />

      <div className="flex gap-2 mb-8 bg-white border border-slate-200 p-1 w-max rounded-xl shadow-sm">
        {["7d", "30d", "All time"].map(p => (
          <button 
            key={p} 
            onClick={() => setPeriod(p)}
            className={cn(
              "px-5 py-2 rounded-lg text-[13px] font-medium transition-all",
              period === p ? "bg-[#0a1b33] text-white shadow" : "text-slate-600 hover:text-[#0a1b33] hover:bg-slate-50"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <ComingSoonCard title="Reputation leaderboards" body="No verified public leaderboard or Prints profile API is available yet. Rankings stay 'Coming soon' until real data is wired." />
      </div>
    </div>
  );
}
