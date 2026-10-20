"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AppShell, ErrorMessage, LoadingPanel } from "@/components/app-shell";
import { api, getAccessToken, jsonBody } from "@/lib/api";

export default function NewOrganizationPage() {
  const router = useRouter(); const [ready, setReady] = useState(false); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => { if (!getAccessToken()) router.replace("/login"); else setReady(true); }, [router]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSaving(true); const values = new FormData(event.currentTarget);
    try { const organization = await api<{ id: string }>("/organizations", { method: "POST", body: jsonBody({ name: values.get("name"), description: values.get("description") }) }); router.push(`/organizations/${organization.id}`); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create organization."); }
    finally { setSaving(false); }
  }
  return <AppShell title="Create an organization" subtitle="Organizations own tournaments and manage the people who can run them.">{!ready ? <LoadingPanel /> : <><p className="workspace-error"><ErrorMessage>{error}</ErrorMessage></p><form className="workspace-form" onSubmit={submit}><label>Organization name<input name="name" required minLength={2} maxLength={100} placeholder="e.g. Northshore Sports Club" /></label><label>About your organization <span className="small-label">OPTIONAL</span><textarea name="description" maxLength={500} placeholder="What does your organization do?" /></label><div className="workspace-callout">Your account will become the organization owner. You can add other organization admins after creation.</div><button className="workspace-primary" disabled={saving} type="submit">{saving ? "Creating…" : "Create organization"}<span>→</span></button><Link className="auth-switch" href="/profile">Cancel and return to profile</Link></form></>}</AppShell>;
}
