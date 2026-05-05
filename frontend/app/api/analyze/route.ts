import { NextRequest, NextResponse } from "next/server";
import { configure, tasks, runs } from "@trigger.dev/sdk/v3";

export async function POST(req: NextRequest) {
  configure({ accessToken: process.env.TRIGGER_SECRET_KEY! });

  const payload = await req.json();

  const handle = await tasks.trigger("qualify-lead", payload);

  const result = await runs.poll(handle.id, { pollIntervalMs: 1000 });

  if (result.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Task failed", details: result.status },
      { status: 500 }
    );
  }

  // Output may be stored at a presigned URL when it's large
  if (result.output) {
    return NextResponse.json(result.output);
  }

  if (result.outputPresignedUrl) {
    const res = await fetch(result.outputPresignedUrl);
    const output = await res.json();
    return NextResponse.json(output);
  }

  console.error("Trigger.dev run completed but no output found:", JSON.stringify(result, null, 2));
  return NextResponse.json({ error: "No output returned from task" }, { status: 500 });
}
