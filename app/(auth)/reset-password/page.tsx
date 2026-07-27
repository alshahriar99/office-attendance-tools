"use client";

import { useState, Suspense } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2, Lock, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error("Invalid or missing token");
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });

      if (error) {
        toast.error(error.message || "Failed to reset password");
      } else {
        setIsSuccess(true);
        toast.success("Password reset successfully!");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Password Reset Successful</h2>
        <p className="text-sm text-slate-400">
          Your password has been successfully updated. You can now login with your new password.
        </p>
        <Link href="/login" className="inline-block mt-4">
          <Button className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white border-0">
            Proceed to Login <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20 text-destructive">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Invalid Link</h2>
        <p className="text-sm text-slate-400">
          The password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link href="/forgot-password" className="inline-block mt-4">
          <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
            Request New Link
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-white">Set New Password</h2>
        <p className="text-sm text-slate-400">
          Please enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="password">
            New Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="h-12 px-4 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-200"
            {...register("password")}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-xs text-red-400 font-medium mt-1 pl-1">{errors.password.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            className="h-12 px-4 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-200"
            {...register("confirmPassword")}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-400 font-medium mt-1 pl-1">{errors.confirmPassword.message}</p>
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
            "Reset Password"
          )}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Acme Corp</h1>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/40 p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          <div className="relative z-10">
            <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
