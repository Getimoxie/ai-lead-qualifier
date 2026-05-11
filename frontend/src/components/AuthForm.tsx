"use client";

interface AuthFormProps {
  mode: "login" | "signup";
  onSubmit: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function AuthForm({ mode, onSubmit, loading, error }: AuthFormProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await onSubmit(fd.get("email") as string, fd.get("password") as string);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      <input
        type="email"
        name="email"
        required
        placeholder="you@company.com"
        className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-violet-500"
      />
      <input
        type="password"
        name="password"
        required
        minLength={6}
        placeholder="At least 6 characters"
        className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-violet-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium disabled:opacity-50"
      >
        {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
      </button>
    </form>
  );
}
