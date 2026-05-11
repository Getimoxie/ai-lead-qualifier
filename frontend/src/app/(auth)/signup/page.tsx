"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSignup = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md text-center space-y-4">
        <div className="text-4xl">📬</div>
        <h2 className="text-xl font-semibold text-white">Check your email</h2>
        <p className="text-gray-400 text-sm">
          We sent a confirmation link to your inbox. Click it to activate your account, then{" "}
          <Link href="/login" className="text-violet-400 hover:underline">sign in</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Create account</h1>
        <p className="text-gray-400 mt-1">AI-Powered Lead Scoring</p>
      </div>
      <AuthForm mode="signup" onSubmit={handleSignup} loading={loading} error={error} />
      <p className="text-center text-gray-400 text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-violet-400 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
