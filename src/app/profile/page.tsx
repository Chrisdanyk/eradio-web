"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "~/lib/store/auth-store";
import { authApi } from "~/lib/api/auth.api";
import type { UserProfileResponse, UpdateProfileRequest } from "~/lib/types/api.types";
import { ActionButton } from "~/components/ui/auth-button";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { User, Mail, Shield, Radio } from "lucide-react";
import { extractErrorMessage } from "~/lib/utils/error-handler";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, initialize, user, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    fullName: "",
    email: "",
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) return;

      setIsLoadingProfile(true);
      setError(null);

      try {
        const data = await authApi.getProfile();
        setProfile(data);
        setFormData({
          fullName: data.fullName || "",
          email: data.email || "",
        });
      } catch (err) {
        const errorMessage = extractErrorMessage(err, "profile");
        setError(errorMessage);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (isAuthenticated) {
      void loadProfile();
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedProfile = await authApi.updateProfile(formData);
      setProfile(updatedProfile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "update profile");
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof UpdateProfileRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading || isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/search" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Radio className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold tracking-tight text-foreground">Browse Stations</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/search"
                className="text-sm font-medium transition-colors px-3 py-1.5 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted/50"
              >
                Search
              </Link>
              <Link
                href="/search"
                className="text-sm font-medium transition-colors px-3 py-1.5 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted/50"
              >
                Favorites
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all ring-2 ring-primary/20 group-hover:ring-primary/40">
                <User className="w-5 h-5 text-primary" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                {user?.username}
              </span>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout} className="h-9 text-foreground/80 hover:text-foreground">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-8 pt-24">
        <h1 className="text-3xl font-semibold text-foreground mb-8">Edit Profile</h1>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-600 dark:text-green-400">Profile updated successfully!</p>
          </div>
        )}

        {profile && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="h-11 pl-10"
                    placeholder="Full Name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="h-11 pl-10"
                    placeholder="Email"
                    required
                  />
                </div>
              </div>

              {/* Username (Read-only) */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={profile.username}
                  disabled
                  className="h-11 bg-muted/50 cursor-not-allowed"
                />
              </div>

              {/* Role (Read-only) */}
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium text-foreground">
                  Role
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="role"
                    type="text"
                    value={profile.role}
                    disabled
                    className="h-11 pl-10 bg-muted/50 cursor-not-allowed capitalize"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <ActionButton
              type="submit"
              isLoading={isSaving}
              loadingText="Saving..."
            >
              Save
            </ActionButton>
          </form>
        )}
      </main>
    </div>
  );
}
