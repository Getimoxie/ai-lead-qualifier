import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

export default async function NavBar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-slate-100 font-semibold text-lg hover:text-white transition">
          Lead Qualifier
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/history"
            className="text-slate-400 hover:text-slate-100 text-sm transition"
          >
            History
          </Link>
          {user && (
            <>
              <span className="text-slate-500 text-sm hidden sm:block">{user.email}</span>
              <SignOutButton />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
