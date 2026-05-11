"use client";

import { useState } from "react";
import LeadForm, { QualificationResult } from "@/components/LeadForm";
import QualificationResultCard from "@/components/QualificationResult";

export default function Home() {
  const [result, setResult] = useState<QualificationResult | null>(null);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-4 py-1.5 text-sm text-slate-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#D97757]" />
            Powered by Claude
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-100 mb-3">
            AI Lead Qualifier
          </h1>
          <p className="text-slate-400 text-lg">
            Fill in the details below and let Claude assess whether this lead is worth pursuing.
          </p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 shadow-xl">
          {result ? (
            <QualificationResultCard result={result} onReset={() => setResult(null)} />
          ) : (
            <LeadForm onResult={setResult} />
          )}
        </div>
      </div>
    </main>
  );
}
