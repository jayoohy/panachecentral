import { describe, expect, it } from "vitest";
import { RAILS, parseProductSort, railQueryString } from "./product-rails";

describe("parseProductSort", () => {
  it("accepts documented sorts only (§5.2)", () => {
    expect(parseProductSort("newest")).toBe("newest");
    expect(parseProductSort("best_selling")).toBe("best_selling");
    expect(parseProductSort("popular")).toBeUndefined();
    expect(parseProductSort(null)).toBeUndefined();
  });
});

describe("railQueryString (PRD R6)", () => {
  it("builds one capped query per rail", () => {
    expect(railQueryString(RAILS.featured)).toBe("pageSize=10&featured=true");
    expect(railQueryString(RAILS["new-arrivals"])).toBe(
      "pageSize=10&sort=newest",
    );
    expect(railQueryString(RAILS["best-sellers"])).toBe(
      "pageSize=10&sort=best_selling",
    );
  });
});
