"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Lead Qualifier</h1>
        <p className="text-gray-400 mt-1">AI-Powered Lead Scoring</p>
      </div>
      <AuthForm mode="login" onSubmit={handleLogin} loading={loading} error={error} />
      <p className="text-center text-gray-400 text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-violet-400 hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
