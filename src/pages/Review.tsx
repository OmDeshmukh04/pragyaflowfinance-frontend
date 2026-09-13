import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Download,
  History,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { Badge, EmptyState, PageHeading, Panel } from "../components/ui";
import { useDemo } from "../demo/context";

export function Approvals() {
  const { state, actor, approve } = useDemo();
  const [error, setError] = useState("");
  return (
    <>
      <PageHeading
        title="Approvals"
        description="Review proposals before any decision is accepted."
        action={<Badge tone="blue">Maker–checker review</Badge>}
      />
      <div className="notice">
        <ShieldCheck size={19} />
        <span>
          A different reviewer must approve each proposal. Switch the demo role
          in the top bar to try both sides.
        </span>
      </div>
      {!state.decisions.length ? (
        <section className="panel">
          <EmptyState
            title="No approvals waiting"
            text="Open a candidate match and submit a review proposal to explore the approval flow."
          >
            <Link className="button primary" to="/app/reconciliation">
              Review candidate matches
              <ArrowRight size={16} />
            </Link>
          </EmptyState>
        </section>
      ) : (
        <div className="approval-list">
          {state.decisions.map((item) => {
            const self = item.proposer === actor;
            const stale =
              item.state === "proposed" && item.runVersion !== state.version;
            return (
              <section className="approval-card" key={item.id}>
                <div className="approval-header">
                  <span className="table-icon">
                    <ShieldCheck size={20} />
                  </span>
                  <div>
                    <h2>
                      {item.action === "accept"
                        ? "Accept candidate"
                        : "Reject candidate"}{" "}
                      · {item.rowId}
                    </h2>
                    <p>
                      Proposed by demo {item.proposer} · Run version{" "}
                      {item.runVersion}
                    </p>
                  </div>
                  <Badge
                    tone={
                      item.state === "approved"
                        ? "green"
                        : stale
                          ? "amber"
                          : "blue"
                    }
                  >
                    {item.state === "approved"
                      ? "Approved in demo"
                      : stale
                        ? "Stale proposal"
                        : "Awaiting approval"}
                  </Badge>
                </div>
                <blockquote>{item.reason}</blockquote>
                <div className="approval-footer">
                  <Link
                    className="text-link"
                    to={`/app/reconciliation?record=${item.rowId}`}
                  >
                    View source evidence
                    <ArrowRight size={14} />
                  </Link>
                  {item.state === "proposed" && (
                    <div>
                      <span>
                        {stale
                          ? "Run changed. Submit a fresh proposal."
                          : self
                            ? "Self-approval is not allowed."
                            : actor !== "approver"
                              ? "Approver role required."
                              : "Simulation only · No server writes"}
                      </span>
                      <button
                        className="button primary"
                        disabled={self || stale || actor !== "approver"}
                        onClick={() => {
                          try {
                            approve(item.id);
                            setError("");
                          } catch (cause) {
                            setError((cause as Error).message);
                          }
                        }}
                      >
                        Approve in demo
                      </button>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}

export function Audit() {
  const { state } = useDemo();
  const [filter, setFilter] = useState("all");
  const events = state.events.filter(
    (event) => filter === "all" || event.toLowerCase().includes("review"),
  );
  return (
    <>
      <PageHeading
        title="Activity & reports"
        description="Follow import, matching and review activity."
      />
      <div className="report-card">
        <span className="report-icon">
          <Download size={22} />
        </span>
        <div>
          <h2>Reconciliation report</h2>
          <p>Transaction results, exceptions and source references.</p>
        </div>
        <Badge>Not connected</Badge>
        <button
          className="button secondary"
          disabled
          title="Server-generated exports are not implemented"
        >
          Export report
          <Download size={15} />
        </button>
      </div>
      <p className="field-help report-help">
        Exports need server authorization and complete run manifests. No
        financial statement or audit certification is implied.
      </p>
      <Panel
        title="Workspace activity"
        detail="In-memory demo history · Not a production audit log"
        action={
          <label>
            <span className="sr-only">Activity filter</span>
            <select
              aria-label="Activity filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">All activity</option>
              <option value="review">Review decisions</option>
            </select>
          </label>
        }
      >
        {events.length ? (
          <ol className="activity-timeline">
            {events.map((event, index) => (
              <li key={`${index}-${event}`}>
                <span className="activity-icon">
                  <History size={16} />
                </span>
                <div>
                  <strong>{event}</strong>
                  <span>
                    Synthetic workspace · Session event{" "}
                    {state.events.length - state.events.indexOf(event)}
                  </span>
                </div>
                <Badge>Demo</Badge>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState
            title="No review activity"
            text="Submitted proposals and approvals will appear here for this session."
          />
        )}
      </Panel>
    </>
  );
}

export function Settings() {
  const { actor, setActor, reset } = useDemo();
  const [resetting, setResetting] = useState(false);
  return (
    <>
      <PageHeading
        title="Settings"
        description="Workspace preferences and connected capabilities."
      />
      <Panel title="Workspace" detail="Local product preview">
        <div className="settings-row">
          <div>
            <strong>Workspace name</strong>
            <p>PragyaFlow · Demo workspace</p>
          </div>
          <Badge tone="blue">Synthetic</Badge>
        </div>
        <div className="settings-row">
          <div>
            <strong>Currency & locale</strong>
            <p>Indian rupee (INR) · English (India) · YYYY-MM-DD</p>
          </div>
          <LockKeyhole size={17} />
        </div>
        <div className="settings-row">
          <div>
            <strong>Demo role</strong>
            <p>
              Role switching only simulates review controls. It is not
              authentication.
            </p>
          </div>
          <select
            aria-label="Workspace demo role"
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
        </div>
      </Panel>
      <Panel
        title="Connections"
        detail="Live services remain disabled in this preview"
      >
        {[
          [
            "Database",
            "No PostgreSQL connection. Changes exist only in memory.",
          ],
          [
            "File storage & scanning",
            "Customer file uploads are not available.",
          ],
          [
            "AI assistance",
            "No model provider, API credentials or live requests.",
          ],
          [
            "Exports & integrations",
            "No accounting writes, downloads or external data transfers.",
          ],
        ].map(([title, text]) => (
          <div className="settings-row" key={title}>
            <div>
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
            <Badge>Not connected</Badge>
          </div>
        ))}
      </Panel>
      <div className="reset-card">
        <div>
          <h2>Reset sample workspace</h2>
          <p>
            Remove this session’s demo proposals and return to the original
            sample.
          </p>
        </div>
        {resetting ? (
          <div className="inline-actions">
            <button
              className="button secondary"
              onClick={() => setResetting(false)}
            >
              Cancel
            </button>
            <button
              className="button primary"
              onClick={() => {
                reset();
                setResetting(false);
              }}
            >
              Confirm sample reset
            </button>
          </div>
        ) : (
          <button
            className="button secondary"
            onClick={() => setResetting(true)}
          >
            <RotateCcw size={16} />
            Reset demo
          </button>
        )}
      </div>
    </>
  );
}
