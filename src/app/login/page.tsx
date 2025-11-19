"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "~/lib/hooks/use-auth";
import { Input } from "~/components/ui/input";
import { PasswordInput } from "~/components/ui/password-input";
import { ActionButton } from "~/components/ui/auth-button";
import { Radio } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      return;
    }

    try {
      await login({ username: username.trim(), password });
      router.push("/recommendations");
    } catch {
      // Error is already handled by useAuth hook and will be displayed
      // No need to set local error state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-semibold mb-3 tracking-tight">
            <Radio className="w-6 h-6" />
            <span>eRadio</span>
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Sign in</h1>
          <p className="text-muted-foreground">Welcome back</p>
        </div>

        <div className="bg-card border border-border/50 rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="apple-input"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm font-medium" style={{ color: '#dc2626' }}>
                {error}
              </p>
            )}

            <ActionButton isLoading={isLoading} loadingText="Signing in...">
              Sign in
            </ActionButton>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-muted-foreground">New to eRadio? </span>
            <Link href="/register" className="text-primary hover:underline font-medium">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
