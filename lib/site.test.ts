import { describe, expect, it } from "vitest";
import { cleanHtml } from "./site";

describe("cleanHtml", () => {
  it("turns &nbsp; into wrappable spaces and keeps paragraph markup", () => {
    expect(cleanHtml("<p>A&nbsp;stretch&nbsp;&nbsp;bracelet.</p><p>&nbsp;</p><p>Hand&#160;set.</p>")).toBe(
      "<p>A stretch bracelet.</p><p>Hand set.</p>"
    );
  });

  it("returns an empty string for a missing description", () => {
    expect(cleanHtml(null)).toBe("");
  });
});
