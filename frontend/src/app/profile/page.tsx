"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell, ErrorMessage, LoadingPanel } from "@/components/app-shell";
import { api, getAccessToken } from "@/lib/api";

type Organization = { id: string; name: string; role: string };
type Profile = { user: { name: string; email: string; createdAt?: string }; organizations: Organization[] };
type OrgFilter = "All workspaces" | "Owner" | "Admin";

const filters: OrgFilter[] = ["All workspaces", "Owner", "Admin"];

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<OrgFilter>("All workspaces");

  useEffect(() => {
    if (!getAccessToken()) { router.replace("/login"); return; }
    api<Profile>("/auth/me").then(setData).catch((cause) => {
      setError(cause.message);
      if (!getAccessToken()) router.replace("/login");
    });
  }, [router]);

  const organizations = data?.organizations ?? [];
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
