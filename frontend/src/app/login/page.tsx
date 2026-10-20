"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { api, getAccessToken, jsonBody, saveAccessToken } from "@/lib/api";
import { ErrorMessage } from "@/components/app-shell";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (getAccessToken()) router.replace("/profile"); }, [router]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const values = new FormData(event.currentTarget);
    try {
      const result = await api<{ accessToken: string }>("/auth/login", { method: "POST", body: jsonBody({ email: values.get("email"), password: values.get("password") }) });
      saveAccessToken(result.accessToken); router.push("/profile");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not sign in."); }
    finally { setLoading(false); }
  }
  return <main className="auth-page"><section className="auth-story"><Link className="brand" href="/"><span className="brand-mark">U</span><span>UTMS<span className="brand-period">.</span></span></Link><div><p className="eyebrow">WELCOME BACK</p><h1>The game<br /><em>goes on.</em></h1><p>Your organizations and tournaments are waiting in your profile.</p></div><span className="auth-story-foot">COMPETE · CONNECT · CELEBRATE</span></section><section className="auth-form-side"><form className="auth-form" onSubmit={submit}><p className="eyebrow">SIGN IN</p><h2>Good to see you.</h2><p className="auth-intro">Sign in to continue to your profile.</p><label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><ErrorMessage>{error}</ErrorMessage><button className="auth-submit" disabled={loading} type="submit">{loading ? "Signing in…" : "Sign in"} <span>→</span></button><p className="auth-switch">New to UTMS? <Link href="/signup">Create an account</Link></p></form></section></main>;
}
