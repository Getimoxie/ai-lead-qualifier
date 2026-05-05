"use client";

import { QualificationResult } from "./LeadForm";

interface QualificationResultProps {
  result: QualificationResult;
  onReset: () => void;
}

function scoreColor(score: number) {
  if (score >= 7) return "text-emerald-400 bg-emerald-900/40 border-emerald-700";
  if (score >= 4) return "text-amber-400 bg-amber-900/40 border-amber-700";
  return "text-red-400 bg-red-900/40 border-red-700";
}

const recommendationConfig = {
  pursue: {
    label: "Pursue",
    class: "bg-emerald-900/50 text-emerald-300 border-emerald-600",
    dot: "bg-emerald-400",
  },
  nurture: {
    label: "Nurture",
    class: "bg-amber-900/50 text-amber-300 border-amber-600",
    dot: "bg-amber-400",
  },
  pass: {
    label: "Pass",
    class: "bg-red-900/50 text-red-300 border-red-600",
    dot: "bg-red-400",
  },
};

export default function QualificationResultCard({ result, onReset }: QualificationResultProps) {
  const recConfig = recommendationConfig[result.recommendation];

  return (
    <div className="space-y-6">
      {/* Score + Recommendation */}
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={`flex items-center justify-center w-20 h-20 rounded-2xl border-2 text-4xl font-bold ${scoreColor(result.score)}`}
        >
          {result.score}
        </div>
        <div>
          <p className="text-slate-400 text-sm mb-1">Score out of 10</p>
          <span
            className={`inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm font-semibold ${recConfig.class}`}
          >
            <span className={`w-2 h-2 rounded-full ${recConfig.dot}`} />
            {recConfig.label}
          </span>
        </div>
      </div>

      {/* Reasoning */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
          Reasoning
        </h3>
        <p className="text-slate-300 leading-relaxed">{result.reasoning}</p>
      </div>

      {/* Strengths */}
      {result.strengths.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
            Strengths
          </h3>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-300">
                <span className="mt-0.5 text-emerald-400 flex-shrink-0">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Concerns */}
      {result.concerns.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
            Concerns
          </h3>
          <ul className="space-y-2">
            {result.concerns.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-300">
                <span className="mt-0.5 text-red-400 flex-shrink-0">✗</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-slate-100 font-medium py-3 px-6 rounded-lg transition"
      >
        Analyze Another Lead
      </button>
    </div>
  );
}
