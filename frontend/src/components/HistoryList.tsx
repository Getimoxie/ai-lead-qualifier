"use client";

import { useState } from "react";

export interface Lead {
  id: string;
  run_id: string;
  lead_input: {
    companyUrl: string;
  };
  result: {
    companyName: string;
    recommendation: "pursue" | "nurture" | "pass";
    reasoning: string;
    strengths: string[];
    concerns: string[];
  } | null;
  score: number | null;
  tier: "hot" | "warm" | "cold" | null;
  created_at: string;
  completed_at: string | null;
}

function tierBadge(tier: Lead["tier"]) {
  if (!tier) return { label: "Pending", class: "bg-slate-700 text-slate-300" };
  if (tier === "hot") return { label: "Hot", class: "bg-emerald-900/60 text-emerald-300 border border-emerald-700" };
  if (tier === "warm") return { label: "Warm", class: "bg-amber-900/60 text-amber-300 border border-amber-700" };
  return { label: "Cold", class: "bg-red-900/60 text-red-300 border border-red-700" };
}

const recColors: Record<string, string> = {
  pursue: "text-emerald-400",
  nurture: "text-amber-400",
  pass: "text-red-400",
};

export default function HistoryList({ leads }: { leads: Lead[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (leads.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        No leads qualified yet.{" "}
        <a href="/" className="text-[#D97757] hover:underline">Analyze your first lead →</a>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {leads.map((lead) => {
        const tier = tierBadge(lead.tier);
        const isOpen = expanded === lead.id;
        const companyName = lead.result?.companyName ?? lead.lead_input.companyUrl;
        const companyUrl = lead.lead_input.companyUrl;

        return (
          <li key={lead.id} className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
            <button
              className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-800/80 transition"
              onClick={() => setExpanded(isOpen ? null : lead.id)}
            >
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${tier.class}`}>
                {tier.label}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-slate-100 font-medium truncate">{companyName}</p>
                <p className="text-slate-500 text-sm truncate">{companyUrl}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {lead.score !== null && (
                  <span className="text-2xl font-bold text-slate-100">{lead.score}</span>
                )}
                {lead.result?.recommendation && (
                  <span className={`text-sm font-medium capitalize ${recColors[lead.result.recommendation]}`}>
                    {lead.result.recommendation}
                  </span>
                )}
                <span className="text-slate-600 text-xs">
                  {new Date(lead.created_at).toLocaleDateString()}
                </span>
                <span className={`text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</span>
              </div>
            </button>

            {isOpen && lead.result && (
              <div className="px-5 pb-5 space-y-4 border-t border-slate-700 pt-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Reasoning</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{lead.result.reasoning}</p>
                </div>
                {lead.result.strengths.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Strengths</h4>
                    <ul className="space-y-1">
                      {lead.result.strengths.map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                          <span className="text-emerald-400 flex-shrink-0">✓</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {lead.result.concerns.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Concerns</h4>
                    <ul className="space-y-1">
                      {lead.result.concerns.map((c, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                          <span className="text-red-400 flex-shrink-0">✗</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
