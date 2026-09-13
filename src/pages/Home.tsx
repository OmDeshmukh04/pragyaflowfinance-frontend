import { useEffect } from "react";
import {
  ArrowRight,
  CheckCheck,
  FileInput,
  GitCompareArrows,
  ListFilter,
  Play,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Brand } from "../components/ui";
import walkthrough from '../../scripts/walkthrough.json';

export default function Home() {
  useEffect(() => {
    document.title = "PragyaFlow Finance — A clearer way to reconcile";
  }, []);
  return (
    <div className="product-home">
      <a className="skip-link" href="#product-main">
        Skip to content
      </a>
      <header className="product-nav">
        <Brand />
        <nav aria-label="Product navigation">
          <a href="#process">Workflow</a>
          <a href="#walkthrough">Product tour</a>
          <a href="https://pragyaflow.in" target="_blank" rel="noreferrer">
            Company
          </a>
        </nav>
        <Link className="button primary" to="/app/overview">
          Open demo
          <ArrowRight size={16} />
        </Link>
      </header>
      <main id="product-main">
        <section className="product-hero">
          <div className="hero-copy">
            <span className="product-kicker">
              <span className="demo-dot" />
              PRAGYAFLOW FINANCE · PRODUCT PREVIEW
            </span>
            <h1>
              Every transaction.
              <br />
              <span>A clear outcome.</span>
            </h1>
            <p>
              Match bank and ledger records. Review differences.
              <br className="desktop-only" /> Keep every decision connected to
              its source.
            </p>
            <div className="hero-actions">
              <Link to="/app/overview" className="button primary large">
                Explore the workspace
                <ArrowRight size={17} />
              </Link>
              <a href="#walkthrough" className="button secondary large">
                <Play size={15} />
                Watch the workflow
              </a>
            </div>
            <div className="hero-facts">
              <span>
                <CheckCheck size={15} />
                Exact matching
              </span>
              <span>
                <ShieldCheck size={15} />
                Controlled review
              </span>
              <span>
                <FileInput size={15} />
                Source evidence
              </span>
            </div>
          </div>
          <div
            className="hero-product"
            aria-label="Illustrative reconciliation preview with sample data"
          >
            <div className="hero-product-header">
              <span className="mini-brand">
                <span className="brand-mark" />
                PragyaFlow Finance
              </span>
              <span className="demo-pill">Sample</span>
            </div>
            <div className="hero-product-content">
              <div className="hero-card-title">
                <span>Bank vs. general ledger</span>
                <span className="badge green">
                  <CheckCheck size={12} />8 exact pairs
                </span>
              </div>
              <div className="hero-source-pair">
                <div>
                  <span className="source-symbol blue">B</span>
                  <strong>Bank statement</strong>
                  <span>10 source records</span>
                </div>
                <span className="connection-symbol">
                  <GitCompareArrows size={24} />
                </span>
                <div>
                  <span className="source-symbol teal">L</span>
                  <strong>General ledger</strong>
                  <span>10 source records</span>
                </div>
              </div>
              <div className="hero-mini-table">
                <div>
                  <span>REFERENCE</span>
                  <span>STATUS</span>
                  <span>AMOUNT · INR</span>
                </div>
                {[
                  ["TX-1001", "Matched", "24,800.00"],
                  ["TX-1002", "Matched", "18,450.00"],
                  ["TX-1009", "Needs review", "24,500.00"],
                ].map(([reference, status, amount]) => (
                  <div key={reference}>
                    <strong>{reference}</strong>
                    <span
                      className={
                        status === "Matched" ? "mini-matched" : "mini-review"
                      }
                    >
                      {status}
                    </span>
                    <strong>{amount}</strong>
                  </div>
                ))}
              </div>
              <div className="hero-evidence">
                <ShieldCheck size={17} />
                <span>Original values. Traceable decisions.</span>
                <ArrowRight size={15} />
              </div>
            </div>
          </div>
        </section>
        <section id="process" className="product-process">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ONE CONNECTED WORKFLOW</span>
              <h2>From source files to reviewed results.</h2>
            </div>
            <p>
              Four focused steps.
              <br />A consistent view of the work.
            </p>
          </div>
          <div className="process-grid">
            {[
              {
                Icon: FileInput,
                title: "Import records",
                text: "Bring bank and ledger files together.",
              },
              {
                Icon: ListFilter,
                title: "Map your fields",
                text: "Set references, dates and amounts.",
              },
              {
                Icon: GitCompareArrows,
                title: "Review results",
                text: "Inspect matches and resolve differences.",
              },
              {
                Icon: ShieldCheck,
                title: "Approve decisions",
                text: "Keep review and approval separate.",
              },
            ].map(({ Icon, title, text }, index) => (
              <Link
                to={
                  [
                    "/app/imports",
                    "/app/mapping",
                    "/app/reconciliation",
                    "/app/approvals",
                  ][index]
                }
                key={title}
                className="process-step"
              >
                <div>
                  <span className="process-icon">
                    <Icon size={22} />
                  </span>
                  <span>0{index + 1}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
                <ArrowRight size={17} className="process-arrow" />
              </Link>
            ))}
          </div>
        </section>
        <section id="walkthrough" className="product-walkthrough">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SEE THE WORKSPACE</span>
              <h2>A complete sample walkthrough.</h2>
            </div>
            <Link className="button secondary" to="/app/overview">
              Try it yourself
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="video-frame">
            <div className="video-top">
              <span>
                <span className="demo-dot" />
                PragyaFlow Finance · Workflow tour
              </span>
              <span>Synthetic data</span>
            </div>
            <video
              controls
              playsInline
              preload="metadata"
              poster="/media/workflow-poster.png"
              aria-label="PragyaFlow Finance sample workflow video"
            >
              <source src="/media/workflow-demo.webm" type="video/webm" />
              <track
                kind="captions"
                src="/media/workflow-captions.vtt"
                srcLang="en"
                label="English"
                default
              />
              Your browser cannot play this video. Use the interactive demo
              below.
            </video>
          </div>
          <div className="video-caption">
            <span>
              Original recording of this product preview. No customer data or
              live processing.
            </span>
            <Link to="/app/new-reconciliation">
              Open interactive walkthrough
              <ArrowRight size={14} />
            </Link>
          </div>
          <details className="transcript">
            <summary>Read the walkthrough transcript</summary>
            <ol>
              {walkthrough.map(scene => <li key={scene.id}>{scene.narration}</li>)}
            </ol>
          </details>
        </section>
        <section className="home-final">
          <span className="brand-mark" />
          <div>
            <h2>Bring clarity to your reconciliation.</h2>
            <p>
              Explore the workflow with synthetic records. No account required.
            </p>
          </div>
          <Link className="button primary" to="/app/overview">
            Open the demo
            <ArrowRight size={16} />
          </Link>
        </section>
      </main>
      <footer className="product-footer">
        <Brand compact />
        <span>© 2026 PragyaFlow · Finance product preview</span>
        <a href="https://pragyaflow.in" target="_blank" rel="noreferrer">
          pragyaflow.in ↗
        </a>
      </footer>
    </div>
  );
}
