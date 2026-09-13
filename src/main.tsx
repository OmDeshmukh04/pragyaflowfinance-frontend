import { StrictMode, Component, type ReactNode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "./styles.css";
import { DemoProvider } from "./demo/context";
import Layout from "./components/Layout";
import Overview from "./pages/Overview";
import NewReconciliation from "./pages/NewReconciliation";
import Reconciliation from "./pages/Reconciliation";
import { Imports, Mapping, Workflows } from "./pages/Preparation";
import { Approvals, Audit, Settings } from "./pages/Review";
import { EmptyState } from "./components/ui";

const Home = lazy(() => import("./pages/Home"));
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="fatal-error">
        <h1>The workspace could not load</h1>
        <p>
          Reload to restart this sample session. Unsaved demo changes will
          reset.
        </p>
        <button
          className="button primary"
          onClick={() => window.location.reload()}
        >
          Reload workspace
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <DemoProvider>
          <Suspense
            fallback={
              <div className="loading-state" role="status">
                Loading PragyaFlow Finance…
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/app" element={<Layout />}>
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<Overview />} />
                <Route
                  path="new-reconciliation"
                  element={<NewReconciliation />}
                />
                <Route path="imports" element={<Imports />} />
                <Route path="mapping" element={<Mapping />} />
                <Route path="workflows" element={<Workflows />} />
                <Route path="reconciliation" element={<Reconciliation />} />
                <Route
                  path="exceptions"
                  element={<Reconciliation exceptionsOnly />}
                />
                <Route path="approvals" element={<Approvals />} />
                <Route path="audit" element={<Audit />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route
                path="*"
                element={
                  <EmptyState
                    title="Page not found"
                    text="This page is not part of the finance workspace."
                  >
                    <Link className="button primary" to="/app/overview">
                      Open overview
                    </Link>
                  </EmptyState>
                }
              />
            </Routes>
          </Suspense>
        </DemoProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
