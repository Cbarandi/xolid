"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ADMIN_LINKS } from "@/lib/admin-links";

function scrollToAdminHash(hash: string) {
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

type NarrativeStatus = "Emerging" | "Active" | "Fading";

type LiveNarrative = {
  id: string;
  narrative: string;
  status: NarrativeStatus;
  velocity: string;
  sentiment: string;
  persistence: string;
  assets: string;
  confidence: string;
  executiveSummary: string;
  sourceFlowSummary: string;
  assetsAffected: string;
  historicalAnalogueSummary: string;
  expectedOutcome: string;
};

const LIVE_NARRATIVES: LiveNarrative[] = [
  {
    id: "nar-hyperscaler-capex",
    narrative: "Hyperscaler capex: interconnect & power bottleneck",
    status: "Active",
    velocity: "+1.3σ vs 60d doc rate",
    sentiment: "Long bias; dispersion ↑",
    persistence: "19d / high venue overlap",
    assets: "NVDA, AVGO, ANET, VRT, select DC REITs",
    confidence: "0.84",
    executiveSummary:
      "Same cluster appears across sell-side models, vendor calls, and utility filings: backlog narrative is no longer GPU-only; interconnect and grid delivery are binding. Tape leadership broadened from single-name AI beta last week.",
    sourceFlowSummary:
      "Sell-side + vendor primary; macro shops secondary. Cross-language corroboration moderate. Social lead on headline count but lagged on sell-side revision timestamps by ~36h in the median path.",
    assetsAffected:
      "Semis, networking, thermal/power chain, hyperscaler-linked REITs. Second-order: grid capex / regulated wires where disclosed backlogs align.",
    historicalAnalogueSummary:
      "2017–18 enterprise cloud capex window: internal archive shows median 11–14 calendar days from narrative-density spike to clustered EPS revision events; forward 20d semis basket skewed positive but with fat left tails on guide misses.",
    expectedOutcome:
      "Status holds if next hyperscaler capex disclosure does not downshift interconnect spend language. Edge decay trigger: revision breadth narrows while funding stress in SMID networking rises.",
  },
  {
    id: "nar-eth-etf-flow-beta",
    narrative: "ETH spot ETF: flow regime vs. BTC beta",
    status: "Emerging",
    velocity: "+0.6σ vs 60d",
    sentiment: "Neutral-long; basis tight",
    persistence: "8d / mixed corroboration",
    assets: "ETHUSDC, ETHE, stETH, L2 beta",
    confidence: "0.61",
    executiveSummary:
      "Narrative is flow- and calendar-driven: commentary clusters on creation/redemption mechanics and ETH/BTC ratio stability, not on new protocol catalysts. Regulatory text still the constraint on persistence.",
    sourceFlowSummary:
      "Crypto-native legal + ETF desk notes lead; mainstream equity flow commentary follows with lower density. Options surface: call skew up modestly; spot leadership vs BTC inconsistent day-to-day.",
    assetsAffected:
      "ETH spot/perp, listed trust vehicles, liquid staking, high-ETH-beta L2s. CEX equities only where flow disclosure is explicit.",
    historicalAnalogueSummary:
      "Pre-listing BTC ETF archive (mock calibration): headline velocity mean-reverted in 4–9d bursts; sustained narrative required 10d+ of aligned spot ETF flow prints. ETH/BTC ratio volatility was ~1.4× spot BTC in that window.",
    expectedOutcome:
      "Upgrade to Active only if flow + ratio covariance stabilizes and legal corpus shows narrowing ambiguity. Else expect episodic spikes without structural persistence.",
  },
  {
    id: "nar-sol-perp-crowding",
    narrative: "SOL-USDC perps: funding, OI, vs. spot basis",
    status: "Fading",
    velocity: "−0.9σ vs 30d peak",
    sentiment: "Crowded long; tone flat",
    persistence: "22d / decaying coh.",
    assets: "SOLUSDC, perp venues, SOL-beta alts",
    confidence: "0.53",
    executiveSummary:
      "Price held while text attention rolled over: OI/funding divergence vs spot basis flagged one week ago; desk chatter shifted from catalyst list to liquidation maps. Narrative coherence across venues is breaking.",
    sourceFlowSummary:
      "Retail-heavy venues peaked first; institutional notes turned descriptive (flows) vs thematic (ecosystem). New listing cadence no longer incremental to document frequency.",
    assetsAffected:
      "SOL perps, high-beta ecosystem tokens, venues with concentrated OI.",
    historicalAnalogueSummary:
      "Cross-asset crowding unwind sample (internal): when perp OI z-score >2 and text velocity falls >2σ in 5d, median forward 10d spot return was negative in 62% of analogs; basis led spot by 1–3 sessions in most paths.",
    expectedOutcome:
      "Fading unless a discrete catalyst resets OI distribution. Signal book should treat long-bias narratives here as carry with hard crowding stops.",
  },
  {
    id: "nar-btc-balance-sheet",
    narrative: "Balance-sheet BTC: disclosure, hedge, equity convexity",
    status: "Active",
    velocity: "+0.4σ vs 60d",
    sentiment: "Structural holder framing",
    persistence: "31d / stable coh.",
    assets: "BTCUSDC, MSTR, MARA, RIOT",
    confidence: "0.79",
    executiveSummary:
      "Corporate treasury framing persists in filings and IR Q&A: BTC treated as reserve / hedge language, not tactical risk-on expression. Equity read-through trades as convexity on BTC with idiosyncratic funding risk.",
    sourceFlowSummary:
      "Filings + ER notes dominate; social volume lower than price volatility would imply. Cross-venue agreement high on “balance sheet” keyword graph; disagreement on magnitude and hedge accounting.",
    assetsAffected:
      "BTC, disclosed-treasury equities, related credit where covenants reference crypto marks.",
    historicalAnalogueSummary:
      "Gold miner / royalty balance-sheet narratives (2008–12 sample): lower headline velocity vs spot, but narrative half-life elongated once working-capital and covenant language standardized; BTC analog shows similar text half-life in backtest (mock).",
    expectedOutcome:
      "Remains Active while disclosure count rises QoQ. Shock risk is regulatory mark-to-market or audit language, not retail sentiment.",
  },
  {
    id: "nar-us-market-structure",
    narrative: "US digital-asset market structure: dealer inventory rule",
    status: "Emerging",
    velocity: "Spike + mean-revert",
    sentiment: "Event-driven; legal split",
    persistence: "5d / low coh.",
    assets: "COIN, IBIT, high-beta CEX beta",
    confidence: "0.56",
    executiveSummary:
      "Text spike tied to draft rulemaking and dealer inventory interpretation; market already partially priced relief in select listings. Coherence across legal vs trading desks is low — typical pre-comment window.",
    sourceFlowSummary:
      "Politics/legal vertical up; practitioner notes conflict on effective dates and scope. Options: short-dated upside traded; not yet matched by sustained cash equity flow language in our feed.",
    assetsAffected:
      "US-listed crypto proxies, ETF complex, dealer-heavy names with balance-sheet inventory disclosure.",
    historicalAnalogueSummary:
      "MiCA / FCM rule comment archives: median pattern is 2–4 headline cycles before statutory clarity; equity beta to first draft often overshoots realized EPS impact by order of magnitude in quarter t+1.",
    expectedOutcome:
      "Noise unless comment-period language converges. Desk action: treat as calendar risk, not thematic carry.",
  },
  {
    id: "nar-tokenized-mmf",
    narrative: "Tokenized MMFs: spread vs. repo & bank deposit beta",
    status: "Active",
    velocity: "+0.8σ vs 60d",
    sentiment: "Institutional pipeline tone",
    persistence: "17d / rising coh.",
    assets: "USDC, BUIDL, MMF issuers, bank pilot names",
    confidence: "0.72",
    executiveSummary:
      "Narrative anchored on spread pickup vs overnight repo and operational settlement use-cases, not retail yield chasing. Bank pilot announcements are clustering; repetition risk (consensus) is rising but fundamentals still event-sparse.",
    sourceFlowSummary:
      "Bank research + issuer docs lead; crypto social tertiary. Keyword graph widening from “tokenized” to settlement / collateral — positive for persistence if accompanied by AUM line items.",
    assetsAffected:
      "Stablecoin issuers, tokenized fund vehicles, bank tech vendors, select L1 settlement pitches.",
    historicalAnalogueSummary:
      "Prime brokerage electronification (2003–07 analog in fixed-income ops notes): implementation narratives showed 30–90d document half-lives tied to confirmed AUM milestones; failure mode was hype without balance-sheet line disclosure.",
    expectedOutcome:
      "Active while AUM and issuer count rise in filings. Stall if spread vs repo compresses without new use-case documentation.",
  },
];

type SignalBias = "Long" | "Watch" | "Avoid" | "Fade";
type SignalTiming = "Early" | "Mid" | "Crowded" | "Late";

type SignalCandidate = {
  id: string;
  asset: string;
  narrativeDriver: string;
  narrativeId: string;
  bias: SignalBias;
  timing: SignalTiming;
  confidence: string;
  historicalAnalogue: string;
};

const SIGNAL_CANDIDATES: SignalCandidate[] = [
  {
    id: "sig-1",
    asset: "NVDA",
    narrativeDriver: "Hyperscaler capex: interconnect & power bottleneck",
    narrativeId: "nar-hyperscaler-capex",
    bias: "Long",
    timing: "Mid",
    confidence: "0.81",
    historicalAnalogue:
      "2017–18 capex cluster: narrative velocity led sell-side EPS revision batches by median 11d; forward 20d semis excess return positive in 64% of paths when breadth >0.7 (internal mock).",
  },
  {
    id: "sig-2",
    asset: "ANET",
    narrativeDriver: "Hyperscaler capex: interconnect & power bottleneck",
    narrativeId: "nar-hyperscaler-capex",
    bias: "Watch",
    timing: "Crowded",
    confidence: "0.66",
    historicalAnalogue:
      "Networking names: when single-stock short interest z-score >1.5 while narrative still Active, gap-risk drawdowns concentrated post-earnings even when theme intact.",
  },
  {
    id: "sig-3",
    asset: "ETHUSDC",
    narrativeDriver: "ETH spot ETF: flow regime vs. BTC beta",
    narrativeId: "nar-eth-etf-flow-beta",
    bias: "Watch",
    timing: "Early",
    confidence: "0.60",
    historicalAnalogue:
      "BTC pre-listing flow window: ETH/BTC 20d realized vol ratio averaged 1.35×; signal false-positive rate elevated when legal corpus entropy stayed above threshold (mock).",
  },
  {
    id: "sig-4",
    asset: "SOLUSDC",
    narrativeDriver: "SOL-USDC perps: funding, OI, vs. spot basis",
    narrativeId: "nar-sol-perp-crowding",
    bias: "Fade",
    timing: "Late",
    confidence: "0.55",
    historicalAnalogue:
      "Crowding unwind set: OI z>2 + text velocity −2σ/5d implied negative 10d spot drift in 62% of analogs; basis led spot 1–3d (desk backtest, mock).",
  },
  {
    id: "sig-5",
    asset: "BTCUSDC",
    narrativeDriver: "Balance-sheet BTC: disclosure, hedge, equity convexity",
    narrativeId: "nar-btc-balance-sheet",
    bias: "Long",
    timing: "Mid",
    confidence: "0.77",
    historicalAnalogue:
      "Treasury-disclosure narratives: rolling 60d BTC–equity correlation rose with filing mention density; drawdowns on macro shocks underperformed pure beta when hedge language present (mock sample).",
  },
  {
    id: "sig-6",
    asset: "MSTR",
    narrativeDriver: "Balance-sheet BTC: disclosure, hedge, equity convexity",
    narrativeId: "nar-btc-balance-sheet",
    bias: "Watch",
    timing: "Mid",
    confidence: "0.63",
    historicalAnalogue:
      "Single-name convexity: implied vol vs BTC vol spread widened >8 vol pts ahead of 40% of large downside gaps in analog single-treasury names (small-n, mock).",
  },
  {
    id: "sig-7",
    asset: "COIN",
    narrativeDriver: "US digital-asset market structure: dealer inventory rule",
    narrativeId: "nar-us-market-structure",
    bias: "Avoid",
    timing: "Crowded",
    confidence: "0.48",
    historicalAnalogue:
      "Draft-rule equity beta: first-week relief rally median +6% but 70% retracement within 30d absent final rule convergence (cross-jurisdiction mock).",
  },
  {
    id: "sig-8",
    asset: "BUIDL",
    narrativeDriver: "Tokenized MMFs: spread vs. repo & bank deposit beta",
    narrativeId: "nar-tokenized-mmf",
    bias: "Watch",
    timing: "Early",
    confidence: "0.69",
    historicalAnalogue:
      "Ops / issuance narratives: AUM milestone events raised 30d doc coherence by +0.22 on average; spread compression without milestones preceded stall in 58% of cases (mock).",
  },
];

type RecentRun = {
  id: string;
  date: string;
  status: "Complete" | "Running" | "Failed";
  narrativesFound: number;
  signalsGenerated: number;
  reviewed: "Yes" | "No" | "Partial";
};

const RECENT_RUNS: RecentRun[] = [
  {
    id: "VX-260412-014",
    date: "2026-04-12 09:14 UTC",
    status: "Complete",
    narrativesFound: 18,
    signalsGenerated: 9,
    reviewed: "Partial",
  },
  {
    id: "VX-260411-021",
    date: "2026-04-11 11:02 UTC",
    status: "Complete",
    narrativesFound: 14,
    signalsGenerated: 6,
    reviewed: "Yes",
  },
  {
    id: "VX-260411-003",
    date: "2026-04-11 06:40 UTC",
    status: "Running",
    narrativesFound: 11,
    signalsGenerated: 3,
    reviewed: "No",
  },
  {
    id: "VX-260410-018",
    date: "2026-04-10 14:22 UTC",
    status: "Complete",
    narrativesFound: 22,
    signalsGenerated: 11,
    reviewed: "Yes",
  },
  {
    id: "VX-260410-006",
    date: "2026-04-10 08:55 UTC",
    status: "Failed",
    narrativesFound: 6,
    signalsGenerated: 0,
    reviewed: "No",
  },
];

const thClass =
  "pb-4 pr-6 text-[10px] font-medium uppercase tracking-[0.32em] text-white/40 last:pr-0";
const tdClass = "py-4 pr-6 align-top text-white/55 last:pr-0";

function statusStyleNarrative(s: NarrativeStatus) {
  if (s === "Emerging") return "text-amber-200/85";
  if (s === "Active") return "text-emerald-300/80";
  return "text-white/45";
}

function statusStyleRun(s: RecentRun["status"]) {
  if (s === "Failed") return "text-red-400/85";
  if (s === "Running") return "text-amber-200/80";
  return "text-emerald-300/75";
}

function biasStyle(b: SignalBias) {
  if (b === "Long") return "text-emerald-300/78";
  if (b === "Watch") return "text-amber-200/80";
  if (b === "Avoid") return "text-red-400/80";
  return "text-white/50";
}

export function VixionAdminClient() {
  const [selectedNarrativeId, setSelectedNarrativeId] = useState<string | null>(null);
  const [analystNotesByNarrative, setAnalystNotesByNarrative] = useState<Record<string, string>>({});

  const selectedNarrative = useMemo(
    () =>
      selectedNarrativeId
        ? LIVE_NARRATIVES.find((n) => n.id === selectedNarrativeId) ?? null
        : null,
    [selectedNarrativeId],
  );

  const setAnalystNote = useCallback((id: string, value: string) => {
    setAnalystNotesByNarrative((prev) => ({ ...prev, [id]: value }));
  }, []);

  return (
    <main className="min-h-screen bg-black text-white antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-6 sm:px-10 lg:px-16">
        <section className="pb-10 pt-6 sm:pb-12 sm:pt-8 lg:pb-14">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/38">
            <Link href="/admin" className="transition hover:text-white/70">
              ← Go back
            </Link>
          </p>
          <p className="mt-8 text-[10px] font-medium uppercase tracking-[0.42em] text-white/40">
            <Link href="/admin" className="transition hover:text-white/70">
              Admin
            </Link>
            <span className="mx-2 text-white/22">/</span>
            <span className="text-white/55">VIXION</span>
          </p>
          <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            Internal — narrative & edge monitor
          </p>
          <h1 className="mt-4 text-[44px] font-medium leading-[0.96] tracking-[-0.04em] text-white sm:text-[64px] lg:text-[80px]">
            VIXION — Admin
          </h1>
          <p className="mt-4 max-w-[720px] text-[14px] leading-relaxed tracking-[-0.01em] text-white/42 sm:text-[15px]">
            Mock corpus: narrative clusters, corroboration scores, and run ledger. Production joins tape, risk,
            and legal feeds downstream.
          </p>
          <div className="mt-8 h-px w-14 bg-white/18" />

          <p className="mt-10 text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            Actions
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/admin"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-transparent px-8 text-[11px] font-medium uppercase tracking-[0.28em] text-white/80 transition hover:border-white/28 hover:text-white"
            >
              Go back
            </Link>
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-white px-8 text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:bg-white/92"
            >
              Run VIXION
            </button>
            <button
              type="button"
              onClick={() => scrollToAdminHash(ADMIN_LINKS.VIXION_LOGS)}
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-transparent px-8 text-[11px] font-medium uppercase tracking-[0.28em] text-white/80 transition hover:border-white/28 hover:text-white"
            >
              View Logs
            </button>
            <button
              type="button"
              onClick={() => scrollToAdminHash(ADMIN_LINKS.VIXION_NARRATIVES)}
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-transparent px-8 text-[11px] font-medium uppercase tracking-[0.28em] text-white/80 transition hover:border-white/28 hover:text-white"
            >
              Review Narratives
            </button>
          </div>
        </section>

        <section
          id="live-narratives"
          className="scroll-mt-24 border-t border-white/8 py-14 sm:py-20 lg:py-24"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            Live narratives
          </p>
          <p className="mt-3 max-w-[640px] text-[14px] leading-relaxed text-white/38 sm:text-[15px]">
            Detected themes with cross-source coherence. Row opens the work panel.
          </p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[1040px] border-collapse text-left text-[14px] tracking-[-0.01em] text-white/60 sm:text-[15px]">
              <thead>
                <tr className="border-b border-white/12">
                  {[
                    "Narrative",
                    "Status",
                    "Velocity",
                    "Sentiment",
                    "Persistence",
                    "Assets",
                    "Confidence",
                  ].map((col) => (
                    <th key={col} scope="col" className={thClass}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LIVE_NARRATIVES.map((row) => {
                  const isSelected = row.id === selectedNarrativeId;
                  return (
                    <tr
                      key={row.id}
                      className={`cursor-pointer border-b border-white/[0.07] transition hover:bg-white/[0.04] ${
                        isSelected ? "bg-white/[0.07]" : ""
                      }`}
                      onClick={() => setSelectedNarrativeId(row.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedNarrativeId(row.id);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={isSelected}
                    >
                      <td className={`${tdClass} max-w-[280px] font-medium text-white/82`}>
                        {row.narrative}
                      </td>
                      <td className={tdClass}>
                        <span className={statusStyleNarrative(row.status)}>{row.status}</span>
                      </td>
                      <td className={tdClass}>{row.velocity}</td>
                      <td className={tdClass}>{row.sentiment}</td>
                      <td className={`${tdClass} tabular-nums`}>{row.persistence}</td>
                      <td className={`${tdClass} max-w-[280px] text-[13px] leading-snug text-white/48 sm:text-[14px]`}>
                        {row.assets}
                      </td>
                      <td className={`${tdClass} tabular-nums`}>{row.confidence}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border-t border-white/8 py-14 sm:py-20 lg:py-24">
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            Signal candidates
          </p>
          <p className="mt-3 max-w-[640px] text-[14px] leading-relaxed text-white/38 sm:text-[15px]">
            Proposed links from narrative state to instruments. Not execution instructions; risk books apply
            downstream.
          </p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-[14px] tracking-[-0.01em] text-white/60 sm:text-[15px]">
              <thead>
                <tr className="border-b border-white/12">
                  {[
                    "Asset",
                    "Narrative driver",
                    "Bias",
                    "Timing",
                    "Confidence",
                    "Historical analogue",
                  ].map((col) => (
                    <th key={col} scope="col" className={thClass}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIGNAL_CANDIDATES.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/[0.07]"
                  >
                    <td className={`${tdClass} font-medium text-white/78`}>{row.asset}</td>
                    <td className={tdClass}>
                      <button
                        type="button"
                        className="text-left text-white/55 underline decoration-white/15 underline-offset-4 transition hover:text-white/80 hover:decoration-white/35"
                        onClick={() => setSelectedNarrativeId(row.narrativeId)}
                      >
                        {row.narrativeDriver}
                      </button>
                    </td>
                    <td className={tdClass}>
                      <span className={biasStyle(row.bias)}>{row.bias}</span>
                    </td>
                    <td className={tdClass}>{row.timing}</td>
                    <td className={`${tdClass} tabular-nums`}>{row.confidence}</td>
                    <td className={`${tdClass} max-w-[320px] text-[13px] leading-snug text-white/48 sm:text-[14px]`}>
                      {row.historicalAnalogue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          id="selected-narrative"
          className="scroll-mt-24 border-t border-white/8 py-14 sm:py-20 lg:py-24"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            Selected narrative detail
          </p>
          {selectedNarrative ? (
            <div className="mt-8 max-w-[800px] space-y-10">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/40">
                  Narrative
                </p>
                <p className="mt-2 text-[18px] font-medium tracking-[-0.02em] text-white/90">
                  {selectedNarrative.narrative}
                </p>
                <p className="mt-2 text-[13px] text-white/38">
                  <span className={statusStyleNarrative(selectedNarrative.status)}>
                    {selectedNarrative.status}
                  </span>
                  <span className="mx-2 text-white/20">·</span>
                  <span className="tabular-nums">Confidence {selectedNarrative.confidence}</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/40">
                  Executive summary
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-white/55 sm:text-[16px]">
                  {selectedNarrative.executiveSummary}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/40">
                  Source flow summary
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-white/55 sm:text-[16px]">
                  {selectedNarrative.sourceFlowSummary}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/40">
                  Assets affected
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-white/55 sm:text-[16px]">
                  {selectedNarrative.assetsAffected}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/40">
                  Historical analogue summary
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-white/55 sm:text-[16px]">
                  {selectedNarrative.historicalAnalogueSummary}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/40">
                  Expected outcome
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-white/55 sm:text-[16px]">
                  {selectedNarrative.expectedOutcome}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/40">
                  Analyst note
                </p>
                <textarea
                  value={analystNotesByNarrative[selectedNarrative.id] ?? ""}
                  onChange={(e) => setAnalystNote(selectedNarrative.id, e.target.value)}
                  rows={5}
                  className="mt-3 w-full resize-y border border-white/12 bg-transparent px-4 py-3 text-[15px] leading-relaxed tracking-[-0.01em] text-white outline-none transition placeholder:text-white/25 focus:border-white/28 sm:text-[16px]"
                  placeholder="Internal note for this narrative…"
                  aria-label="Analyst note for selected narrative"
                />
              </div>
            </div>
          ) : (
            <p className="mt-8 max-w-[560px] text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
              Select a narrative row for sourcing summary, corroboration, analogue context, and forward test.
            </p>
          )}
        </section>

        <section id="recent-runs" className="scroll-mt-24 border-t border-white/8 py-14 sm:py-20 lg:py-24">
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">
            Recent runs
          </p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-[14px] tracking-[-0.01em] text-white/60 sm:text-[15px]">
              <thead>
                <tr className="border-b border-white/12">
                  {[
                    "Run ID",
                    "Date",
                    "Status",
                    "Narratives found",
                    "Signals generated",
                    "Reviewed",
                  ].map((col) => (
                    <th key={col} scope="col" className={thClass}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_RUNS.map((run) => (
                  <tr key={run.id} className="border-b border-white/[0.07]">
                    <td className={`${tdClass} font-medium text-white/78`}>{run.id}</td>
                    <td className={tdClass}>{run.date}</td>
                    <td className={tdClass}>
                      <span className={statusStyleRun(run.status)}>{run.status}</span>
                    </td>
                    <td className={`${tdClass} tabular-nums`}>{run.narrativesFound}</td>
                    <td className={`${tdClass} tabular-nums`}>{run.signalsGenerated}</td>
                    <td className={tdClass}>{run.reviewed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="vixion-logs" className="scroll-mt-24 border-t border-white/8 py-12 sm:py-14">
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/34">Logs</p>
          <p className="mt-4 max-w-[560px] text-[14px] leading-relaxed text-white/38 sm:text-[15px]">
            Log tail not connected. Wire object store / streaming job when infra is ready.
          </p>
        </section>

      </div>
    </main>
  );
}
