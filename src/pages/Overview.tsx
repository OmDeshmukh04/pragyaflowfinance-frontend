import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleAlert,
  FileStack,
  GitBranch,
  Plus,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDemo } from "../demo/context";
import { summary } from "../demo/model";
import { formatAmount } from "../lib/money";
import { ArrowLink, Badge, PageHeading, Panel } from "../components/ui";

export default function Overview() {
  const { state } = useDemo();
  const counts = summary(state.rows);
  const exceptions = state.rows.filter((row) => row.status !== "matched");
  const pending = state.decisions.filter(
    (item) => item.state === "proposed",
  ).length;
  return (
    <>
      <PageHeading
        title="Overview"
        description="Your reconciliation work, in one place."
        action={
          <>
            <span className="date-chip">
              <CalendarDays size={16} />
              1–12 Sep 2026
            </span>
            <Link className="button primary" to="/app/new-reconciliation">
              <Plus size={16} />
              New reconciliation
            </Link>
          </>
        }
      />
      <section className="run-banner">
        <div className="banner-copy">
          <div className="eyebrow">
            <span className="live-dot" />
            CURRENT SAMPLE RUN
          </div>
          <h2>
            Bank statement <span>↔</span> General ledger
          </h2>
          <p>
            September 2026 <span>·</span> INR <span>·</span> Workflow revision 1
          </p>
        </div>
        <div className="banner-progress">
          <span>
            <strong>{counts.matched}</strong> of {counts.total} records matched
          </span>
          <div className="banner-meter">
            <i style={{ width: `${(counts.matched / counts.total) * 100}%` }} />
          </div>
          <span className="banner-caption">
            Candidate matches · No balances posted
          </span>
        </div>
        <Link className="button white" to="/app/reconciliation">
          Open reconciliation
          <ArrowRight size={16} />
        </Link>
      </section>
      <div className="metrics">
        {[
          {
            label: "Imported records",
            value: counts.total,
            detail: `${counts.bank} bank · ${counts.ledger} ledger`,
            Icon: FileStack,
            tone: "blue",
          },
          {
            label: "Matched records",
            value: counts.matched,
            detail: `${counts.matched / 2} exact pairs`,
            Icon: ScanLine,
            tone: "teal",
          },
          {
            label: "Open exceptions",
            value: exceptions.length,
            detail: `${counts.review + counts.unmatched} records need review`,
            Icon: CircleAlert,
            tone: "amber",
          },
          {
            label: "Pending approvals",
            value: pending,
            detail: pending
              ? "Ready for another reviewer"
              : "No proposals waiting",
            Icon: ShieldCheck,
            tone: "violet",
          },
        ].map(({ label, value, detail, Icon, tone }) => (
          <section className="metric" key={label}>
            <div>
              <span>{label}</span>
              <span className={`metric-icon ${tone}`}>
                <Icon size={18} />
              </span>
            </div>
            <strong>{value}</strong>
            <small>{detail}</small>
          </section>
        ))}
      </div>
      <div className="overview-grid">
        <Panel
          title="Reconciliation status"
          detail="All 20 source records · 1–12 Sep 2026 · Sample data"
          action={<Badge tone="blue">Current run</Badge>}
        >
          <div className="status-visual">
            <div
              className="status-ring"
              role="img"
              aria-label="16 matched records, 2 records with differences and 2 unmatched records"
            >
              <div>
                <strong>
                  80<span>%</span>
                </strong>
                <span>matched records</span>
              </div>
            </div>
            <div className="status-breakdown">
              {[
                ["matched", "Matched", counts.matched, "8 exact pairs"],
                [
                  "review",
                  "Needs review",
                  counts.review,
                  "1 amount difference",
                ],
                [
                  "unmatched",
                  "Unmatched",
                  counts.unmatched,
                  "2 missing counterparts",
                ],
              ].map(([tone, label, count, detail]) => (
                <div key={tone}>
                  <span className={`legend-dot ${tone}`} />
                  <div>
                    <strong>{label}</strong>
                    <span>{detail}</span>
                  </div>
                  <b>{count}</b>
                </div>
              ))}
            </div>
          </div>
          <div className="source-balances">
            <div>
              <span>Bank statement · {counts.bank} records</span>
              <strong>{formatAmount(counts.bankAmount)}</strong>
            </div>
            <div>
              <span>General ledger · {counts.ledger} records</span>
              <strong>{formatAmount(counts.ledgerAmount)}</strong>
            </div>
          </div>
        </Panel>
        <Panel
          title="Needs attention"
          detail="Open items in this sample run"
          action={<span className="count-chip">{exceptions.length}</span>}
        >
          <div className="attention-list">
            {exceptions.map((row, index) => (
              <Link
                key={row.id}
                to={`/app/exceptions?record=${row.id}`}
                className="attention-item"
              >
                <span
                  className={`attention-icon ${index === 0 ? "amber" : "blue"}`}
                >
                  <CircleAlert size={17} />
                </span>
                <div>
                  <strong>{row.reason}</strong>
                  <span>
                    {row.id} · {row.entity}
                  </span>
                </div>
                <ArrowRight size={15} />
              </Link>
            ))}
          </div>
          <div className="panel-bottom">
            <ArrowLink to="/app/exceptions">Review exceptions</ArrowLink>
          </div>
        </Panel>
      </div>
      <Panel
        title="Workflows"
        detail="Reusable matching rules for your source files"
        action={<ArrowLink to="/app/workflows">Manage workflows</ArrowLink>}
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Workflow</th>
                <th>Sources</th>
                <th>Period</th>
                <th>Status</th>
                <th className="numeric">Records</th>
                <th>
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Link className="workflow-name" to="/app/reconciliation">
                    <span className="table-icon">
                      <GitBranch size={17} />
                    </span>
                    <span>
                      Bank vs. general ledger
                      <small>Exact reference & amount · INR</small>
                    </span>
                  </Link>
                </td>
                <td>
                  <span className="source-tags">
                    <span>B</span>
                    <span>L</span>2 files
                  </span>
                </td>
                <td>Sep 2026</td>
                <td>
                  <Badge tone="green">Sample ready</Badge>
                </td>
                <td className="numeric">20</td>
                <td>
                  <Link
                    className="icon-link"
                    to="/app/reconciliation"
                    aria-label="Open bank reconciliation"
                  >
                    <ArrowRight size={17} />
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="overview-bottom">
        <div>
          <Check size={15} />
          <span>
            Every sample record retains its source file and row number.
          </span>
        </div>
        <Link to="/app/audit">
          View activity
          <ArrowRight size={14} />
        </Link>
      </div>
    </>
  );
}
