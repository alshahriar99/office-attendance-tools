"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [companyName, setCompanyName] = useState("Acme Corp");

  useEffect(() => {
    import("@/lib/actions/settings").then((m) => {
      m.getSettings().then((res) => {
        if (res.settings?.companyName) {
          setCompanyName(res.settings.companyName);
        }
      }).catch(console.error);
    });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: "/reset-password",
      });

      if (error) {
        toast.error(error.message || "Failed to send reset email");
      } else {
        setIsSubmitted(true);
        toast.success("Password reset link sent to your email");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#030712] text-slate-50 selection:bg-primary/30 font-sans items-center justify-center relative p-6">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[100vw] h-[100vw] rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent blur-[120px] opacity-70 animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-[100vw] h-[100vw] rounded-full bg-gradient-to-tl from-blue-500/10 via-cyan-500/5 to-transparent blur-[120px] opacity-70"></div>
        <div className="absolute top-1/4 right-1/4 w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[100px] opacity-50 mix-blend-screen"></div>
      </div>

      <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both z-10">
        <div className="flex flex-col items-center space-y-4 text-center mb-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-lg shadow-primary/25 ring-1 ring-white/10">
            <Building2 size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{companyName}</h1>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/40 p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          <div className="relative z-10">
            {isSubmitted ? (
              <div className="text-center space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success">
                  <ArrowRight className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-white">Check your email</h2>
                <p className="text-sm text-slate-400">
                  We have sent a password reset link to your email address. Please check your inbox.
                </p>
                <Link href="/login" className="inline-block mt-4">
                  <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                    Return to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-8">
                  <h2 className="text-2xl font-bold tracking-tight text-white">Reset Password</h2>
                  <p className="text-sm text-slate-400">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300" htmlFor="email">
                      Email address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="h-12 px-4 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                      {...register("email")}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 font-medium mt-1 pl-1">{errors.email.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-[15px] font-semibold bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-indigo-500/40 border border-white/10"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link href="/login" className="inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
