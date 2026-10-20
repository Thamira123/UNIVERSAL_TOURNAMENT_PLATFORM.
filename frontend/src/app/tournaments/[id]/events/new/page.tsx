"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AppShell, ErrorMessage, LoadingPanel } from "@/components/app-shell";
import { api, getAccessToken, jsonBody } from "@/lib/api";

export default function NewEventPage() {
  const { id } = useParams<{ id: string }>(); const router = useRouter(); const [ready, setReady] = useState(false); const [sport, setSport] = useState("cricket"); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => { if (!getAccessToken()) router.replace("/login"); else setReady(true); }, [router]);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); setSaving(true); const values = new FormData(event.currentTarget); try { const created = await api<{ id: string }>(`/tournaments/${id}/events`, { method: "POST", body: jsonBody({ name: values.get("name"), sportKey: sport, category: values.get("category"), description: values.get("description") }) }); router.push(`/events/${created.id}`); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create event."); } finally { setSaving(false); } }
  return <AppShell title="Add an event" subtitle="Choose one of the two launch sports. Each event can have its own categories and stage structure.">{!ready ? <LoadingPanel /> : <><ErrorMessage>{error}</ErrorMessage><form className="workspace-form" onSubmit={submit}><label>Sport<select name="sportKey" value={sport} onChange={(event) => setSport(event.target.value)}><option value="cricket">Cricket</option><option value="high-jump">High Jump</option></select></label><label>Event name<input name="name" required maxLength={120} placeholder={sport === "cricket" ? "e.g. Open Cricket" : "e.g. Women's High Jump"} /></label><label>Category<select name="category" defaultValue="Open">{(sport === "cricket" ? ["Open", "Men", "Women", "Mixed", "Under 18"] : ["Open", "Men", "Women", "Under 18 Men", "Under 18 Women"]).map((category) => <option key={category}>{category}</option>)}</select></label><label>Event notes <span className="small-label">OPTIONAL</span><textarea name="description" maxLength={1000} placeholder="Rules, eligibility or other event details" /></label><div className="workspace-callout">Cricket events are configured as team competitions. High Jump events are configured as individual competitions.</div><button className="workspace-primary" disabled={saving} type="submit">{saving ? "Adding event…" : "Add event"}<span>→</span></button><Link className="auth-switch" href={`/tournaments/${id}`}>Cancel and return to tournament</Link></form></>}</AppShell>;
}
