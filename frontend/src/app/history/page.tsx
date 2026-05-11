import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HistoryList, { Lead } from "@/components/HistoryList";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-slate-100 mb-8">Lead History</h1>
        <HistoryList leads={(leads ?? []) as Lead[]} />
      </div>
    </main>
  );
}
