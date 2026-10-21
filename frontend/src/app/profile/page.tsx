"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell, ErrorMessage, LoadingPanel } from "@/components/app-shell";
import { api, getAccessToken } from "@/lib/api";

type Organization = { id: string; name: string; role: string };
type Profile = { user: { name: string; email: string; createdAt?: string }; organizations: Organization[]; tournaments?: { id: string; name: string; role: string; organization?: string }[] };
type OrgFilter = "All workspaces" | "Owner" | "Admin";

const filters: OrgFilter[] = ["All workspaces", "Owner", "Admin"];

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<OrgFilter>("All workspaces");
  const [createSport, setCreateSport] = useState("");

  useEffect(() => {
    const requestedSport = new URLSearchParams(window.location.search).get("createSport");
    if (requestedSport === "cricket" || requestedSport === "high-jump") setCreateSport(requestedSport);
    if (!getAccessToken()) { router.replace(requestedSport === "cricket" || requestedSport === "high-jump" ? `/login?createSport=${requestedSport}` : "/login"); return; }
    api<Profile>("/auth/me").then(setData).catch((cause) => {
      setError(cause.message);
      if (!getAccessToken()) router.replace("/login");
    });
  }, [router]);

  const organizations = data?.organizations ?? [];
  const tournamentOrganizations = organizations.filter((organization) => ["owner", "admin"].includes(organization.role.toLowerCase()));
  const owned = organizations.filter((org) => org.role.toLowerCase() === "owner").length;
  const administered = organizations.filter((org) => org.role.toLowerCase() === "admin").length;
  const visibleOrganizations = useMemo(() => organizations.filter((org) => {
    const matchesRole = filter === "All workspaces" || org.role.toLowerCase() === filter.toLowerCase();
    return matchesRole && org.name.toLowerCase().includes(query.trim().toLowerCase());
  }), [organizations, filter, query]);

  return <AppShell title="Your profile" subtitle="Your home for the organizations and tournaments you help run.">
    {!data ? error ? <ErrorMessage>{error}</ErrorMessage> : <LoadingPanel /> : <>
      <section className="workspace-panel profile-card profile-dashboard-card">
        <div className="profile-avatar">{data.user.name.slice(0, 1).toUpperCase()}</div>
        <div className="profile-details"><span className="panel-kicker">YOUR ACCOUNT</span><h2>{data.user.name}</h2><p>{data.user.email}</p></div>
        <span className="profile-badge">PERSONAL PROFILE</span>
        <Link className="profile-account-link" href="/organizations/new">＋ <span>New organization</span></Link>
      </section>

      <section className="profile-overview" aria-label="Workspace overview">
        <div className="profile-overview-intro"><p className="eyebrow">YOUR OVERVIEW</p><h2>Ready for the <em>next match.</em></h2><p>Keep your tournament work organized from one place.</p></div>
        <div className="profile-stat"><span>WORKSPACES</span><strong>{organizations.length}</strong><small>Organizations you can access</small></div>
        <div className="profile-stat"><span>OWNER</span><strong>{owned}</strong><small>Organizations you created</small></div>
        <div className="profile-stat"><span>ADMIN</span><strong>{administered}</strong><small>Organizations you administer</small></div>
      </section>

      {createSport && <section className="workspace-panel sport-org-picker"><div><p className="eyebrow">CREATE A {createSport === "cricket" ? "CRICKET TOURNAMENT" : "HIGH JUMP COMPETITION"}</p><h2>Choose an organization</h2><p>Each tournament belongs to an organization. Your sport selection will carry into the setup form.</p></div>{tournamentOrganizations.length ? <div className="sport-org-picker-list">{tournamentOrganizations.map((organization) => <Link className="workspace-primary" href={`/organizations/${organization.id}/tournaments/new?sport=${createSport}`} key={organization.id}>{organization.name}<span>→</span></Link>)}</div> : organizations.length ? <p className="workspace-callout">You need organization owner or admin access to create a tournament. Ask an organization admin to grant access.</p> : <Link className="workspace-primary" href={`/organizations/new?sport=${createSport}`}>Create an organization <span>→</span></Link>}</section>}

      <div className="workspace-section-heading profile-org-heading">
        <div><p className="eyebrow">YOUR ORGANIZATIONS</p><h2>Where you <em>organize.</em></h2></div>
        <Link className="workspace-primary" href="/organizations/new">Create organization <span>＋</span></Link>
      </div>

      {organizations.length > 0 && <div className="profile-org-tools">
        <label className="profile-search"><span aria-hidden="true">⌕</span><input aria-label="Search organizations" placeholder="Search your organizations" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <div className="profile-filter-tabs" role="group" aria-label="Filter organizations by role">
          {filters.map((item) => <button type="button" key={item} className={filter === item ? "is-active" : ""} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
        </div>
      </div>}

      {!!data.tournaments?.length && <>
        <div className="workspace-section-heading profile-org-heading"><div><p className="eyebrow">TOURNAMENT ACCESS</p><h2>Competitions you <em>administer.</em></h2></div></div>
        <div className="organization-grid profile-organization-grid">{data.tournaments.map((tournament) => <Link className="organization-card profile-organization-card" href={`/tournaments/${tournament.id}`} key={tournament.id}><div className="profile-org-card-top"><span className="org-card-mark">T</span><span className="profile-role-pill">{tournament.role}</span></div><span className="panel-kicker">{tournament.organization || "TOURNAMENT WORKSPACE"}</span><strong>{tournament.name}</strong><small>Manage this tournament&apos;s events and stages.</small><span className="card-arrow">Open tournament <b>→</b></span></Link>)}</div>
      </>}

      {organizations.length ? visibleOrganizations.length ? <div className="organization-grid profile-organization-grid">
        {visibleOrganizations.map((organization) => <Link className="organization-card profile-organization-card" href={`/organizations/${organization.id}`} key={organization.id}>
          <div className="profile-org-card-top"><span className="org-card-mark">{organization.name.slice(0, 2).toUpperCase()}</span><span className="profile-role-pill">{organization.role}</span></div>
          <span className="panel-kicker">ORGANIZATION WORKSPACE</span><strong>{organization.name}</strong>
          <small>Manage tournaments, events, stages and your organization team.</small>
          <span className="card-arrow">Open workspace <b>↗</b></span>
        </Link>)}
      </div> : <div className="workspace-panel profile-no-results"><strong>No organizations match that search.</strong><button type="button" onClick={() => { setQuery(""); setFilter("All workspaces"); }}>Clear filters</button></div> : <div className="workspace-panel empty-organizations profile-empty">
        <span className="empty-symbol">◎</span><p className="eyebrow">YOUR FIRST WORKSPACE</p><h3>Bring your tournament together.</h3>
        <p>Create an organization to add tournaments, invite admins and build event stages for cricket or high jump.</p>
        <Link className="workspace-primary" href="/organizations/new">Create your organization <span>→</span></Link>
        <small>Already part of an organization? Ask its owner to add this email as an admin.</small>
      </div>}
    </>}
  </AppShell>;
}
