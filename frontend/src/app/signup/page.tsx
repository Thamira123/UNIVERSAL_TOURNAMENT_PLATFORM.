"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { api, getAccessToken, getDashboardPath, jsonBody, saveAccessToken } from "@/lib/api";
import { ErrorMessage } from "@/components/app-shell";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingSport, setPendingSport] = useState("");
  useEffect(() => { const requestedSport = new URLSearchParams(window.location.search).get("createSport"); const selected = requestedSport === "cricket" || requestedSport === "high-jump" ? requestedSport : ""; setPendingSport(selected); if (getAccessToken()) void getDashboardPath(selected).then((path) => router.replace(path)); }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const values = new FormData(event.currentTarget);
    try {
      const result = await api<{ accessToken: string }>("/auth/signup", { method: "POST", body: jsonBody({ name: values.get("name"), email: values.get("email"), password: values.get("password") }) });
      saveAccessToken(result.accessToken); router.push(await getDashboardPath(pendingSport));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create the account."); }
    finally { setLoading(false); }
  }

  return <main className="auth-page"><section className="auth-story"><Link className="brand" href="/"><span className="brand-mark">U</span><span>UTMS<span className="brand-period">.</span></span></Link><div><p className="eyebrow">YOUR GAME STARTS HERE</p><h1>Find your<br /><em>place in sport.</em></h1><p>Organize tournaments, create events and manage competition stages from one profile.</p></div><span className="auth-story-foot">COMPETE · CONNECT · CELEBRATE</span></section><section className="auth-form-side"><form className="auth-form" onSubmit={submit}><p className="eyebrow">CREATE YOUR ACCOUNT</p><h2>Join UTMS.</h2><p className="auth-intro">One profile for your organizations, tournaments, and admin roles.</p><label>Full name<input name="name" autoComplete="name" required minLength={2} maxLength={80} placeholder="Your name" /></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></label><label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} required placeholder="At least 8 characters" /></label><ErrorMessage>{error}</ErrorMessage><button className="auth-submit" disabled={loading} type="submit">{loading ? "Creating account…" : "Create account"} <span>→</span></button><p className="auth-switch">Already registered? <Link href={pendingSport ? `/login?createSport=${pendingSport}` : "/login"}>Sign in</Link></p><small className="auth-privacy">Your account takes you straight to your profile. Create an organization there to start organizing tournaments.</small></form></section></main>;
}
