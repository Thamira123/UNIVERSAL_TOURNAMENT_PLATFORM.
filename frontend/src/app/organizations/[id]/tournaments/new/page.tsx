"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AppShell, ErrorMessage, LoadingPanel } from "@/components/app-shell";
import { api, getAccessToken, jsonBody } from "@/lib/api";

export default function NewTournamentPage() {
  const { id } = useParams<{ id: string }>(); const router = useRouter(); const [ready, setReady] = useState(false); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => { if (!getAccessToken()) router.replace("/login"); else setReady(true); }, [router]);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); setSaving(true); const values = new FormData(event.currentTarget); try { const tournament = await api<{ id: string }>(`/organizations/${id}/tournaments`, { method: "POST", body: jsonBody({ name: values.get("name"), description: values.get("description"), startDate: values.get("startDate") }) }); router.push(`/tournaments/${tournament.id}`); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create tournament."); } finally { setSaving(false); } }
  return <AppShell title="Create a tournament" subtitle="A tournament belongs to one organization. Add events after creating it.">{!ready ? <LoadingPanel /> : <><ErrorMessage>{error}</ErrorMessage><form className="workspace-form" onSubmit={submit}><label>Tournament name<input name="name" required maxLength={120} placeholder="e.g. Inter-Club Games 2026" /></label><label>Overview <span className="small-label">OPTIONAL</span><textarea name="description" maxLength={1000} placeholder="What should participants know?" /></label><label>Start date<input name="startDate" type="date" required /></label><div className="workspace-callout">You will be added as the tournament owner and can assign tournament admins from the tournament page.</div><button className="workspace-primary" disabled={saving} type="submit">{saving ? "Creating…" : "Create tournament"}<span>→</span></button></form></>}</AppShell>;
}
