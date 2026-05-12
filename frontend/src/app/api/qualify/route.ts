import { NextRequest, NextResponse } from "next/server";
import { configure, tasks, runs } from "@trigger.dev/sdk/v3";
import { createClient } from "@/lib/supabase/server";
import type { CompanyResearch } from "@/components/LeadForm";

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

interface TavilyResponse {
  answer?: string;
  results: TavilyResult[];
}

async function tavilySearch(query: string): Promise<TavilyResponse> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: "advanced",
      include_answer: true,
      max_results: 5,
    }),
  });
  if (!res.ok) throw new Error(`Tavily error: ${res.status}`);
  return res.json();
}

async function researchCompany(url: string): Promise<{ summary: string; structured: CompanyResearch }> {
  const domain = new URL(url).hostname.replace(/^www\./, "");

  const [overview, funding, news] = await Promise.all([
    tavilySearch(`${domain} company what they do products industry`),
    tavilySearch(`${domain} company size employees funding revenue`),
    tavilySearch(`${domain} company news announcements 2024 2025`),
  ]);

  const structured: CompanyResearch = {
    description: overview.answer ?? overview.results[0]?.content.slice(0, 400) ?? "",
    fundingInfo: funding.answer ?? funding.results[0]?.content.slice(0, 300) ?? "",
    companySize: funding.results
      .map((r) => r.content)
      .join(" ")
      .match(/\d[\d,]*\s*(employees?|people|staff|team members?)/i)?.[0] ?? "",
    recentNews: news.results.slice(0, 3).map((r) => r.title),
  };

  const summary = [
    `Overview: ${structured.description}`,
    `Funding/Size: ${structured.fundingInfo}`,
    structured.companySize ? `Estimated size: ${structured.companySize}` : "",
    structured.recentNews.length
      ? `Recent news:\n${structured.recentNews.map((n) => `- ${n}`).join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return { summary, structured };
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { companyWebsiteUrl, companyName, companyUrl, industry, headcount, notes } =
    await req.json();

  // Optionally research the company with Tavily
  let research: { summary: string; structured: CompanyResearch } | null = null;
  if (companyWebsiteUrl) {
    try {
      research = await researchCompany(companyWebsiteUrl);
    } catch (err) {
      console.error("Tavily research failed (continuing without it):", err);
    }
  }

  configure({ accessToken: process.env.TRIGGER_SECRET_KEY! });

  const handle = await tasks.trigger("qualify-lead", {
    companyName,
    companyUrl,
    industry,
    headcount,
    notes,
    ...(research ? { research: research.summary } : {}),
  });

  const { error: insertError } = await supabase.from("leads").insert({
    user_id: user.id,
    run_id: handle.id,
    lead_input: { companyWebsiteUrl, companyName, companyUrl, industry, headcount, notes },
  });

  if (insertError) {
    console.error("Supabase insert error:", insertError);
    return NextResponse.json({ error: "Failed to save lead", details: insertError.message }, { status: 500 });
  }

  const result = await runs.poll(handle.id, { pollIntervalMs: 1000 });

  if (result.status !== "COMPLETED") {
    return NextResponse.json({ error: "Task failed", details: result.status }, { status: 500 });
  }

  let output = result.output as Record<string, unknown> | undefined;
  if (!output && result.outputPresignedUrl) {
    const r = await fetch(result.outputPresignedUrl);
    output = await r.json();
  }
  if (!output) {
    return NextResponse.json({ error: "No output returned from task" }, { status: 500 });
  }

  const { score, recommendation, reasoning, strengths, concerns } = output as {
    score: number;
    recommendation: string;
    reasoning: string;
    strengths: string[];
    concerns: string[];
  };

  const tier = score >= 7 ? "hot" : score >= 4 ? "warm" : "cold";

  await supabase
    .from("leads")
    .update({
      result: { recommendation, reasoning, strengths, concerns },
      score,
      tier,
      completed_at: new Date().toISOString(),
    })
    .eq("run_id", handle.id)
    .eq("user_id", user.id);

  return NextResponse.json({
    ...output,
    ...(research ? { research: research.structured } : {}),
  });
}
