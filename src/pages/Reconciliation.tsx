import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Filter,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useDemo } from "../demo/context";
import { type DemoRow } from "../demo/model";
import { difference, formatAmount } from "../lib/money";
import { Badge, Drawer, EmptyState, PageHeading } from "../components/ui";

const labels = {
  matched: "Matched",
  review: "Needs review",
  unmatched: "Unmatched",
} as const;
function Evidence({ row, close }: { row: DemoRow; close: () => void }) {
  const { state, propose } = useDemo();
  const [reason, setReason] = useState("");
  const [action, setAction] = useState<"accept" | "reject">(
    row.status === "matched" ? "accept" : "reject",
  );
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const existing = state.decisions.find(
    (item) =>
      item.rowId === row.id &&
      (item.state === "approved" || item.runVersion === state.version),
  );
  return (
    <Drawer title={row.id} close={close}>
      <div className="evidence-intro">
        <Badge tone={row.status === "matched" ? "green" : "amber"}>
          {labels[row.status]}
        </Badge>
        <h3>{row.entity}</h3>
        <p>
          {row.reason} · {row.date} · INR
        </p>
      </div>
      <div className="comparison">
        <div>
          <span>Bank statement</span>
          <strong>{formatAmount(row.bank)}</strong>
        </div>
        <div>
          <span>General ledger</span>
          <strong>{formatAmount(row.ledger)}</strong>
        </div>
      </div>
      <div className="difference-row">
        <span>Bank − ledger</span>
        <strong>
          {row.bank !== null && row.ledger !== null
            ? formatAmount(difference(row.bank, row.ledger))
            : "Counterpart missing"}
        </strong>
      </div>
      <section className="evidence-section">
        <h3>Source records</h3>
        {(["bank", "ledger"] as const).map((side) => (
          <div className="source-record" key={side}>
            <div>
              <FileText size={16} />
              <strong>
                {side === "bank"
                  ? "bank-september.csv"
                  : "ledger-september.csv"}
              </strong>
              <span>
                {row[`${side}Row`] ? `Row ${row[`${side}Row`]}` : "Not found"}
              </span>
            </div>
            {row[side] !== null && (
              <dl>
                <dt>Reference</dt>
                <dd>{row.id}</dd>
                <dt>Raw amount</dt>
                <dd>
                  <code>{row[side]}</code>
                </dd>
                <dt>Transaction date</dt>
                <dd>{row.date}</dd>
                <dt>Currency</dt>
                <dd>INR</dd>
              </dl>
            )}
          </div>
        ))}
      </section>
      <section className="evidence-section">
        <h3>Matching rule</h3>
        <div className="rule-note">
          <ShieldCheck size={18} />
          <div>
            <strong>Exact reference and signed amount</strong>
            <p>Same currency · Same transaction date · Zero tolerance</p>
            <small>Sample rule v1 · Run version {state.version}</small>
          </div>
        </div>
      </section>
      <section className="evidence-section">
        <h3>Review decision</h3>
        {submitted || existing ? (
          <div className="notice success" role="status">
            {existing?.state === "approved"
              ? "Decision approved in this demo."
              : "Demo proposal saved for a different reviewer."}
            <Link to="/app/approvals" onClick={close}>
              Open approvals <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              try {
                propose(row.id, action, reason);
                setSubmitted(true);
                setError("");
              } catch (cause) {
                setError((cause as Error).message);
              }
            }}
          >
            <label>
              Decision
              <select
                value={action}
                onChange={(event) =>
                  setAction(event.target.value as "accept" | "reject")
                }
              >
                <option value="accept" disabled={row.status !== "matched"}>
                  Accept exact candidate
                </option>
                <option value="reject">Reject candidate</option>
              </select>
            </label>
            {row.status !== "matched" && (
              <p className="field-help">
                Differences cannot be accepted here. Manual adjustments are not
                available.
              </p>
            )}
            <label>
              Review reason
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Add the evidence behind your decision"
                required
                minLength={5}
                maxLength={1000}
                rows={3}
              />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button primary wide" type="submit">
              Submit demo proposal
              <ArrowRight size={15} />
            </button>
            <p className="field-help">
              Simulation only. No balance changes or server writes.
            </p>
          </form>
        )}
      </section>
    </Drawer>
  );
}

export default function Reconciliation({
  exceptionsOnly = false,
}: {
  exceptionsOnly?: boolean;
}) {
  const { state } = useDemo();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  useEffect(() => {
    setQuery("");
    setFilter("all");
    setPage(0);
  }, [exceptionsOnly]);
  const selected = state.rows.find((row) => row.id === params.get("record"));
  const base = state.rows.filter(
    (row) => !exceptionsOnly || row.status !== "matched",
  );
  const rows = base.filter(
    (row) =>
      (filter === "all" || row.status === filter) &&
      `${row.id} ${row.entity} ${row.reason}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(rows.length / 8));
  const visible = rows.slice(page * 8, page * 8 + 8);
  return (
    <>
      <PageHeading
        eyebrow="BANK VS. GENERAL LEDGER"
        title={exceptionsOnly ? "Exceptions" : "Reconciliation"}
        description={
          exceptionsOnly
            ? "Review differences and missing records."
            : "Compare source records and inspect every match."
        }
        action={
          <Link to="/app/workflows" className="button secondary">
            <Filter size={15} />
            Workflow rules
          </Link>
        }
      />
      <div className="run-context">
        <div>
          <span className="live-dot" />
          <strong>Sample run PF-SEP-001</strong>
          <span>1–12 Sep 2026</span>
          <span>INR</span>
        </div>
        <Badge tone="blue">Candidate results</Badge>
      </div>
      <div className="results-panel">
        <div className="result-tabs" aria-label="Filter results">
          {[
            ["all", exceptionsOnly ? "All exceptions" : "All results"],
            ...(!exceptionsOnly ? [["matched", "Matched"]] : []),
            ["review", "Needs review"],
            ["unmatched", "Unmatched"],
          ].map(([value, label]) => (
            <button
              key={value}
              aria-pressed={filter === value}
              className={filter === value ? "selected" : ""}
              onClick={() => {
                setFilter(value);
                setPage(0);
              }}
            >
              {label}
              <span>
                {value === "all"
                  ? base.length
                  : base.filter((row) => row.status === value).length}
              </span>
            </button>
          ))}
        </div>
        <div className="table-toolbar">
          <label className="search-input">
            <Search size={17} />
            <input
              aria-label="Search transactions"
              placeholder="Search reference or business…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
            />
          </label>
          <span>
            {rows.length} result{rows.length !== 1 && "s"}
            <span className="desktop-only"> · Sample data</span>
          </span>
        </div>
        {visible.length ? (
          <div className="table-scroll">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Reference / Business</th>
                  <th>Date</th>
                  <th className="numeric">Bank amount</th>
                  <th className="numeric">Ledger amount</th>
                  <th className="numeric">Difference</th>
                  <th>Status</th>
                  <th>
                    <span className="sr-only">Evidence</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <button
                        className="row-link"
                        onClick={() => setParams({ record: row.id })}
                      >
                        {row.id}
                        <small>{row.entity}</small>
                      </button>
                    </td>
                    <td>{row.date.slice(8)} Sep 2026</td>
                    <td className="numeric">{formatAmount(row.bank)}</td>
                    <td className="numeric">{formatAmount(row.ledger)}</td>
                    <td
                      className={`numeric ${row.status === "review" ? "amount-warning" : "subtle"}`}
                    >
                      {row.bank !== null && row.ledger !== null
                        ? formatAmount(difference(row.bank, row.ledger))
                        : "—"}
                    </td>
                    <td>
                      <Badge
                        tone={
                          row.status === "matched"
                            ? "green"
                            : row.status === "review"
                              ? "amber"
                              : "neutral"
                        }
                      >
                        {labels[row.status]}
                      </Badge>
                    </td>
                    <td>
                      <button
                        className="icon-button"
                        aria-label={`View evidence for ${row.id}`}
                        onClick={() => setParams({ record: row.id })}
                      >
                        <ArrowRight size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No matching records"
            text="Try another reference, business name or status."
          >
            <button
              className="button secondary"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
            >
              Clear filters
            </button>
          </EmptyState>
        )}
        <div className="pagination">
          <span>
            {rows.length
              ? `${page * 8 + 1}–${Math.min((page + 1) * 8, rows.length)} of ${rows.length} comparisons`
              : "0 comparisons"}
            <small>Counts apply to this filtered view.</small>
          </span>
          <div>
            <button
              className="icon-button"
              aria-label="Previous page"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <ArrowLeft size={16} />
            </button>
            <span>
              {page + 1} / {totalPages}
            </span>
            <button
              className="icon-button"
              aria-label="Next page"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="page-note">
        <ShieldCheck size={15} />
        Candidate matches are not accepted allocations. Source amounts remain
        unchanged.
      </div>
      {selected && (
        <Evidence
          key={selected.id}
          row={selected}
          close={() => setParams({})}
        />
      )}
    </>
  );
}
