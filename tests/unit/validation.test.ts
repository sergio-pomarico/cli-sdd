import { describe, expect, it } from "vitest";

import {
  parsePriority,
  parseStatus,
  parseTaskId,
  parseTitle,
  parseUpdateFields,
} from "../../src/utils/validation.js";

describe("parseTaskId", () => {
  it("accepts positive safe base-10 integers", () => {
    expect(parseTaskId("42")).toBe(42);
    expect(parseTaskId(String(Number.MAX_SAFE_INTEGER))).toBe(Number.MAX_SAFE_INTEGER);
  });

  it.each(["", "0", "-1", "1.5", "01", "1x", String(Number.MAX_SAFE_INTEGER + 1)])(
    "rejects %j",
    (value) => {
      expect(() => parseTaskId(value)).toThrow(/positive integer/i);
    },
  );
});

describe("parseTitle", () => {
  it("trims a valid title", () => {
    expect(parseTitle("  Write tests  ")).toBe("Write tests");
  });

  it.each(["", "   "])("rejects an empty title", (value) => {
    expect(() => parseTitle(value)).toThrow(/non-whitespace/i);
  });
});

describe("enum parsers", () => {
  it.each(["high", "medium", "low"] as const)("accepts priority %s", (priority) => {
    expect(parsePriority(priority)).toBe(priority);
  });

  it("defaults an omitted creation priority to medium", () => {
    expect(parsePriority(undefined)).toBe("medium");
  });

  it("lists accepted priorities in its error", () => {
    expect(() => parsePriority("urgent")).toThrow(/high, medium, or low/i);
  });

  it.each(["todo", "in-progress", "done"] as const)("accepts status %s", (status) => {
    expect(parseStatus(status)).toBe(status);
  });

  it("lists accepted statuses in its error", () => {
    expect(() => parseStatus("blocked")).toThrow(/todo, in-progress, or done/i);
  });
});

describe("parseUpdateFields", () => {
  it("normalizes supplied fields and retains omissions", () => {
    expect(parseUpdateFields({ title: "  Revised  ", description: "", priority: "low" })).toEqual(
      {
        title: "Revised",
        description: null,
        priority: "low",
      },
    );
    expect(parseUpdateFields({ description: "Keep details" })).toEqual({
      description: "Keep details",
    });
  });

  it("rejects an update with no editable fields", () => {
    expect(() => parseUpdateFields({})).toThrow(/at least one/i);
  });
});
