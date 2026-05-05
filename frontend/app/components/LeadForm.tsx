"use client";

import { useState } from "react";

export interface QualificationResult {
  score: number;
  recommendation: "pursue" | "nurture" | "pass";
  reasoning: string;
  strengths: string[];
  concerns: string[];
}

interface LeadFormProps {
  onResult: (result: QualificationResult) => void;
}

export default function LeadForm({ onResult }: LeadFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    companyName: "",
    companyUrl: "",
    industry: "",
    headcount: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const text = await res.text();
      console.log("API response status:", res.status, "body:", text);

      if (!res.ok) {
        let errMsg = "Something went wrong";
        try { errMsg = JSON.parse(text).error || errMsg; } catch {}
        throw new Error(errMsg);
      }

      if (!text) throw new Error("Empty response from server");
      const data: QualificationResult = JSON.parse(text);
      onResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#D97757] focus:border-transparent transition";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Company Name <span className="text-[#D97757]">*</span>
          </label>
          <input
            type="text"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            required
            placeholder="Acme Corp"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Company URL <span className="text-[#D97757]">*</span>
          </label>
          <input
            type="url"
            name="companyUrl"
            value={form.companyUrl}
            onChange={handleChange}
            required
            placeholder="https://acme.com"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Industry / Vertical <span className="text-[#D97757]">*</span>
          </label>
          <input
            type="text"
            name="industry"
            value={form.industry}
            onChange={handleChange}
            required
            placeholder="SaaS, Healthcare, Fintech..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Headcount <span className="text-[#D97757]">*</span>
          </label>
          <select
            name="headcount"
            value={form.headcount}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="" disabled>
              Select range
            </option>
            <option value="1-10">1–10</option>
            <option value="11-50">11–50</option>
            <option value="51-200">51–200</option>
            <option value="201-500">201–500</option>
            <option value="501-1000">501–1000</option>
            <option value="1000+">1000+</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Notes
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={4}
          placeholder="Any observations about this lead — pain points, recent news, fit signals..."
          className={inputClass}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/40 border border-red-700 px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#D97757] hover:bg-[#c4674a] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Analyzing lead...
          </>
        ) : (
          "Analyze Lead"
        )}
      </button>
    </form>
  );
}
