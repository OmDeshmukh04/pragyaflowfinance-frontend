import { describe, expect, it } from "vitest";
import { createDemo, proposeDecision, approveDecision, summary } from "./model";
import { decimalUnits, formatAmount, difference } from "../lib/money";

describe("exact decimal display", () => {
  it("preserves all digits beyond JS safe integers", () => {
    expect(formatAmount("12345678901234567890.12345678")).toBe(
      "₹1,23,45,67,89,01,23,45,67,890.12345678",
    );
    expect(difference("9007199254740993.01", "9007199254740993.00")).toBe(
      "0.01",
    );
  });
  it.each(["1e3", "NaN", "12,00", "1.123456789", "--3", "Infinity"])(
    "rejects invalid decimal %s",
    (value) => {
      expect(() => decimalUnits(value)).toThrow();
    },
  );
  it("formats negative, zero and missing values", () => {
    expect(formatAmount("-1200.5")).toBe("−₹1,200.50");
    expect(formatAmount("0")).toBe("₹0.00");
    expect(formatAmount(null)).toBe("—");
  });
});

describe("isolated demo decisions", () => {
  it("accounts for all sample records on both sides", () => {
    expect(summary(createDemo().rows)).toMatchObject({
      bank: 10,
      ledger: 10,
      matched: 16,
      review: 2,
      unmatched: 2,
      total: 20,
    });
  });
  it("proposes without changing accepted balances and prevents duplicate requests", () => {
    const state = createDemo();
    const next = proposeDecision(
      state,
      "TX-1001",
      "accept",
      "References and amounts agree.",
      "operator",
    );
    expect(next.rows).toEqual(state.rows);
    expect(next.decisions[0].state).toBe("proposed");
    expect(() =>
      proposeDecision(next, "TX-1001", "accept", "Duplicate.", "operator"),
    ).toThrow("pending");
  });
  it("prevents self-approval and refuses stale versions", () => {
    const state = proposeDecision(
      createDemo(),
      "TX-1001",
      "accept",
      "Checked source rows.",
      "operator",
    );
    expect(() =>
      approveDecision(state, state.decisions[0].id, "operator"),
    ).toThrow("different");
    expect(() =>
      approveDecision(
        { ...state, version: 2 },
        state.decisions[0].id,
        "approver",
      ),
    ).toThrow("changed");
    expect(
      approveDecision(state, state.decisions[0].id, "approver").version,
    ).toBe(2);
  });
  it("blocks accepting differences, missing records and blank reasons", () => {
    const state = createDemo();
    expect(() =>
      proposeDecision(
        state,
        "TX-1009",
        "accept",
        "Accept difference.",
        "operator",
      ),
    ).toThrow("exact");
    expect(() =>
      proposeDecision(state, "TX-1010", "accept", "Missing bank.", "operator"),
    ).toThrow("exact");
    expect(() =>
      proposeDecision(state, "TX-1001", "accept", " ", "operator"),
    ).toThrow("reason");
  });
});
