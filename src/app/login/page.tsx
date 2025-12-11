'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const { error } = isSignUp
            ? await signUpWithEmail(email, password)
            : await signInWithEmail(email, password);

        if (error) {
            setError(error.message);
        } else if (isSignUp) {
            setSuccess('Confirmation link sent to your email.');
        } else {
            router.push('/');
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950 isolate">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 w-full max-w-[420px] transition-all duration-300 ease-in-out">
                {/* Main Card */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">

                    {/* Header Section */}
                    <div className="pt-8 pb-6 px-8 text-center bg-gradient-to-b from-white/5 to-transparent">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-blue-500/20 mb-5">
                            <div className="w-full h-full rounded-[15px] bg-slate-950 flex items-center justify-center">
                                <BrainCircuit className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
                            {isSignUp ? 'Join the Network' : 'Welcome Back'}
                        </h1>
                        <p className="text-slate-400 text-sm">
                            {isSignUp ? 'Create your neural profile' : 'Access your second brain'}
                        </p>
                    </div>

                    <div className="px-8 pb-8 space-y-6">
                        {/* Google Auth */}
                        <Button
                            onClick={signInWithGoogle}
                            variant="outline"
                            className="w-full h-12 bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20 hover:text-white text-slate-300 font-medium transition-all group"
                        >
                            <svg className="w-5 h-5 mr-3 opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                                <span className="bg-[#0f172a] px-3 text-slate-600">Or via Email</span>
                            </div>
                        </div>

                        {/* Email Form */}
                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className={cn("text-xs font-medium transition-colors", focusedInput === 'email' ? "text-blue-400" : "text-slate-400")}>Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    onFocus={() => setFocusedInput('email')}
                                    onBlur={() => setFocusedInput(null)}
                                    placeholder="you@domain.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-black/20 border-white/10 h-11 text-slate-100 placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-sans"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className={cn("text-xs font-medium transition-colors", focusedInput === 'password' ? "text-blue-400" : "text-slate-400")}>Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    onFocus={() => setFocusedInput('password')}
                                    onBlur={() => setFocusedInput(null)}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-black/20 border-white/10 h-11 text-slate-100 placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-sans"
                                    required
                                    minLength={6}
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    {success}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        {isSignUp ? <Sparkles className="w-4 h-4" /> : null}
                                        {isSignUp ? 'Create Account' : 'Sign In'}
                                    </span>
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Footer Toggle */}
                    <div className="bg-white/[0.02] border-t border-white/5 p-4 text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-slate-400 hover:text-white text-sm font-medium transition-colors w-full h-full flex items-center justify-center gap-1.5 group"
                        >
                            {isSignUp ? 'Already currently connected?' : "New to the system?"}
                            <span className="text-blue-400 group-hover:underline decoration-blue-400/50 underline-offset-4">
                                {isSignUp ? 'Sign In' : 'Create Account'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Credits / Tagline */}
                <p className="text-center text-slate-600 text-xs mt-6 tracking-wide uppercase opacity-60">
                    System Version 2.0.4 • Secure Connection
                </p>
            </div>
        </div>
    );
}
