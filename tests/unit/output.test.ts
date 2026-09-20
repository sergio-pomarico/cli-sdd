import { describe, expect, it } from "vitest";

import { formatCreatedAt, formatTaskTable } from "../../src/utils/output.js";

describe("formatCreatedAt", () => {
  it("uses stable local YYYY-MM-DD HH:mm formatting", () => {
    expect(formatCreatedAt(new Date(2026, 8, 2, 4, 5))).toBe("2026-09-02 04:05");
  });
});

describe("formatTaskTable", () => {
  it("shows full values without relying on color", () => {
    const title = "A complete title that remains readable even when it wraps in the table";
    const output = formatTaskTable([
      {
        id: 9,
        title,
        status: "in-progress",
        priority: "high",
        createdAt: new Date(2026, 8, 2, 4, 5),
      },
    ]);

    expect(output).toContain("A complete title that remains readable");
    expect(output).toContain("even when it wraps in the table");
    expect(output).toContain("in-progress");
    expect(output).toContain("high");
    expect(output).toContain("2026-09-02 04:05");
    expect(output).not.toMatch(/\u001b\[/);
  });

  it("returns the empty-state message", () => {
    expect(formatTaskTable([])).toBe("No tasks found.");
  });
});
