import { describe, expect, it } from "vitest";
import { formatMoney } from "./format-money";

describe("formatMoney", () => {
  it("converts minor units to a formatted NGN amount", () => {
    expect(formatMoney(1500000)).toBe("₦15,000");
  });

  it("keeps decimals when the amount isn't a whole currency unit", () => {
    expect(formatMoney(1050)).toBe("₦10.50");
  });

  it("handles zero", () => {
    expect(formatMoney(0)).toBe("₦0");
  });

  it("respects an explicit currency", () => {
    // en-NG disambiguates USD as "US$" alongside Naira, rather than a bare "$".
    expect(formatMoney(100000, "USD")).toBe("US$1,000");
  });
});
