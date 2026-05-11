import { NextRequest, NextResponse } from "next/server";
import { configure, tasks, runs } from "@trigger.dev/sdk/v3";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  const { companyName, companyUrl, industry, headcount, notes } = payload;

  configure({ accessToken: process.env.TRIGGER_SECRET_KEY! });

  const handle = await tasks.trigger("qualify-lead", { companyName, companyUrl, industry, headcount, notes });

  const { error: insertError } = await supabase.from("leads").insert({
    user_id: user.id,
    run_id: handle.id,
    lead_input: { companyName, companyUrl, industry, headcount, notes: notes ?? null },
  });

  if (insertError) {
    console.error("Supabase insert error:", insertError);
    return NextResponse.json({ error: "Failed to save lead", details: insertError.message }, { status: 500 });
  }

  const result = await runs.poll(handle.id, { pollIntervalMs: 1000 });

  if (result.status !== "COMPLETED") {
    return NextResponse.json({ error: "Task failed", details: result.status }, { status: 500 });
  }

  let output = result.output;
  if (!output && result.outputPresignedUrl) {
    const res = await fetch(result.outputPresignedUrl);
    output = await res.json();
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

  return NextResponse.json(output);
}
