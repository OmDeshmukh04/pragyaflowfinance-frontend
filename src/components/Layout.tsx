import { useEffect, useState } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  CircleHelp,
  FileInput,
  GitBranch,
  LayoutDashboard,
  ListFilter,
  Menu,
  PanelLeftClose,
  Plus,
  ScanLine,
  Settings2,
  ShieldCheck,
  X,
} from "lucide-react";
import { Brand } from "./ui";
import { useDemo } from "../demo/context";

const navigation = [
  ["overview", "Overview", LayoutDashboard],
  ["imports", "Sources & imports", FileInput],
  ["mapping", "Field mapping", ListFilter],
  ["workflows", "Workflows", GitBranch],
  ["reconciliation", "Reconciliation", ScanLine],
  ["exceptions", "Exceptions", CircleHelp],
  ["approvals", "Approvals", ShieldCheck],
  ["audit", "Activity & reports", BookOpen],
] as const;

export default function Layout() {
  const { state, actor, setActor } = useDemo();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobile, setMobile] = useState(
    () => window.matchMedia("(max-width: 640px)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const sync = () => {
      setMobile(query.matches);
      setMobileOpen(false);
    };
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  const location = useLocation();
  const current =
    (location.pathname.endsWith("/new-reconciliation")
      ? "New reconciliation"
      : navigation.find(([path]) => location.pathname.endsWith(path))?.[1]) ??
    "Settings";
  useEffect(() => {
    document.title = `${current} — PragyaFlow Finance`;
  }, [current]);
  const pending = state.decisions.filter(
    (item) => item.state === "proposed",
  ).length;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to workspace
      </a>
      {mobileOpen && (
        <button
          className="nav-scrim"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <aside
        className={`sidebar ${mobileOpen ? "is-open" : ""}`}
        aria-label="Workspace navigation"
        inert={mobile && !mobileOpen}
        onKeyDown={(event) => {
          if (event.key === "Escape") setMobileOpen(false);
        }}
      >
        <div className="sidebar-brand">
          <Brand compact />
          <button
            className="icon-button mobile-only"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="workspace-switch">
          <span className="workspace-avatar">P</span>
          <div>
            <strong>PragyaFlow</strong>
            <span>Demo workspace</span>
          </div>
          <ChevronRight size={14} />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <Link
          className="button primary sidebar-create"
          to="/app/new-reconciliation"
          onClick={() => setMobileOpen(false)}
        >
          <Plus size={15} />
          New reconciliation
        </Link>
        <nav>
          {navigation.map(([path, label, Icon]) => (
            <NavLink
              key={path}
              to={`/app/${path}`}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <Icon size={18} strokeWidth={1.7} />
              <span>{label}</span>
              {path === "exceptions" && (
                <span className="nav-count">
                  {state.rows.filter((row) => row.status !== "matched").length}
                </span>
              )}
              {path === "approvals" && pending > 0 && (
                <span className="nav-count">{pending}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <NavLink
            to="/app/settings"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <Settings2 size={18} />
            <span>Settings</span>
          </NavLink>
          <div className="sandbox-card">
            <span className="demo-dot" />
            <strong>Product preview</strong>
            <p>Sample records. No live accounts.</p>
            <Link to="/#walkthrough">
              View walkthrough <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="sidebar-foot">
            <span>PragyaFlow Finance</span>
            <PanelLeftClose size={15} aria-hidden="true" />
          </div>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-only"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{current}</strong>
          </div>
          <div className="top-actions">
            <span className="demo-pill">
              <span />
              Demo mode
            </span>
            <label className="actor-select">
              <span className="sr-only">Demo role</span>
              <select
                aria-label="Demo role"
                value={actor}
                onChange={(event) =>
                  setActor(
                    event.target.value === "approver" ? "approver" : "operator",
                  )
                }
              >
                <option value="operator">Demo operator</option>
                <option value="approver">Demo approver</option>
              </select>
            </label>
            <span className="avatar" aria-hidden="true">
              {actor === "operator" ? "OP" : "AP"}
            </span>
          </div>
        </header>
        <main id="main-content" className="workspace-content" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="workspace-footer">
          <span>
            <span className="demo-dot" />
            Synthetic sample data · Changes reset on refresh
          </span>
          <span>Database not connected</span>
        </footer>
      </div>
    </div>
  );
}
