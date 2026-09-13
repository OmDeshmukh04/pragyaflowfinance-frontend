import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCheck,
  FileSpreadsheet,
  GitBranch,
  Layers3,
  LockKeyhole,
  Plus,
  UploadCloud,
} from "lucide-react";
import { Badge, Drawer, PageHeading, Panel } from "../components/ui";
import { useDemo } from "../demo/context";
import { formatAmount } from "../lib/money";

export function Imports() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { state } = useDemo();
  return (
    <>
      <PageHeading
        title="Sources & imports"
        description="Keep your source files and import status together."
        action={
          <button
            className="button primary"
            onClick={() => {
              setOpen(true);
              setLoaded(false);
            }}
          >
            <Plus size={16} />
            New import
          </button>
        }
      />
      <div className="source-grid">
        {[
          {
            title: "Bank statement",
            short: "B",
            file: "bank-september.csv",
            kind: "Bank account",
            color: "blue",
          },
          {
            title: "General ledger",
            short: "L",
            file: "ledger-september.csv",
            kind: "Accounting ledger",
            color: "teal",
          },
        ].map((source) => (
          <section className="source-card" key={source.title}>
            <div className="source-card-head">
              <span className={`source-symbol ${source.color}`}>
                {source.short}
              </span>
              <Badge tone="green">Sample ready</Badge>
            </div>
            <h2>{source.title}</h2>
            <p>{source.kind} · INR</p>
            <div className="source-file">
              <FileSpreadsheet size={17} />
              <span>{source.file}</span>
            </div>
            <dl className="source-meta">
              <div>
                <dt>Records</dt>
                <dd>10</dd>
              </div>
              <div>
                <dt>Invalid rows</dt>
                <dd>0</dd>
              </div>
              <div>
                <dt>Source profile</dt>
                <dd>v1 · en-IN</dd>
              </div>
            </dl>
            <Link className="text-link" to="/app/mapping">
              Review field mapping
              <ArrowRight size={15} />
            </Link>
          </section>
        ))}
      </div>
      <Panel
        title="Import history"
        detail="Preloaded synthetic files · September 2026"
      >
        <div
          className="table-scroll"
          role="region"
          aria-label="Import history table"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>Source</th>
                <th>Status</th>
                <th className="numeric">Rows</th>
                <th>Period</th>
              </tr>
            </thead>
            <tbody>
              {["Bank statement", "General ledger"].map((source, index) => (
                <tr key={source}>
                  <td>
                    <div className="file-cell">
                      <FileSpreadsheet size={18} />
                      <strong>{index ? "ledger" : "bank"}-september.csv</strong>
                    </div>
                  </td>
                  <td>{source}</td>
                  <td>
                    <Badge tone="green">Sample parsed</Badge>
                  </td>
                  <td className="numeric">10 / 10</td>
                  <td>1–12 Sep 2026</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="capability-note">
        <LockKeyhole size={19} />
        <div>
          <strong>Live imports are not connected</strong>
          <p>
            CSV and XLSX upload, scanning and parsing will use the backend after
            database setup. Please do not use customer files in this preview.
          </p>
        </div>
      </div>
      {open && (
        <Drawer title="New sample import" close={() => setOpen(false)}>
          <div className="import-dropzone">
            <UploadCloud size={35} />
            <h3>
              {loaded ? "Sample files prepared" : "Explore with sample files"}
            </h3>
            <p>
              Bank statement + general ledger
              <br />
              20 synthetic records · INR
            </p>
            <button
              className="button primary"
              onClick={() => setLoaded(true)}
              disabled={loaded}
            >
              {loaded ? (
                <>
                  <Check size={16} />
                  Sample loaded
                </>
              ) : (
                "Load sample files"
              )}
            </button>
          </div>
          {loaded && (
            <>
              <div className="notice success" role="status">
                Local demonstration only. No files uploaded or parsed by the
                backend.
              </div>
              <div className="mini-preview">
                <h3>Source preview</h3>
                {state.rows.slice(0, 3).map((row) => (
                  <div key={row.id}>
                    <span>{row.id}</span>
                    <strong>{formatAmount(row.bank)}</strong>
                  </div>
                ))}
              </div>
              <Link to="/app/mapping" className="button primary wide">
                Continue to field mapping
                <ArrowRight size={16} />
              </Link>
            </>
          )}
          <p className="field-help">
            Real file selection remains disabled until storage, scanning and
            import validation are connected.
          </p>
        </Drawer>
      )}
    </>
  );
}

const columns = ["reference", "transaction_date", "amount", "currency"];
const mappingFields = [
  { label: "Transaction reference", sample: "TX-1001" },
  { label: "Transaction date", sample: "2026-09-01" },
  { label: "Signed amount", sample: "24800.00" },
  { label: "Currency", sample: "INR" },
];
export function Mapping() {
  const [source, setSource] = useState("Bank statement");
  const [mapping, setMapping] = useState([...columns]);
  const [validated, setValidated] = useState(false);
  const valid = mapping.every((column, index) => column === columns[index]);
  return (
    <>
      <PageHeading
        title="Field mapping"
        description="Connect source columns to the fields used for matching."
        action={<Badge tone="neutral">Sample mapping · v1</Badge>}
      />
      <div className="mapping-top">
        <label>
          Source
          <select
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              setValidated(false);
            }}
          >
            <option>Bank statement</option>
            <option>General ledger</option>
          </select>
        </label>
        <div>
          <span>Locale</span>
          <strong>English (India)</strong>
        </div>
        <div>
          <span>Date format</span>
          <strong>YYYY-MM-DD</strong>
        </div>
        <div>
          <span>Amount convention</span>
          <strong>Signed credits / debits</strong>
        </div>
      </div>
      <Panel
        title="Map required fields"
        detail="Original source values are preserved. AI suggestions are not enabled."
      >
        <div className="mapping-columns">
          <span>SOURCE COLUMN</span>
          <span />
          <span>CANONICAL FIELD</span>
          <span>SAMPLE OUTPUT</span>
        </div>
        {mappingFields.map((field, index) => (
          <div className="mapping-row" key={field.label}>
            <label>
              <span className="sr-only">Source column for {field.label}</span>
              <select
                aria-label={`Source column for ${field.label}`}
                value={mapping[index]}
                onChange={(event) => {
                  setMapping((current) =>
                    current.map((value, i) =>
                      i === index ? event.target.value : value,
                    ),
                  );
                  setValidated(false);
                }}
              >
                <option value="">Select column</option>
                {columns.map((column) => (
                  <option key={column}>{column}</option>
                ))}
              </select>
            </label>
            <ArrowRight size={17} className="mapping-arrow" />
            <div>
              <strong>{field.label}</strong>
              <span className="field-required">Required</span>
            </div>
            <code
              className={
                mapping[index] !== columns[index] ? "invalid-value" : ""
              }
            >
              {mapping[index] === columns[index]
                ? field.sample
                : "Invalid mapping"}
            </code>
          </div>
        ))}
        <div className="mapping-actions">
          <span>
            {!valid ? (
              <span className="form-error" role="alert">
                Check the source columns. Critical fields must match their
                sample types.
              </span>
            ) : validated ? (
              <span className="validation-ok" role="status">
                <CheckCheck size={17} />
                Sample mapping validated · 10 valid rows
              </span>
            ) : (
              "4 required fields · 0 optional transformations"
            )}
          </span>
          <button
            className="button primary"
            disabled={!valid}
            onClick={() => setValidated(true)}
          >
            <Check size={16} />
            Validate sample
          </button>
        </div>
      </Panel>
      {validated && (
        <Panel
          title="Normalized preview"
          detail={`${source} · Synthetic output · No backend normalization executed`}
          action={
            <Link to="/app/workflows" className="button secondary">
              Continue to workflow
              <ArrowRight size={15} />
            </Link>
          }
        >
          <div
            className="table-scroll"
            role="region"
            aria-label="Normalized source preview"
            tabIndex={0}
          >
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Transaction date</th>
                  <th className="numeric">Signed amount</th>
                  <th>Currency</th>
                  <th>Source row</th>
                </tr>
              </thead>
              <tbody>
                {["TX-1001", "TX-1002", "TX-1003"].map((id, index) => (
                  <tr key={id}>
                    <td className="mono">{id}</td>
                    <td>2026-09-0{index + 1}</td>
                    <td className="numeric">
                      {["24800.00", "18450.00", "12600.00"][index]}
                    </td>
                    <td>INR</td>
                    <td>{index + 2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      <div className="capability-note">
        <ShieldIcon />
        <div>
          <strong>Approval follows a validated preview</strong>
          <p>
            Live mapping approval and version history will be connected to the
            backend. This preview never approves a mapping on the server.
          </p>
        </div>
      </div>
    </>
  );
}
function ShieldIcon() {
  return <LockKeyhole size={19} />;
}

export function Workflows() {
  const [step, setStep] = useState(0);
  const steps = ["Source files", "Matching rules", "Preview"];
  return (
    <>
      <PageHeading
        title="Workflows"
        description="Set up repeatable reconciliation for each pair of sources."
        action={<Badge tone="blue">1 sample workflow</Badge>}
      />
      <section className="workflow-summary">
        <span className="workflow-large-icon">
          <GitBranch size={25} />
        </span>
        <div>
          <h2>Bank vs. general ledger</h2>
          <p>Two-source reconciliation · INR · Revision 1</p>
        </div>
        <Badge tone="green">Sample ready</Badge>
      </section>
      <nav className="stepper" aria-label="Workflow setup">
        {steps.map((label, index) => (
          <button
            key={label}
            className={step === index ? "active" : step > index ? "done" : ""}
            onClick={() => setStep(index)}
            aria-current={step === index ? "step" : undefined}
          >
            <span>{step > index ? <Check size={15} /> : index + 1}</span>
            {label}
          </button>
        ))}
      </nav>
      {step === 0 && (
        <Panel
          title="Choose source files"
          detail="Both samples use the same currency and date convention."
        >
          <div className="workflow-source-grid">
            {["Bank statement", "General ledger"].map((source, index) => (
              <div className="workflow-source" key={source}>
                <span className="eyebrow">SIDE {index ? "B" : "A"}</span>
                <FileSpreadsheet size={26} />
                <h3>{source}</h3>
                <p>10 records · 1–12 Sep 2026 · INR</p>
                <Badge tone="green">Sample mapping v1</Badge>
              </div>
            ))}
          </div>
          <div className="form-footer">
            <p>
              Source files must be different and use their own approved mapping.
            </p>
            <button className="button primary" onClick={() => setStep(1)}>
              Continue
              <ArrowRight size={16} />
            </button>
          </div>
        </Panel>
      )}
      {step === 1 && (
        <Panel
          title="Matching rules"
          detail="A fixed, deterministic policy for this sample workflow."
        >
          <div className="rule-header">
            <span className="count-chip">01</span>
            <div>
              <h3>Exact reference and amount</h3>
              <p>Match only when all required values agree.</p>
            </div>
            <Badge tone="green">Enabled</Badge>
          </div>
          <div className="rule-grid">
            {[
              ["Reference", "Transaction reference"],
              ["Amount", "Signed amount · Exact"],
              ["Currency", "Same currency · INR"],
              ["Date", "Transaction date · Same day"],
              ["Tolerance", "₹0.00"],
              ["Grouping", "One-to-one only"],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="notice">
            <Layers3 size={17} />
            Competing candidates stay open for review. No amount-only matching.
          </div>
          <div className="form-footer">
            <p>Custom rules and approval require backend integration.</p>
            <button className="button primary" onClick={() => setStep(2)}>
              Preview sample
              <ArrowRight size={16} />
            </button>
          </div>
        </Panel>
      )}
      {step === 2 && (
        <Panel
          title="Sample preview"
          detail="Precomputed fixture results. No reconciliation engine has run in your browser."
        >
          <div className="preview-counts">
            <div>
              <strong>20</strong>
              <span>Source records</span>
            </div>
            <div>
              <strong>8</strong>
              <span>Exact candidate pairs</span>
            </div>
            <div>
              <strong>3</strong>
              <span>Open exception items</span>
            </div>
          </div>
          <div className="notice success">
            <CheckCheck size={18} />
            All 20 sample records are accounted for across both sources.
          </div>
          <div className="form-footer">
            <p>
              Production runs remain unavailable until the database is
              connected.
            </p>
            <Link className="button primary" to="/app/reconciliation">
              Open sample results
              <ArrowRight size={16} />
            </Link>
          </div>
        </Panel>
      )}
    </>
  );
}
