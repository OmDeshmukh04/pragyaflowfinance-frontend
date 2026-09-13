// Decimal strings remain authoritative. BigInt is used only for exact demo
// arithmetic; production totals and permissions must come from the server.
const SCALE = 100_000_000n;
export function decimalUnits(value: string): bigint {
  if (!/^-?(0|[1-9]\d{0,19})(\.\d{1,8})?$/.test(value))
    throw new Error("Invalid decimal amount");
  const [whole, fraction = ""] = value.replace("-", "").split(".");
  return (
    (BigInt(whole) * SCALE + BigInt(fraction.padEnd(8, "0"))) *
    (value.startsWith("-") ? -1n : 1n)
  );
}
export function decimalString(units: bigint): string {
  const absolute = units < 0n ? -units : units;
  const fraction = (absolute % SCALE)
    .toString()
    .padStart(8, "0")
    .replace(/0+$/, "")
    .padEnd(2, "0");
  return `${units < 0n ? "-" : ""}${absolute / SCALE}.${fraction}`;
}
export function difference(a: string, b: string): string {
  return decimalString(decimalUnits(a) - decimalUnits(b));
}
export function formatAmount(value: string | null, currency = "INR"): string {
  if (value === null) return "—";
  decimalUnits(value);
  const [whole, fraction = ""] = value.replace("-", "").split(".");
  const last = whole.slice(-3);
  const leading = whole.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${value.startsWith("-") ? "−" : ""}${currency === "INR" ? "₹" : currency + " "}${leading ? leading + "," : ""}${last}.${fraction.padEnd(2, "0")}`;
}
