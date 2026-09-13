import { decimalUnits, decimalString } from "../lib/money";

export type Actor = "operator" | "approver";
export type RowStatus = "matched" | "review" | "unmatched";
export type DemoRow = {
  id: string;
  entity: string;
  date: string;
  bank: string | null;
  ledger: string | null;
  status: RowStatus;
  reason: string;
  bankRow: number | null;
  ledgerRow: number | null;
};
export type Decision = {
  id: string;
  rowId: string;
  action: "accept" | "reject";
  reason: string;
  proposer: Actor;
  state: "proposed" | "approved";
  runVersion: number;
  approver?: Actor;
};
export type DemoState = {
  rows: DemoRow[];
  decisions: Decision[];
  version: number;
  events: string[];
};

export function createDemo(): DemoState {
  const exact = [
    ["Aster Commerce", "24800.00"],
    ["Northstar Supply", "18450.00"],
    ["Cedar Retail", "12600.00"],
    ["Orbit Services", "36000.00"],
    ["Aster Commerce", "8750.50"],
    ["Elm Distribution", "42300.00"],
    ["Northstar Supply", "15750.00"],
    ["Cedar Retail", "21990.25"],
  ];
  const rows: DemoRow[] = exact.map(([entity, amount], index) => ({
    id: `TX-${1001 + index}`,
    entity,
    date: `2026-09-${String(index + 1).padStart(2, "0")}`,
    bank: amount,
    ledger: amount,
    status: "matched",
    reason: "Reference + exact amount",
    bankRow: index + 2,
    ledgerRow: index + 2,
  }));
  rows.push(
    {
      id: "TX-1009",
      entity: "Orbit Services",
      date: "2026-09-09",
      bank: "24500.00",
      ledger: "25000.00",
      status: "review",
      reason: "Amount difference",
      bankRow: 10,
      ledgerRow: 10,
    },
    {
      id: "TX-1010",
      entity: "Elm Distribution",
      date: "2026-09-10",
      bank: null,
      ledger: "6800.00",
      status: "unmatched",
      reason: "Missing bank entry",
      bankRow: null,
      ledgerRow: 11,
    },
    {
      id: "TX-1011",
      entity: "Aster Commerce",
      date: "2026-09-11",
      bank: "9200.00",
      ledger: null,
      status: "unmatched",
      reason: "Missing ledger entry",
      bankRow: 11,
      ledgerRow: null,
    },
  );
  return {
    rows,
    decisions: [],
    version: 1,
    events: [
      "Sample run prepared · 20 source records",
      "Field mapping validated · 4 required fields",
      "Bank and ledger samples loaded",
    ],
  };
}

export function summary(rows: DemoRow[]) {
  const bank = rows.filter((row) => row.bank !== null).length;
  const ledger = rows.filter((row) => row.ledger !== null).length;
  const count = (status: RowStatus) =>
    rows
      .filter((row) => row.status === status)
      .reduce(
        (total, row) =>
          total + Number(row.bank !== null) + Number(row.ledger !== null),
        0,
      );
  const total = (side: "bank" | "ledger") =>
    decimalString(
      rows.reduce((sum, row) => sum + decimalUnits(row[side] ?? "0"), 0n),
    );
  return {
    bank,
    ledger,
    total: bank + ledger,
    matched: count("matched"),
    review: count("review"),
    unmatched: count("unmatched"),
    bankAmount: total("bank"),
    ledgerAmount: total("ledger"),
  };
}

export function proposeDecision(
  state: DemoState,
  rowId: string,
  action: Decision["action"],
  reason: string,
  actor: Actor,
): DemoState {
  const row = state.rows.find((item) => item.id === rowId);
  if (!row) throw new Error("The record is no longer available.");
  if (reason.trim().length < 5)
    throw new Error("Enter a review reason of at least 5 characters.");
  if (
    state.decisions.some(
      (item) =>
        item.rowId === rowId &&
        (item.state === "approved" || item.runVersion === state.version),
    )
  )
    throw new Error("A review is already approved or pending for this record.");
  if (
    action === "accept" &&
    (row.bank === null ||
      row.ledger === null ||
      decimalUnits(row.bank) !== decimalUnits(row.ledger))
  )
    throw new Error("Only exact pairs can be accepted in this demo.");
  const decision: Decision = {
    id: `D-${state.decisions.length + 1}`,
    rowId,
    action,
    reason: reason.trim(),
    proposer: actor,
    state: "proposed",
    runVersion: state.version,
  };
  return {
    ...state,
    decisions: [decision, ...state.decisions],
    events: [`Review proposed · ${rowId} · ${actor}`, ...state.events],
  };
}

export function approveDecision(
  state: DemoState,
  id: string,
  actor: Actor,
): DemoState {
  const decision = state.decisions.find((item) => item.id === id);
  if (!decision || decision.state !== "proposed")
    throw new Error("This proposal is no longer pending.");
  if (actor === decision.proposer)
    throw new Error("A different reviewer must approve this proposal.");
  if (actor !== "approver")
    throw new Error("Switch to the demo approver to review this proposal.");
  if (decision.runVersion !== state.version)
    throw new Error(
      "The run changed. Re-open the record and submit a new proposal.",
    );
  return {
    ...state,
    version: state.version + 1,
    decisions: state.decisions.map((item) =>
      item.id === id ? { ...item, state: "approved", approver: actor } : item,
    ),
    events: [`Review approved in demo · ${decision.rowId}`, ...state.events],
  };
}
