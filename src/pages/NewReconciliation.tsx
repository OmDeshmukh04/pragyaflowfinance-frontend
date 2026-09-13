import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileSpreadsheet,
  GitCompareArrows,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { Badge, PageHeading, Panel } from "../components/ui";
import { summary } from "../demo/model";
import { useDemo } from "../demo/context";
import { formatAmount } from "../lib/money";

const fields = ["reference", "transaction_date", "amount", "currency"];
const stages = [
  "Checking source fields",
  "Previewing matching policy",
  "Preparing sample dashboard",
];

export default function NewReconciliation() {
  const { state } = useDemo();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState([false, false]);
  const [mapping, setMapping] = useState([...fields, ...fields]);
  const [stage, setStage] = useState(-1);
  const counts = summary(state.rows);
  const valid = mapping.every((field, index) => field === fields[index % 4]);
  useEffect(() => {
    if (stage < 0) return;
    const timer = window.setTimeout(() => {
      if (stage === stages.length - 1) {
        setStage(-1);
        setStep(3);
      } else setStage(stage + 1);
    }, 850);
    return () => window.clearTimeout(timer);
  }, [stage]);
  return (
    <>
      <PageHeading
        title="New reconciliation"
        description="From source files to a clear results dashboard."
        action={<Badge tone="blue">Interactive sample workflow</Badge>}
      />
      <nav
        className="stepper journey-steps"
        aria-label="Reconciliation progress"
      >
        {["Source files", "Field mapping", "Matching", "Results dashboard"].map(
          (label, index) => (
            <button
              key={label}
              disabled={index > step || stage >= 0}
              onClick={() => setStep(index)}
              className={step === index ? "active" : step > index ? "done" : ""}
              aria-current={step === index ? "step" : undefined}
            >
              <span>{step > index ? <Check size={15} /> : index + 1}</span>
              {label}
            </button>
          ),
        )}
      </nav>
      {step === 0 && (
        <Panel
          title="Add the files you want to compare"
          detail="Explore the upload layout with two synthetic CSV files. Customer uploads are not enabled."
        >
          <div className="upload-pair">
            {["Bank statement", "General ledger"].map((name, index) => (
              <div
                className={`upload-target ${files[index] ? "prepared" : ""}`}
                key={name}
              >
                <div className="upload-label">
                  <span className="eyebrow">SOURCE {index ? "B" : "A"}</span>
                  {files[index] && <Badge tone="green">Sample selected</Badge>}
                </div>
                <span className="upload-illustration">
                  {files[index] ? (
                    <FileSpreadsheet size={28} />
                  ) : (
                    <UploadCloud size={28} />
                  )}
                </span>
                <h3>{name}</h3>
                <p>
                  {files[index]
                    ? `${index ? "ledger" : "bank"}-september.csv`
                    : "Add a source file for this side"}
                </p>
                {files[index] ? (
                  <div className="file-facts">
                    <span>10 records</span>
                    <span>4 fields</span>
                    <span>INR</span>
                  </div>
                ) : (
                  <p className="field-help">Planned formats: CSV & XLSX</p>
                )}
                <button
                  className={`button ${files[index] ? "secondary" : "primary"}`}
                  onClick={() =>
                    setFiles((current) =>
                      current.map((selected, i) =>
                        i === index ? true : selected,
                      ),
                    )
                  }
                  disabled={files[index]}
                >
                  {files[index] ? (
                    <>
                      <Check size={15} />
                      Ready to map
                    </>
                  ) : (
                    `Use sample ${index ? "ledger" : "bank"} file`
                  )}
                </button>
              </div>
            ))}
          </div>
          <div className="form-footer">
            <p>
              Preview only. These files are included samples; nothing is
              uploaded.
            </p>
            <button
              className="button primary"
              disabled={!files.every(Boolean)}
              onClick={() => setStep(1)}
            >
              Continue to mapping
              <ArrowRight size={16} />
            </button>
          </div>
        </Panel>
      )}
      {step === 1 && (
        <Panel
          title="Confirm the fields in each file"
          detail="Map references, dates, amounts and currencies before matching."
        >
          <div className="mapping-pair">
            {["Bank statement", "General ledger"].map((name, source) => (
              <div className="journey-mapping" key={name}>
                <h3>
                  <FileSpreadsheet size={18} />
                  {name}
                </h3>
                {fields.map((field, index) => (
                  <label key={field}>
                    <span>
                      {
                        [
                          "Reference",
                          "Transaction date",
                          "Signed amount",
                          "Currency",
                        ][index]
                      }
                    </span>
                    <select
                      aria-label={`${name} ${field}`}
                      value={mapping[source * 4 + index]}
                      onChange={(event) =>
                        setMapping((current) =>
                          current.map((value, i) =>
                            i === source * 4 + index
                              ? event.target.value
                              : value,
                          ),
                        )
                      }
                    >
                      <option value="">Select column</option>
                      {fields.map((column) => (
                        <option key={column}>{column}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            ))}
          </div>
          <div className="journey-check" role="status">
            {valid ? (
              <>
                <Check size={16} />
                All 8 required fields match the sample schema.
              </>
            ) : (
              "Some fields are missing or incompatible. Correct the mappings to continue."
            )}
          </div>
          <div className="form-footer">
            <button className="button secondary" onClick={() => setStep(0)}>
              <ArrowLeft size={15} />
              Back
            </button>
            <button
              className="button primary"
              disabled={!valid}
              onClick={() => setStep(2)}
            >
              Continue to matching
              <ArrowRight size={16} />
            </button>
          </div>
        </Panel>
      )}
      {step === 2 && (
        <Panel
          title="Choose your matching method"
          detail="Configured rules are available in this sample. AI-assisted interpretation is a future phase."
        >
          <div className="matching-methods">
            <div className="method-selected">
              <GitCompareArrows size={24} />
              <div>
                <h3>Configured rules</h3>
                <p>Exact references, signed amounts, currency and date.</p>
              </div>
              <Badge tone="green">Sample method</Badge>
            </div>
            <div className="method-disabled" aria-disabled="true">
              <Sparkles size={24} />
              <div>
                <h3>AI-assisted reconciliation</h3>
                <p>Interpret file layouts and propose matching rules.</p>
              </div>
              <Badge>Not connected</Badge>
            </div>
          </div>
          <div className="policy-strip">
            <span>One-to-one matching</span>
            <span>Same transaction date</span>
            <span>INR · Zero tolerance</span>
            <span>Ambiguity stays open</span>
          </div>
          {stage >= 0 && (
            <div className="run-stages" role="status" aria-live="polite">
              <LoaderCircle size={19} />
              <div>
                <strong>{stages[stage]}</strong>
                <p>Local UI simulation · No backend job or AI request</p>
              </div>
              <progress
                value={stage + 1}
                max={stages.length}
                aria-label="Sample preview progress"
              />
            </div>
          )}
          <div className="form-footer">
            <p>
              Preview uses precomputed fixture outcomes, not live
              reconciliation.
            </p>
            <button
              className="button primary"
              disabled={stage >= 0}
              onClick={() => setStage(0)}
            >
              {stage >= 0 ? "Preparing sample…" : "Run sample preview"}
              <ArrowRight size={16} />
            </button>
          </div>
        </Panel>
      )}
      {step === 3 && (
        <>
          <div className="journey-result-heading">
            <span className="empty-icon">
              <Check size={25} />
            </span>
            <div>
              <h2>Your sample dashboard is ready</h2>
              <p>Bank statement vs. general ledger · 1–12 Sep 2026 · INR</p>
            </div>
            <Badge tone="blue">Synthetic results</Badge>
          </div>
          <div className="metrics">
            {[
              ["Source records", counts.total, "10 bank + 10 ledger"],
              ["Matched records", counts.matched, "8 exact candidate pairs"],
              ["Needs review", counts.review, "1 amount difference"],
              ["Unmatched", counts.unmatched, "2 missing counterparts"],
            ].map(([label, count, detail]) => (
              <section className="metric" key={label}>
                <div>{label}</div>
                <strong>{count}</strong>
                <small>{detail}</small>
              </section>
            ))}
          </div>
          <Panel
            title="Results by source"
            detail="Exact INR totals from the included sample. No balances posted."
          >
            <div className="source-balances journey-balances">
              <div>
                <span>Bank statement · {counts.bank} records</span>
                <strong>{formatAmount(counts.bankAmount)}</strong>
              </div>
              <div>
                <span>General ledger · {counts.ledger} records</span>
                <strong>{formatAmount(counts.ledgerAmount)}</strong>
              </div>
            </div>
            <div className="journey-result-links">
              <Link className="result-action" to="/app/overview">
                <span>
                  <strong>Open full dashboard</strong>
                  <small>
                    Source totals, matching status and review workload
                  </small>
                </span>
                <ArrowRight size={19} />
              </Link>
              <Link className="result-action" to="/app/reconciliation">
                <span>
                  <strong>Inspect matched records</strong>
                  <small>Compare amounts and open source evidence</small>
                </span>
                <ArrowRight size={19} />
              </Link>
              <Link className="result-action" to="/app/exceptions">
                <span>
                  <strong>Review unmatched & differences</strong>
                  <small>3 open items across 4 source records</small>
                </span>
                <ArrowRight size={19} />
              </Link>
            </div>
          </Panel>
          <div className="page-note">
            <ShieldCheck size={16} />
            Sample candidate results are not accepted allocations or a completed
            production run.
          </div>
        </>
      )}
    </>
  );
}
