// ─── Seed RFA ideas for the Fluent ecosystem ────────────────────────────────
// These are real ideas inspired by Dino's tweets and Fluent's unique
// "blended execution" paradigm (mixing EVM, Wasm, and SVM in one execution layer).
// No real GitHub issues exist yet — be the first to submit!

export type Category = "DeFi" | "Tooling" | "Infrastructure" | "Social";
export type Status = "Open" | "In Progress" | "Funded";

export interface SeedRFA {
  id: string;
  title: string;
  description: string;
  category: Category;
  submitter: string;
  votes: number;
  status: Status;
  createdAt: string;
  url: string; // GitHub issue URL (empty string for seed entries)
}

export const seedRFAs: SeedRFA[] = [
  {
    id: "seed-001",
    title: "Blended Execution DEX Aggregator",
    description:
      "A DEX aggregator that leverages Fluent's blended execution to route trades across EVM, Wasm, and SVM liquidity pools in a single atomic transaction. Compare routes, estimate blended gas, and execute optimally.",
    category: "DeFi",
    submitter: "dino",
    votes: 0,
    status: "Open",
    createdAt: "2026-05-08T00:00:00Z",
    url: "",
  },
  {
    id: "seed-002",
    title: "rWasm Developer Playground",
    description:
      "An in-browser IDE for writing, compiling, and testing rWasm smart contracts. Integrate with Fluent's testnet, provide templates for common patterns (tokens, NFTs, AMMs), and include a gas profiler.",
    category: "Tooling",
    submitter: "dino",
    votes: 0,
    status: "Open",
    createdAt: "2026-05-08T00:00:00Z",
    url: "",
  },
  {
    id: "seed-003",
    title: "Cross-VM Composable Identity",
    description:
      "A unified identity protocol that works across Fluent's blended VMs. Users prove ownership of EVM and Wasm addresses under one namespace, with ZK proofs linking identities without revealing the mapping.",
    category: "Infrastructure",
    submitter: "dino",
    votes: 0,
    status: "Open",
    createdAt: "2026-05-08T00:00:00Z",
    url: "",
  },
];

// ─── Submission URL ──────────────────────────────────────────────────────────
// Real submission pipeline: opens a GitHub issue on blenddash with a template
export const RFA_SUBMIT_URL =
  "https://github.com/Pelz01/blenddash/issues/new?title=RFA%3A+&body=%23%23+Project+Name%0A%0A%23%23+Category%0A%28DeFi+%7C+Tooling+%7C+Infrastructure+%7C+Social%29%0A%0A%23%23+Description%0A%0A%23%23+Why+this+matters+for+Fluent%0A%0A%23%23+Links+%2F+References%0A&labels=rfa";
