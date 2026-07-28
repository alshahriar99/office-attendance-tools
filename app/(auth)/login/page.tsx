"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      });
      if (result?.error) {
        const msg = result.error.message || result.error.statusText || "Invalid email or password. Please check your credentials or run /api/seed first.";
        setError(msg);
      } else {
        router.push("/");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#030712] text-slate-50 selection:bg-primary/30 font-sans">

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[100vw] h-[100vw] rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent blur-[120px] opacity-70 animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-[100vw] h-[100vw] rounded-full bg-gradient-to-tl from-blue-500/10 via-cyan-500/5 to-transparent blur-[120px] opacity-70"></div>
        <div className="absolute top-1/4 right-1/4 w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[100px] opacity-50 mix-blend-screen"></div>
      </div>

      {/* Left side - Branding / Illustration (Hidden on mobile) */}
      <div className="relative hidden lg:flex w-[55%] flex-col justify-between p-16 border-r border-white/5 bg-black/20 backdrop-blur-3xl z-10">
        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000 ease-out fill-mode-both">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-lg shadow-primary/25 ring-1 ring-white/10">
              <Building2 size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              {companyName}
            </span>
          </div>

          <div className="space-y-6 pt-16 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-slate-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              System v2.0 Now Live
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Manage your workforce <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                intelligently.
              </span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed font-light">
              The modern attendance management system designed for scale, speed, and seamless integration across your entire organization.
            </p>
          </div>
        </div>

        <div className="space-y-6 max-w-md animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 ease-out fill-mode-both">
          <div className="space-y-4">
            {[
              "Real-time attendance tracking",
              "Automated leave management",
              "Comprehensive reporting & analytics"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-8 flex flex-row items-center justify-between border-t border-white/10">
            <div className="text-sm font-medium text-slate-400">
              Developed by <span className="text-indigo-400 font-semibold">Dev With Mubin</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="https://www.facebook.com/DevWithMubin/" className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-[#1877F2]/20 hover:text-[#1877F2] hover:border-[#1877F2]/50 transition-all">
                <FacebookIcon className="h-4 w-4" />
              </Link>
              <Link href="https://www.linkedin.com/in/al-shahriar-339099266/" className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-[#0A66C2]/20 hover:text-[#0A66C2] hover:border-[#0A66C2]/50 transition-all">
                <LinkedinIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12 z-10 relative">
        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-right-8 duration-700 ease-out fill-mode-both">

          {/* Mobile logo */}
          <div className="flex flex-col items-center space-y-4 text-center lg:hidden mb-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-lg shadow-primary/25 ring-1 ring-white/10">
              <Building2 size={28} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{companyName}</h1>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/40 p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            {/* Subtle inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="space-y-2 mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
                <p className="text-sm text-slate-400">
                  Enter your credentials to access your workspace
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <div className="p-3.5 text-sm rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-medium flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                    {error}
                  </div>
                )}

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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300" htmlFor="password">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
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

                <div className="flex items-center space-x-3 pt-1 pb-2">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      id="remember"
                      className="peer h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer transition-colors"
                    />
                  </div>
                  <label htmlFor="remember" className="text-sm font-medium text-slate-400 cursor-pointer select-none peer-checked:text-slate-200 transition-colors">
                    Remember me for 30 days
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-[15px] font-semibold bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-indigo-500/40 hover:-translate-y-0.5 border border-white/10"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Sign In to Workspace
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-8">
            Don't have an account? Contact your IT administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
