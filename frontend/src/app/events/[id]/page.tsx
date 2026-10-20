"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AppShell, ErrorMessage, LoadingPanel } from "@/components/app-shell";
import { api, getAccessToken, jsonBody } from "@/lib/api";

type Stage = { stage: { id: string; name: string; format: string; order: number; groupCount: number; participantsPerGroup: number; advanceCount: number }; groups: { id: string; name: string; order: number; capacity: number }[]; rounds: { id: string; name: string; order: number }[] };
type EventData = { event: { id: string; name: string; sportKey: string; category: string; description: string; status: string }; tournament: { id: string; name: string }; admins: { id: string; name: string; email: string; role: string }[]; stages: Stage[]; canManage: boolean };

export default function EventPage() {
  const { id } = useParams<{ id: string }>(); const router = useRouter();
  const [data, setData] = useState<EventData | null>(null); const [error, setError] = useState(""); const [notice, setNotice] = useState(""); const [format, setFormat] = useState("GROUP_STAGE");

  const load = useCallback(async () => {
    try {
      const event = await api<Omit<EventData, "canManage">>(`/events/${id}`);
      const tournament = await api<{ canManage: boolean }>(`/tournaments/${event.tournament.id}`);
      setData({ ...event, canManage: tournament.canManage });
      setFormat(event.event.sportKey === "high-jump" ? "QUALIFIER" : "GROUP_STAGE");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load event."); if (!getAccessToken()) router.replace("/login"); }
  }, [id, router]);
  useEffect(() => { if (!getAccessToken()) router.replace("/login"); else void load(); }, [load, router]);

  async function addStage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); const form = event.currentTarget; const values = new FormData(form);
    const body: Record<string, unknown> = { name: values.get("name"), format, order: Number(values.get("order")) };
    if (format === "GROUP_STAGE") { body.groupCount = Number(values.get("groupCount")); body.participantsPerGroup = Number(values.get("participantsPerGroup")); body.advanceCount = Number(values.get("advanceCount")); }
    try { await api(`/events/${id}/stages`, { method: "POST", body: jsonBody(body) }); form.reset(); setNotice("Stage added to the event."); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not add stage."); }
  }

  async function addRound(event: FormEvent<HTMLFormElement>, stageId: string) {
    event.preventDefault(); setError(""); const form = event.currentTarget; const values = new FormData(form);
    try { await api(`/stages/${stageId}/rounds`, { method: "POST", body: jsonBody({ name: values.get("name"), order: Number(values.get("order")) }) }); form.reset(); setNotice("Round added to the stage."); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not add round."); }
  }

  async function updateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); const values = new FormData(event.currentTarget);
    try { await api(`/events/${id}`, { method: "PATCH", body: jsonBody({ name: values.get("name"), category: values.get("category"), description: values.get("description") }) }); setNotice("Event details updated."); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update event."); }
  }

  return <AppShell title={data?.event.name ?? "Event"} subtitle={data?.event.description || "Manage event details, stage order, groups and rounds."}>
    {!data ? error ? <ErrorMessage>{error}</ErrorMessage> : <LoadingPanel /> : <>
      <div className="workspace-callout"><Link href={`/tournaments/${data.tournament.id}`}>{data.tournament.name}</Link> · Event status: {data.event.status}</div>
      <div className="event-admin-header"><div><span className="panel-kicker">EVENT · {data.event.category.toUpperCase()}</span><h2>{data.event.sportKey === "high-jump" ? "High Jump" : "Cricket"}</h2><p>Tournament admins: {data.admins.map((admin) => admin.name).join(", ") || "No tournament admins assigned"}</p></div><span className="sport-chip">{data.event.sportKey === "high-jump" ? "INDIVIDUAL" : "TEAM SPORT"}</span></div>
      {notice && <p className="create-success" role="status">{notice}</p>}<ErrorMessage>{error}</ErrorMessage>
      <div className="workspace-section-title"><div><p className="eyebrow">EVENT PROGRAMME</p><h2>Stages in order</h2></div><span className="profile-badge">{data.stages.length} STAGES</span></div>
      {data.stages.length ? <div className="stage-list">{data.stages.slice().sort((a,b) => a.stage.order - b.stage.order).map((entry) => <article className="stage-card" key={entry.stage.id}>
        <header className="stage-card-header"><span className="stage-number">{String(entry.stage.order).padStart(2,"0")}</span><div><strong>{entry.stage.name}</strong><small>{entry.stage.format.replaceAll("_"," ")}{entry.stage.groupCount ? ` · ${entry.stage.groupCount} groups · ${entry.stage.participantsPerGroup} per group · top ${entry.stage.advanceCount} advance` : ""}</small></div></header>
        <div className="stage-card-body">{entry.groups.length > 0 && <div className="group-list">{entry.groups.slice().sort((a,b)=>a.order-b.order).map((group) => <div className="group-pill" key={group.id}><strong>{group.name}</strong>Capacity {group.capacity}</div>)}</div>}{entry.rounds.length > 0 && <div className="round-list">{entry.rounds.slice().sort((a,b)=>a.order-b.order).map((round) => <span className="round-pill" key={round.id}>{String(round.order).padStart(2,"0")} · {round.name}</span>)}</div>}{data.canManage && <form className="workspace-form stage-form" onSubmit={(event) => addRound(event, entry.stage.id)}><h3>Add a round to {entry.stage.name}</h3><div className="form-two-col"><label>Round name<input name="name" required placeholder="e.g. Round 1" /></label><label>Order<input name="order" type="number" min="1" required defaultValue={entry.rounds.length + 1} /></label></div><button className="workspace-primary" type="submit">Add round <span>＋</span></button></form>}</div>
      </article>)}</div> : <div className="workspace-panel empty-organizations"><span className="empty-symbol">↘</span><h3>No stages added yet</h3><p>Add stages in sequence. Group Stage creates groups and saves each group&apos;s participant capacity.</p></div>}
      {data.canManage && <form className="workspace-form" onSubmit={addStage}><p className="eyebrow">BUILD THE EVENT FLOW</p><h3>Add a stage</h3><label>Stage name<input name="name" required maxLength={100} placeholder="e.g. Group stage" /></label><div className="form-two-col"><label>Format<select name="format" value={format} onChange={(event) => setFormat(event.target.value)}>{data.event.sportKey === "cricket" ? <><option value="GROUP_STAGE">Group Stage</option><option value="ROUND_ROBIN">Round Robin</option><option value="KNOCKOUT">Knockout</option><option value="FINAL">Final</option></> : <><option value="QUALIFIER">Qualifier</option><option value="FINAL">Final</option></>}</select></label><label>Stage order<input name="order" type="number" min="1" required defaultValue={data.stages.length + 1} /></label></div>{format === "GROUP_STAGE" && <div className="form-two-col"><label>Number of groups<input name="groupCount" type="number" min="1" max="64" required defaultValue="4" /></label><label>Participants per group<input name="participantsPerGroup" type="number" min="2" max="1000" required defaultValue="4" /></label><label>Advance from each group<input name="advanceCount" type="number" min="1" max="1000" required defaultValue="2" /></label></div>}<div className="workspace-callout">Stage order must be unique within the event. Group count and capacity are saved with the generated groups.</div><button className="workspace-primary" type="submit">Add stage <span>→</span></button></form>}
      {data.canManage && <form className="workspace-form" onSubmit={updateEvent}><p className="eyebrow">EVENT SETTINGS</p><h3>Update event details</h3><label>Event name<input name="name" required defaultValue={data.event.name} /></label><label>Category<input name="category" required defaultValue={data.event.category} /></label><label>Event notes<textarea name="description" defaultValue={data.event.description || ""} /></label><button className="workspace-primary" type="submit">Save event details <span>✓</span></button></form>}
    </>}
  </AppShell>;
}
